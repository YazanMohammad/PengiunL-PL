using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.TestHost;
using Microsoft.Extensions.Logging;
using PenguinLauncher.Hosting;

namespace PenguinLauncher.Tests.Fixtures;

public sealed class ApiBoundaryFixture : IAsyncDisposable
{
    private readonly WebApplication _app;
    private int _handlerCalls;

    private ApiBoundaryFixture(WebApplication app, HttpClient client)
    {
        _app = app;
        Client = client;
    }

    public HttpClient Client { get; }
    public int HandlerCalls => _handlerCalls;

    public static async Task<ApiBoundaryFixture> CreateAsync(ApiSessionPolicy policy)
    {
        var builder = WebApplication.CreateBuilder(new WebApplicationOptions
        {
            Args = [],
            ContentRootPath = AppContext.BaseDirectory
        });
        builder.WebHost.UseTestServer();
        builder.Logging.ClearProviders();
        var app = builder.Build();
        ApiBoundaryFixture? fixture = null;
        app.UseLocalApiBoundary(policy);
        // Match Program's boundary-before-exception-handler composition.
        app.UseExceptionHandler(errorApp => errorApp.Run(async context =>
        {
            context.Response.StatusCode = StatusCodes.Status500InternalServerError;
            context.Response.Headers.Vary = "Accept-Encoding";
            var error = context.Features.Get<Microsoft.AspNetCore.Diagnostics.IExceptionHandlerPathFeature>()?.Error;
            await context.Response.WriteAsJsonAsync(new { error = error?.Message });
        }));
        string[] getRoutes = ["/api/games/", "/api/accounts/", "/api/accounts/{platform}",
            "/api/launch/preflight/{gameId}", "/api/system/info", "/api/health"];
        string[] postRoutes = ["/api/games/scan", "/api/accounts/map", "/api/accounts/swap",
            "/api/accounts/add", "/api/accounts/capture", "/api/accounts/logout/{platform}",
            "/api/accounts/rename", "/api/launch/"];
        RequestDelegate handler = async context =>
        {
            Interlocked.Increment(ref fixture!._handlerCalls);
            // The boundary must enforce no-store even if a downstream handler overwrites it.
            context.Response.Headers.CacheControl = "public, max-age=3600";
            context.Response.Headers.Vary = "Accept-Encoding";
            await context.Response.WriteAsJsonAsync(new { synthetic = true });
        };
        foreach (var route in getRoutes)
            app.MapGet(route, handler);
        foreach (var route in postRoutes)
            app.MapPost(route, handler);
        app.MapDelete("/api/accounts/{id}", handler);
        app.MapGet("/api/synthetic-throw", (HttpContext context) =>
        {
            Interlocked.Increment(ref fixture!._handlerCalls);
            throw new InvalidOperationException("Synthetic handler failure.");
        });
        app.MapGet("/api/synthetic-error", async context =>
        {
            Interlocked.Increment(ref fixture!._handlerCalls);
            context.Response.StatusCode = StatusCodes.Status400BadRequest;
            context.Response.Headers.CacheControl = "public";
            await context.Response.WriteAsJsonAsync(new { error = "Synthetic validation." });
        });
        app.MapGet("/assets/test.js", async context =>
        {
            context.Response.Headers.CacheControl = "public, max-age=3600";
            context.Response.ContentType = "text/javascript";
            await context.Response.WriteAsync("/* synthetic static asset */");
        });
        // API fallback must also match file-like paths such as /api/unknown.json.
        // Retain the ordinary nonfile SPA fallback for non-API navigation.
        app.MapFallback("/api/{**path}", LocalApiBoundary.WriteApiNotFoundAsync);
        app.MapFallback(async context =>
        {
            if (LocalApiBoundary.IsApiPath(context.Request.Path))
                await LocalApiBoundary.WriteApiNotFoundAsync(context);
            else
            {
                context.Response.ContentType = "text/html";
                await context.Response.WriteAsync("<html>synthetic SPA</html>");
            }
        });
        HttpClient? client = null;
        try
        {
            await app.StartAsync();
            client = app.GetTestClient();
            client.BaseAddress = new Uri("http://localhost:5100");
            fixture = new ApiBoundaryFixture(app, client);
            return fixture;
        }
        catch
        {
            client?.Dispose();
            await app.DisposeAsync();
            throw;
        }
    }

    // Direct TestServer contexts preserve malformed headers which HttpClient parses,
    // normalizes, or drops before the application sees them.
    public async Task<HttpResponseMessage> SendRawAsync(Action<HttpContext> configure)
    {
        var context = await _app.GetTestServer().SendAsync(requestContext =>
        {
            requestContext.Request.Method = "GET";
            requestContext.Request.Path = "/api/health";
            requestContext.Request.Headers.Host = "localhost:5100";
            configure(requestContext);
        });
        var response = new HttpResponseMessage((System.Net.HttpStatusCode)context.Response.StatusCode)
        {
            Content = new StreamContent(context.Response.Body)
        };
        foreach (var header in context.Response.Headers)
        {
            if (!response.Headers.TryAddWithoutValidation(header.Key, header.Value.ToArray()))
                response.Content.Headers.TryAddWithoutValidation(header.Key, header.Value.ToArray());
        }
        return response;
    }

    public async ValueTask DisposeAsync()
    {
        Client.Dispose();
        await _app.DisposeAsync();
    }
}

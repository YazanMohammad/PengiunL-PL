using System.Runtime.CompilerServices;
using System.Text.Json.Serialization;
using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.TestHost;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Logging.Abstractions;
using PenguinLauncher.Endpoints;
using PenguinLauncher.Services.AccountSwapper;
using PenguinLauncher.Services.GameScanner;
using PenguinLauncher.Services.LaunchManager;
using PenguinLauncher.Services.Storage;

namespace PenguinLauncher.Tests.Fixtures;

public sealed class GuardApiFixture : IAsyncDisposable
{
    private readonly WebApplication _app;

    private GuardApiFixture(WebApplication app, HttpClient client,
        RejectingAccountSwapper swapper, JsonStorageService guardStorage)
    {
        _app = app;
        Client = client;
        Swapper = swapper;
        GuardStorage = guardStorage;
    }

    public HttpClient Client { get; }
    public RejectingAccountSwapper Swapper { get; }
    public JsonStorageService GuardStorage { get; }

    public static async Task<GuardApiFixture> CreateAsync()
    {
        var builder = WebApplication.CreateBuilder(new WebApplicationOptions
        {
            Args = [],
            ContentRootPath = AppContext.BaseDirectory
        });
        builder.WebHost.UseTestServer();
        builder.Logging.ClearProviders();
        builder.Services.ConfigureHttpJsonOptions(options =>
            options.SerializerOptions.Converters.Add(new JsonStringEnumConverter()));

        // Guard-only workaround: no constructor/field initializers run, so _lock
        // is null. Both storage methods fail at WaitAsync before their first I/O.
        // Replace this with isolated storage in the storage project; never reuse
        // this sentinel for successful persistence or launch tests. No static
        // AppData paths are modified, and no real state is inspected.
        var storage = (JsonStorageService)RuntimeHelpers.GetUninitializedObject(typeof(JsonStorageService));
        var swapper = new RejectingAccountSwapper();
        var accounts = new AccountSwapperService([swapper], NullLogger<AccountSwapperService>.Instance);
        var scanner = new GameScannerService([], accounts, storage, NullLogger<GameScannerService>.Instance);
        var launcher = new LaunchManagerService(scanner, accounts, storage, NullLogger<LaunchManagerService>.Instance);
        builder.Services.AddSingleton(storage);
        builder.Services.AddSingleton(accounts);
        builder.Services.AddSingleton(scanner);
        builder.Services.AddSingleton(launcher);

        var app = builder.Build();
        // Admit only the guard routes. Body validation belongs to the actual
        // handlers; this middleware can only reject requests with 404.
        app.Use((HttpContext context, RequestDelegate next) =>
        {
            if (HttpMethods.IsPost(context.Request.Method) && context.Request.Path.Value is
                "/api/accounts/map" or "/api/accounts/swap" or "/api/accounts/add" or
                "/api/accounts/capture" or "/api/accounts/rename" or "/api/launch/")
            {
                return next(context);
            }

            context.Response.StatusCode = StatusCodes.Status404NotFound;
            return Task.CompletedTask;
        });
        app.MapAccountEndpoints();
        app.MapLaunchEndpoints();
        try
        {
            await app.StartAsync();
            return new GuardApiFixture(app, app.GetTestClient(), swapper, storage);
        }
        catch
        {
            await app.DisposeAsync();
            throw;
        }
    }

    public async ValueTask DisposeAsync()
    {
        Client.Dispose();
        await _app.DisposeAsync();
    }
}

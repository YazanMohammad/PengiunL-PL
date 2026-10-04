using System.Net;
using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Connections;
using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Hosting.Server;
using Microsoft.AspNetCore.Http.Features;
using Microsoft.AspNetCore.Server.Kestrel.Core;
using Microsoft.AspNetCore.TestHost;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.DependencyInjection.Extensions;
using Microsoft.Extensions.Hosting;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Options;
using PenguinLauncher.Hosting;
using PenguinLauncher.Tests.Fixtures;
using Xunit;

namespace PenguinLauncher.Tests.Hosting;

public class LocalApiHostTests
{
    private const string Token = "AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA";
    private const string DevOrigin = "http://localhost:5173";

    // Validating the environment before checking the mode would break the offline CLI.
    [Fact]
    public void ScanOnly_DoesNotValidateHttpCredentials() => Assert.Null(
        LocalApiHost.CreateSessionPolicy(LaunchMode.ScanOnly, false, "invalid-token", "invalid-origin"));

    [Theory]
    [InlineData(LaunchMode.ServerOnly, false, null, null)]
    [InlineData(LaunchMode.ServerOnly, true, "invalid-token", "http://localhost:5173")]
    [InlineData(LaunchMode.ServerOnly, false, Token, "http://localhost:5173")]
    [InlineData(LaunchMode.Desktop, true, null, "http://localhost:5173")]
    public void InvalidHttpConfiguration_FailsBeforeStartup(LaunchMode mode,
        bool development, string? token, string? origin) => Assert.Throws<ArgumentException>(() =>
            LocalApiHost.CreateSessionPolicy(mode, development, token, origin));

    [Fact]
    public void ServerOnly_UsesExplicitCredentialAndDevelopmentOrigin()
    {
        var policy = LocalApiHost.CreateSessionPolicy(LaunchMode.ServerOnly, true, Token, DevOrigin);
        Assert.NotNull(policy);
        Assert.True(policy.IsAuthorized("Bearer " + Token));
        Assert.True(policy.IsAllowedOrigin(DevOrigin, "localhost:5100"));
    }

    [Fact]
    public void Desktop_GeneratesFreshCredentialDespiteConfiguredToken()
    {
        var first = LocalApiHost.CreateSessionPolicy(LaunchMode.Desktop, false, Token, null);
        var second = LocalApiHost.CreateSessionPolicy(LaunchMode.Desktop, false, Token, null);
        Assert.NotNull(first);
        Assert.NotNull(second);
        Assert.NotEqual(first.CreateBootstrapUri().Fragment, second.CreateBootstrapUri().Fragment);
        Assert.False(first.IsAuthorized("Bearer " + Token));
    }

    // Moving the callback onto StartAsync's continuation loses Photino's calling STA thread.
    [Theory]
    [InlineData(false)]
    [InlineData(true)]
    public async Task Desktop_WaitsForStartupThenLoadsOnCallingStaThread(bool development)
    {
        var gate = new StartupGate();
        await using var app = TestApp(gate);
        var policy = ApiSessionPolicy.Create(true, false, Token, null);
        var callbackCount = 0;
        var invocation = OnStaThread(() =>
        {
            var callerThread = Environment.CurrentManagedThreadId;
            LocalApiHost.StartDesktop(app, policy, development, (uri, devTools) =>
            {
                Interlocked.Increment(ref callbackCount);
                Assert.True(app.Lifetime.ApplicationStarted.IsCancellationRequested);
                Assert.Equal(callerThread, Environment.CurrentManagedThreadId);
                if (OperatingSystem.IsWindows())
                    Assert.Equal(ApartmentState.STA, Thread.CurrentThread.GetApartmentState());
                Assert.Equal(development, devTools);
                Assert.Equal("http://localhost:5100/", uri.GetLeftPart(UriPartial.Path));
                Assert.Equal("#penguin-session=" + Token, uri.Fragment);
            });
        });
        try
        {
            if (await Task.WhenAny(gate.Entered.Task, invocation) == invocation)
                await invocation;
            await gate.Entered.Task.WaitAsync(TimeSpan.FromSeconds(10));
            Assert.Equal(0, Volatile.Read(ref callbackCount));
            gate.Release.TrySetResult();
            await invocation.WaitAsync(TimeSpan.FromSeconds(10));
            Assert.Equal(1, callbackCount);
        }
        finally
        {
            gate.Release.TrySetResult();
            await app.StopAsync();
        }
    }

    [Fact]
    public async Task Desktop_FailedStartupDoesNotLoadWindow()
    {
        await using var app = FailingApp();
        var loaded = false;
        await OnStaThread(() =>
        {
            var error = Assert.Throws<InvalidOperationException>(() => LocalApiHost.StartDesktop(app,
                ApiSessionPolicy.Create(true, false, Token, null), false, (_, _) => loaded = true));
            Assert.Equal("Synthetic bind failure.", error.Message);
        });
        Assert.False(loaded);
        Assert.False(app.Lifetime.ApplicationStarted.IsCancellationRequested);
    }

    // Announcing before StartAsync, announcing twice, or returning before shutdown must fail.
    [Fact]
    public async Task Server_AnnouncesOnceAfterStartupAndWaitsForShutdown()
    {
        var gate = new StartupGate();
        await using var app = TestApp(gate);
        var lifetime = app.Lifetime;
        var announced = new TaskCompletionSource(TaskCreationOptions.RunContinuationsAsynchronously);
        var count = 0;
        var run = LocalApiHost.RunServerAsync(app, () =>
        {
            Assert.True(app.Lifetime.ApplicationStarted.IsCancellationRequested);
            Interlocked.Increment(ref count);
            announced.TrySetResult();
        });
        try
        {
            await gate.Entered.Task.WaitAsync(TimeSpan.FromSeconds(10));
            Assert.Equal(0, count);
            gate.Release.TrySetResult();
            await announced.Task.WaitAsync(TimeSpan.FromSeconds(10));
            Assert.False(run.IsCompleted);
            app.Lifetime.StopApplication();
            await run.WaitAsync(TimeSpan.FromSeconds(10));
            Assert.Equal(1, count);
            Assert.True(lifetime.ApplicationStopped.IsCancellationRequested);
        }
        finally
        {
            gate.Release.TrySetResult();
            await app.DisposeAsync();
        }
    }

    [Fact]
    public async Task Server_FailedStartupDoesNotAnnounceReadiness()
    {
        await using var app = FailingApp();
        var lifetime = app.Lifetime;
        var announced = false;
        var error = await Assert.ThrowsAsync<InvalidOperationException>(() =>
            LocalApiHost.RunServerAsync(app, () => announced = true));
        Assert.Equal("Synthetic bind failure.", error.Message);
        Assert.False(announced);
        Assert.False(lifetime.ApplicationStarted.IsCancellationRequested);
    }

    // Omitting helper-owned disposal must fail before caller cleanup runs.
    [Theory]
    [InlineData(false)]
    [InlineData(true)]
    public async Task Server_DisposesOwnedResourcesAfterShutdown(bool cancel)
    {
        var builder = Builder();
        builder.WebHost.UseTestServer();
        builder.Services.AddSingleton<OwnedResource>(_ => new OwnedResource());
        var app = builder.Build();
        var resource = app.Services.GetRequiredService<OwnedResource>();
        using var cancellation = new CancellationTokenSource();
        var ready = new TaskCompletionSource(TaskCreationOptions.RunContinuationsAsynchronously);
        var run = LocalApiHost.RunServerAsync(app, () => ready.TrySetResult(), cancellation.Token);
        try
        {
            await ready.Task.WaitAsync(TimeSpan.FromSeconds(10));
            Assert.Equal(0, resource.DisposeCalls);
            Assert.False(run.IsCompleted);
            if (cancel)
                cancellation.Cancel();
            else
                app.Lifetime.StopApplication();
            await run.WaitAsync(TimeSpan.FromSeconds(10));
            Assert.Equal(1, resource.DisposeCalls);
        }
        finally
        {
            cancellation.Cancel();
            try { await run; }
            finally { await app.DisposeAsync(); }
        }
    }

    [Fact]
    public async Task Server_DisposesOwnedResourcesOnStartupFailureAndPropagatesError()
    {
        var builder = Builder();
        builder.Services.AddSingleton<IServer, ThrowingServer>();
        builder.Services.AddSingleton<OwnedResource>(_ => new OwnedResource());
        var app = builder.Build();
        var resource = app.Services.GetRequiredService<OwnedResource>();
        var announced = false;
        try
        {
            var error = await Assert.ThrowsAsync<InvalidOperationException>(() =>
                LocalApiHost.RunServerAsync(app, () => announced = true));
            Assert.Equal("Synthetic bind failure.", error.Message);
            Assert.False(announced);
            Assert.Equal(1, resource.DisposeCalls);
        }
        finally
        {
            await app.DisposeAsync();
        }
    }

    // Serializing the exception (including inner errors) can expose a bootstrap credential.
    [Fact]
    public void StartupDiagnostics_DoNotDiscloseExceptionOrBootstrapCredential()
    {
        var uri = "http://localhost:5100/#penguin-session=" + Token;
        var error = new InvalidOperationException("Synthetic outer " + uri,
            new Exception("Synthetic inner " + Token));
        var diagnostic = LocalApiHost.FormatStartupFailure(error);
        Assert.False(string.IsNullOrWhiteSpace(diagnostic));
        Assert.DoesNotContain(Token, diagnostic);
        Assert.DoesNotContain(uri, diagnostic);
        Assert.DoesNotContain("Synthetic", diagnostic);
    }

    // A proxy's target Host does not authorize the browser Origin or forwarded spoof values.
    [Theory]
    [InlineData(true, "localhost:5100", DevOrigin, "evil.example:5100", true, 200)]
    [InlineData(true, "localhost:5100", "http://evil.example:5173", "localhost:5100", true, 403)]
    [InlineData(true, "evil.example:5100", DevOrigin, "localhost:5100", true, 403)]
    [InlineData(false, "localhost:5100", DevOrigin, "localhost:5100", true, 403)]
    [InlineData(true, "localhost:5100", DevOrigin, "evil.example:5100", false, 401)]
    [InlineData(true, "localhost:5100", DevOrigin, "localhost:5173", true, 200)]
    public async Task ProxiedBrowser_ValidatesActualHostOriginAndCredential(bool development,
        string host, string origin, string forwardedHost, bool authenticated, int status)
    {
        var policy = LocalApiHost.CreateSessionPolicy(LaunchMode.ServerOnly,
            development, Token, development ? DevOrigin : null);
        Assert.NotNull(policy);
        await using var fixture = await ApiBoundaryFixture.CreateAsync(policy);
        using var response = await fixture.SendRawAsync(context =>
        {
            context.Request.Headers.Host = host;
            context.Request.Headers.Origin = origin;
            context.Request.Headers["Sec-Fetch-Site"] = "cross-site";
            context.Request.Headers["X-Forwarded-Host"] = forwardedHost;
            context.Request.Headers["X-Forwarded-Proto"] = "https";
            context.Request.Headers["X-Forwarded-Origin"] = DevOrigin;
            context.Request.Headers["Forwarded"] = "host=localhost:5100;proto=http";
            if (authenticated)
                context.Request.Headers.Authorization = "Bearer " + Token;
        });
        Assert.Equal((HttpStatusCode)status, response.StatusCode);
        Assert.Equal(status == 200 ? 1 : 0, fixture.HandlerCalls);
        Assert.Equal("no-store", response.Headers.CacheControl?.ToString());
        if (status is 200 or 401)
            Assert.Equal(DevOrigin, response.Headers.GetValues("Access-Control-Allow-Origin").Single());
        if (status != 200)
        {
            var json = await response.Content.ReadAsStringAsync();
            Assert.Equal(status == 401 ? "{\"error\":\"Authentication required.\"}"
                : "{\"error\":\"Request not allowed.\"}", json);
        }
    }

    // Removing final Kestrel configuration must let hostile URLs/endpoints reach the transport.
    [Theory]
    [InlineData("command-line")]
    [InlineData("environment-config")]
    [InlineData("kestrel-config")]
    public async Task HostConfiguration_CannotAddNonLoopbackBindings(string source)
    {
        var builder = Builder(source == "command-line" ? ["--urls", "http://0.0.0.0:6200"] : []);
        var config = new Dictionary<string, string?>();
        if (source == "environment-config")
            config["urls"] = "http://0.0.0.0:6200;http://localhost:6201";
        if (source == "kestrel-config")
            config["Kestrel:Endpoints:Hostile:Url"] = "http://0.0.0.0:6200";
        builder.Configuration.AddInMemoryCollection(config);
        var transport = new RecordingConnectionListenerFactory();
        builder.Services.RemoveAll<IConnectionListenerFactory>();
        builder.Services.RemoveAll<IMultiplexedConnectionListenerFactory>();
        builder.Services.AddSingleton<IConnectionListenerFactory>(transport);
        LocalApiHost.ConfigureLoopback(builder);
        await using (var app = builder.Build())
        {
            await app.StartAsync();
            try
            {
                AssertLoopbackBindings(transport.Endpoints);
                var initialEndpoints = transport.Endpoints;
                var loader = app.Services.GetRequiredService<IOptions<KestrelServerOptions>>()
                    .Value.ConfigurationLoader;
                Assert.NotNull(loader);
                var listenerReloadToken = loader.Configuration.GetReloadToken();
                var hostReloadToken = ((IConfiguration)builder.Configuration).GetReloadToken();
                var listenerReloadCalls = 0;
                using var listenerSubscription = listenerReloadToken.RegisterChangeCallback(
                    _ => Interlocked.Increment(ref listenerReloadCalls), null);
                builder.Configuration["Kestrel:Endpoints:Hostile:Url"] = "http://0.0.0.0:6300";
                builder.Configuration["Kestrel:Endpoints:Additional:Url"] = "http://0.0.0.0:6301";
                builder.Configuration["urls"] = "http://0.0.0.0:6302";
                ((IConfigurationRoot)builder.Configuration).Reload();
                // Prove the host change actually fired, but cannot signal the active
                // Kestrel loader: no asynchronous processing delay is needed.
                Assert.True(hostReloadToken.HasChanged);
                Assert.False(listenerReloadToken.HasChanged);
                Assert.Equal(0, Volatile.Read(ref listenerReloadCalls));
                Assert.Null(loader.Configuration["Endpoints:Hostile:Url"]);
                Assert.Null(loader.Configuration["Endpoints:Additional:Url"]);
                AssertLoopbackBindings(transport.Endpoints);
                Assert.Equal(initialEndpoints, transport.Endpoints);
            }
            finally
            {
                await app.StopAsync();
            }
        }
        Assert.True(transport.AllListenersDisposed);
    }

    private static void AssertLoopbackBindings(EndPoint[] endpoints)
    {
        Assert.Equal(2, endpoints.Length);
        foreach (var endpoint in endpoints)
        {
            var ip = Assert.IsType<IPEndPoint>(endpoint);
            Assert.True(IPAddress.IsLoopback(ip.Address), "Binding must be loopback.");
            Assert.Equal(5100, ip.Port);
        }
        Assert.Contains(endpoints, endpoint => ((IPEndPoint)endpoint).Address.Equals(IPAddress.Loopback));
        Assert.Contains(endpoints, endpoint => ((IPEndPoint)endpoint).Address.Equals(IPAddress.IPv6Loopback));
    }

    private static WebApplicationBuilder Builder(string[]? args = null)
    {
        var builder = WebApplication.CreateBuilder(new WebApplicationOptions
        {
            Args = args ?? [],
            ContentRootPath = AppContext.BaseDirectory
        });
        builder.Logging.ClearProviders();
        return builder;
    }

    private static WebApplication TestApp(StartupGate gate)
    {
        var builder = Builder();
        builder.WebHost.UseTestServer();
        builder.Services.AddSingleton<IHostedService>(gate);
        return builder.Build();
    }

    private static WebApplication FailingApp()
    {
        var builder = Builder();
        builder.Services.AddSingleton<IServer, ThrowingServer>();
        return builder.Build();
    }

    private static Task OnStaThread(Action action)
    {
        var completion = new TaskCompletionSource(TaskCreationOptions.RunContinuationsAsynchronously);
        var thread = new Thread(() =>
        {
            try
            {
                action();
                completion.TrySetResult();
            }
            catch (Exception error)
            {
                completion.TrySetException(error);
            }
        })
        { IsBackground = true };
        if (OperatingSystem.IsWindows())
            thread.SetApartmentState(ApartmentState.STA);
        thread.Start();
        return completion.Task;
    }

    private sealed class StartupGate : IHostedService
    {
        public TaskCompletionSource Entered { get; } = new(TaskCreationOptions.RunContinuationsAsynchronously);
        public TaskCompletionSource Release { get; } = new(TaskCreationOptions.RunContinuationsAsynchronously);

        public async Task StartAsync(CancellationToken cancellationToken)
        {
            Entered.TrySetResult();
            await Release.Task.WaitAsync(cancellationToken);
        }

        public Task StopAsync(CancellationToken cancellationToken) => Task.CompletedTask;
    }

    private sealed class ThrowingServer : IServer
    {
        public IFeatureCollection Features { get; } = new FeatureCollection();
        public Task StartAsync<TContext>(IHttpApplication<TContext> application,
            CancellationToken cancellationToken) where TContext : notnull =>
            Task.FromException(new InvalidOperationException("Synthetic bind failure."));
        public Task StopAsync(CancellationToken cancellationToken) => Task.CompletedTask;
        public void Dispose() { }
    }

    private sealed class OwnedResource : IAsyncDisposable
    {
        public int DisposeCalls { get; private set; }
        public ValueTask DisposeAsync()
        {
            DisposeCalls++;
            return ValueTask.CompletedTask;
        }
    }
}

using Microsoft.AspNetCore.Server.Kestrel.Core;

namespace PenguinLauncher.Hosting;

public static class LocalApiHost
{
    public static ApiSessionPolicy? CreateSessionPolicy(LaunchMode mode,
        bool isDevelopment, string? configuredToken, string? developmentOrigin) =>
        mode == LaunchMode.ScanOnly ? null : ApiSessionPolicy.Create(
            mode == LaunchMode.ServerOnly, isDevelopment, configuredToken, developmentOrigin);

    public static void ConfigureLoopback(WebApplicationBuilder builder)
    {
        // Run after the default Kestrel configuration so host URLs/endpoints and
        // later configuration reloads cannot expand the listener boundary.
        builder.Services.PostConfigure<KestrelServerOptions>(options =>
        {
            options.Configure(new ConfigurationBuilder().Build(), reloadOnChange: false);
            options.ListenLocalhost(5100);
        });
    }

    public static void StartDesktop(WebApplication app, ApiSessionPolicy policy,
        bool isDevelopment, Action<Uri, bool> loadAndWait)
    {
        // Keep native construction on the caller's STA thread even when startup
        // completes asynchronously. No credential is delivered before readiness.
        app.StartAsync().GetAwaiter().GetResult();
        loadAndWait(policy.CreateBootstrapUri(), isDevelopment);
    }

    public static async Task RunServerAsync(WebApplication app, Action announceReady,
        CancellationToken cancellationToken = default)
    {
        await app.StartAsync(cancellationToken);
        announceReady();
        await app.WaitForShutdownAsync(cancellationToken);
    }

    public static string FormatStartupFailure(Exception error) =>
        "Penguin Launcher could not start. Check API session configuration and local port availability.";
}

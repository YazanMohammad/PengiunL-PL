using Photino.NET;
using PenguinLauncher.Endpoints;
using PenguinLauncher.Models;
using PenguinLauncher.Services.AccountSwapper;
using PenguinLauncher.Services.GameScanner;
using PenguinLauncher.Services.LaunchManager;
using PenguinLauncher.Services.Storage;

namespace PenguinLauncher;

public class Program
{
    /// <summary>
    /// Entry point for Penguin Launcher.
    /// Wires up:
    ///   1. ASP.NET Core Minimal API backend (serves API + static files)
    ///   2. Photino.NET native window (renders the React frontend)
    /// </summary>
    [STAThread]
    public static void Main(string[] args)
    {
        try
        {
            var baseDir = AppContext.BaseDirectory;
            var currentDir = Directory.GetCurrentDirectory();

            var candidatePaths = new[]
            {
                Path.Combine(baseDir, "wwwroot"),
                Path.Combine(currentDir, "wwwroot"),
                Path.Combine(currentDir, "src", "PenguinLauncher", "wwwroot"),
                Path.Combine(baseDir, "..", "..", "..", "wwwroot"),
                Path.Combine(baseDir, "..", "..", "..", "..", "src", "PenguinLauncher", "wwwroot")
            };

            var wwwrootDir = candidatePaths.FirstOrDefault(p => Directory.Exists(p) && File.Exists(Path.Combine(p, "index.html")))
                           ?? Path.Combine(baseDir, "wwwroot");

            var builder = WebApplication.CreateBuilder(new WebApplicationOptions
            {
                Args = args,
                ContentRootPath = baseDir,
                WebRootPath = wwwrootDir
            });

        // JSON serialization options
        builder.Services.ConfigureHttpJsonOptions(options =>
        {
            options.SerializerOptions.Converters.Add(
                new System.Text.Json.Serialization.JsonStringEnumConverter());
        });

        // Register storage
        builder.Services.AddSingleton<JsonStorageService>();

        // Register account swappers (TcNo-inspired session management)
        builder.Services.AddSingleton<IAccountSwapper, SteamAccountSwapper>();
        builder.Services.AddSingleton<IAccountSwapper, RiotAccountSwapper>();
        builder.Services.AddSingleton<IAccountSwapper, EpicAccountSwapper>();
        builder.Services.AddSingleton<IAccountSwapper, EAAccountSwapper>();
        builder.Services.AddSingleton<AccountSwapperService>();

        // Register metadata service (Steam title caching)
        builder.Services.AddSingleton<SteamMetadataService>();

        // Register game scanners (Playnite-inspired detection)
        builder.Services.AddSingleton<IGameScanner, SteamGameScanner>();
        builder.Services.AddSingleton<IGameScanner, RiotGameScanner>();
        builder.Services.AddSingleton<IGameScanner, EpicGameScanner>();
        builder.Services.AddSingleton<IGameScanner, EAGameScanner>();
        builder.Services.AddSingleton<IGameScanner, LinuxDesktopScanner>();
        builder.Services.AddSingleton<GameScannerService>();

        // Register launch manager
        builder.Services.AddSingleton<LaunchManagerService>();

        // CORS for development (Vite dev server)
        builder.Services.AddCors(options =>
        {
            options.AddDefaultPolicy(policy =>
            {
                policy.AllowAnyOrigin()
                      .AllowAnyMethod()
                      .AllowAnyHeader();
            });
        });

        // Configure Kestrel to listen on a fixed port
        builder.WebHost.UseUrls("http://localhost:5100");

        var app = builder.Build();

        // ──────────────────────────────────────────────
        // 2. Middleware pipeline
        // ──────────────────────────────────────────────
        app.UseExceptionHandler(exceptionHandlerApp =>
        {
            exceptionHandlerApp.Run(async context =>
            {
                context.Response.StatusCode = StatusCodes.Status500InternalServerError;
                context.Response.ContentType = "application/json";
                var exceptionHandlerPathFeature = context.Features.Get<Microsoft.AspNetCore.Diagnostics.IExceptionHandlerPathFeature>();
                var ex = exceptionHandlerPathFeature?.Error;
                var message = ex?.Message ?? "An unexpected internal server error occurred.";
                await context.Response.WriteAsJsonAsync(new { error = message });
            });
        });

        app.UseCors();

        // Serve React static files from wwwroot/
        if (Directory.Exists(wwwrootDir))
        {
            var fileProvider = new Microsoft.Extensions.FileProviders.PhysicalFileProvider(wwwrootDir);
            app.UseDefaultFiles(new DefaultFilesOptions { FileProvider = fileProvider });
            app.UseStaticFiles(new StaticFileOptions { FileProvider = fileProvider });
        }

        // ──────────────────────────────────────────────
        // 3. Map Minimal API endpoints
        // ──────────────────────────────────────────────
        app.MapGameEndpoints();
        app.MapAccountEndpoints();
        app.MapLaunchEndpoints();

        // System info endpoint
        app.MapGet("/api/system/info", () => Results.Ok(new
        {
            os = OperatingSystem.IsWindows() ? "Windows" : (OperatingSystem.IsLinux() ? "Linux" : "macOS"),
            isWindows = OperatingSystem.IsWindows(),
            isLinux = OperatingSystem.IsLinux(),
            machineName = Environment.MachineName,
            framework = Environment.Version.ToString(),
            architecture = System.Runtime.InteropServices.RuntimeInformation.ProcessArchitecture.ToString()
        }));

        // Health check
        app.MapGet("/api/health", () => Results.Ok(new
        {
            status = "healthy",
            version = "1.0.0",
            timestamp = DateTime.UtcNow
        }));

        // SPA fallback: serve index.html for all non-API routes
        app.MapFallback(async context =>
        {
            var indexPath = Path.Combine(wwwrootDir, "index.html");
            if (File.Exists(indexPath))
            {
                context.Response.ContentType = "text/html; charset=utf-8";
                await context.Response.SendFileAsync(indexPath);
            }
            else
            {
                context.Response.StatusCode = 404;
                await context.Response.WriteAsync("Penguin Launcher: index.html not found.");
            }
        });

        // Headless scan-only mode for CLI diagnostics and verification
        if (args.Contains("--scan-only"))
        {
            var scanner = app.Services.GetRequiredService<GameScannerService>();
            var games = scanner.ScanAllAsync().GetAwaiter().GetResult();
            Console.WriteLine($"[ScanOnly] Total games found: {games.Count}");
            foreach (var g in games)
            {
                if (g.Platform != Platform.Steam)
                {
                    Console.WriteLine($"[ScanOnly] {g.Platform}: {g.Name} (ID: {g.Id}, Installed: {g.IsInstalled}, Accounts: [{string.Join(", ", g.AssociatedAccountIds)}])");
                }
            }
            return;
        }

        // Headless server-only mode for integration testing and API diagnostics
        if (args.Contains("--server-only"))
        {
            Console.WriteLine("[ServerOnly] Server listening on http://localhost:5100");
            app.Run();
            return;
        }


        // ──────────────────────────────────────────────
        // 4. Start the web server in background
        // ──────────────────────────────────────────────
        app.RunAsync();

        // ──────────────────────────────────────────────
        // 5. Launch Photino.NET native window
        // ──────────────────────────────────────────────
        var window = new PhotinoWindow()
            .SetTitle("Penguin Launcher")
            .SetUseOsDefaultSize(false)
            .SetSize(1400, 900)
            .Center()
            .SetResizable(true)
            .SetDevToolsEnabled(true)
            .SetLogVerbosity(0)
            .Load("http://localhost:5100");

        window.WaitForClose();
        }
        catch (Exception ex)
        {
            var logPath = Path.Combine(AppContext.BaseDirectory, "crash.log");
            File.WriteAllText(logPath, ex.ToString());
        }
    }
}

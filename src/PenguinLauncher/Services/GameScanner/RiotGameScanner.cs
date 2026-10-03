using PenguinLauncher.Helpers;
using PenguinLauncher.Models;

namespace PenguinLauncher.Services.GameScanner;

/// <summary>
/// Scans for installed Riot Games titles (Valorant, League of Legends, LoR, etc.).
/// Uses registry, RiotClientInstalls.json, and multi-drive file-system scanning.
/// </summary>
public class RiotGameScanner : IGameScanner
{
    public Platform Platform => Platform.Riot;

    private const string RiotRegistryPath = @"HKLM\SOFTWARE\Microsoft\Windows\CurrentVersion\Uninstall\Riot Game league_of_legends.live";
    private const string RiotClientPath = @"HKCU\SOFTWARE\Microsoft\Windows\CurrentVersion\Uninstall\Riot Game Client";

    private static readonly Dictionary<string, (string Name, string CoverUrl, string HeroUrl, string ExeName)> KnownProducts = new(StringComparer.OrdinalIgnoreCase)
    {
        ["valorant"] = (
            "Valorant",
            "https://images.contentstack.io/v3/assets/bltb6530b271fddd0b1/blt500eed3e50d63e9c/valorant_logo.png",
            "https://images.contentstack.io/v3/assets/bltb6530b271fddd0b1/blt0da71c77f0a827ea/64b58e70a9e70114f77c385b/VALORANT_Jett_Red_1920x1080.jpg",
            "VALORANT.exe"
        ),
        ["league_of_legends"] = (
            "League of Legends",
            "https://images.contentstack.io/v3/assets/blt731acb42bb3d1659/blt9a1e60f0f0309dcf/lol_logo.png",
            "https://images.contentstack.io/v3/assets/blt731acb42bb3d1659/bltd1d428bf1cb0b4fa/5db0969d2dc53971c22119eb/Riot_Games_League_of_Legends_Wallpaper.jpg",
            "LeagueClient.exe"
        ),
        ["lor"] = (
            "Legends of Runeterra",
            "https://images.contentstack.io/v3/assets/blt0eb2a298ac3101fa/blt9ff62e519277d337/5d9f7f457788b9393a525fbc/LoR_Logo_Vertical_Color_RGB.png",
            "",
            "LoR.exe"
        )
    };

    public bool IsInstalled()
    {
        return GetRiotClientPath() != null || HasRiotGamesInstalled();
    }

    public async Task<List<Game>> ScanAsync()
    {
        var gamesDict = new Dictionary<string, Game>(StringComparer.OrdinalIgnoreCase);
        var riotDataPath = GetRiotDataPath();

        // 1. Scan RiotClientInstalls.json for installed products
        if (riotDataPath != null)
        {
            var installsFile = Path.Combine(riotDataPath, "RiotClientInstalls.json");
            if (File.Exists(installsFile))
            {
                try
                {
                    var json = await File.ReadAllTextAsync(installsFile);
                    var doc = System.Text.Json.JsonDocument.Parse(json);

                    if (doc.RootElement.TryGetProperty("associated_client", out var clients))
                    {
                        foreach (var entry in clients.EnumerateObject())
                        {
                            var productPath = entry.Name;
                            var game = IdentifyRiotGame(productPath);
                            if (game != null && !gamesDict.ContainsKey(game.Id))
                            {
                                gamesDict[game.Id] = game;
                            }
                        }
                    }
                }
                catch
                {
                    // Fall back to drive scanning
                }
            }
        }

        // 2. Scan all drives for Riot Games folders (e.g. C:\Riot Games\*, E:\Riot Games\*)
        var drives = DriveInfo.GetDrives()
            .Where(d => d.IsReady && d.DriveType == DriveType.Fixed)
            .Select(d => d.RootDirectory.FullName);

        foreach (var drive in drives)
        {
            var riotFolder = Path.Combine(drive, "Riot Games");
            if (!Directory.Exists(riotFolder)) continue;

            try
            {
                // Check VALORANT
                var valPath = Path.Combine(riotFolder, "VALORANT");
                if (Directory.Exists(valPath) && !gamesDict.ContainsKey("riot_valorant"))
                {
                    var liveDir = Path.Combine(valPath, "live");
                    var installDir = Directory.Exists(liveDir) ? liveDir : valPath;
                    gamesDict["riot_valorant"] = new Game(
                        Id: "riot_valorant",
                        Name: "Valorant",
                        Platform: Platform.Riot,
                        InstallPath: installDir,
                        LaunchUri: "riotclient://launch/valorant",
                        CoverImageUrl: KnownProducts["valorant"].CoverUrl,
                        BackgroundImageUrl: KnownProducts["valorant"].HeroUrl,
                        AssociatedAccountIds: new List<string>()
                    )
                    {
                        PlatformGameId = "valorant",
                        IsInstalled = true
                    };
                }

                // Check League of Legends
                var lolPath = Path.Combine(riotFolder, "League of Legends");
                if (Directory.Exists(lolPath) && !gamesDict.ContainsKey("riot_league_of_legends"))
                {
                    gamesDict["riot_league_of_legends"] = new Game(
                        Id: "riot_league_of_legends",
                        Name: "League of Legends",
                        Platform: Platform.Riot,
                        InstallPath: lolPath,
                        LaunchUri: "riotclient://launch/league_of_legends",
                        CoverImageUrl: KnownProducts["league_of_legends"].CoverUrl,
                        BackgroundImageUrl: KnownProducts["league_of_legends"].HeroUrl,
                        AssociatedAccountIds: new List<string>()
                    )
                    {
                        PlatformGameId = "league_of_legends",
                        IsInstalled = true
                    };
                }

                // Check Legends of Runeterra
                var lorPath = Path.Combine(riotFolder, "Legends of Runeterra");
                if (Directory.Exists(lorPath) && !gamesDict.ContainsKey("riot_lor"))
                {
                    gamesDict["riot_lor"] = new Game(
                        Id: "riot_lor",
                        Name: "Legends of Runeterra",
                        Platform: Platform.Riot,
                        InstallPath: lorPath,
                        LaunchUri: "riotclient://launch/lor",
                        CoverImageUrl: KnownProducts["lor"].CoverUrl,
                        BackgroundImageUrl: KnownProducts["lor"].HeroUrl,
                        AssociatedAccountIds: new List<string>()
                    )
                    {
                        PlatformGameId = "lor",
                        IsInstalled = true
                    };
                }
            }
            catch
            {
                // Ignore access errors on individual directories
            }
        }

        return gamesDict.Values.ToList();
    }

    private string? GetRiotClientPath()
    {
        var commonPaths = new[]
        {
            Path.Combine(Environment.GetFolderPath(Environment.SpecialFolder.LocalApplicationData), "Riot Games", "Riot Client"),
            @"C:\Riot Games\Riot Client",
            @"E:\Riot Games\Riot Client",
        };

        return commonPaths.FirstOrDefault(Directory.Exists);
    }

    private string? GetRiotDataPath()
    {
        var programData = Environment.GetFolderPath(Environment.SpecialFolder.CommonApplicationData);
        var riotPath = Path.Combine(programData, "Riot Games");
        return Directory.Exists(riotPath) ? riotPath : null;
    }

    private Game? IdentifyRiotGame(string installPath)
    {
        var normalizedPath = installPath.Replace('/', '\\').ToLowerInvariant();

        foreach (var (key, (name, coverUrl, heroUrl, exeName)) in KnownProducts)
        {
            if (normalizedPath.Contains(key, StringComparison.OrdinalIgnoreCase))
            {
                return new Game(
                    Id: $"riot_{key}",
                    Name: name,
                    Platform: Platform.Riot,
                    InstallPath: installPath,
                    LaunchUri: $"riotclient://launch/{key}",
                    CoverImageUrl: coverUrl,
                    BackgroundImageUrl: heroUrl,
                    AssociatedAccountIds: new List<string>()
                )
                {
                    PlatformGameId = key,
                    IsInstalled = true
                };
            }
        }

        return null;
    }

    private bool HasRiotGamesInstalled()
    {
        var drives = DriveInfo.GetDrives()
            .Where(d => d.IsReady && d.DriveType == DriveType.Fixed)
            .Select(d => d.RootDirectory.FullName);

        return drives.Any(d => Directory.Exists(Path.Combine(d, "Riot Games")));
    }
}

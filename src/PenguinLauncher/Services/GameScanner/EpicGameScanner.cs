using System.Text.Json;
using System.Text.RegularExpressions;
using PenguinLauncher.Helpers;
using PenguinLauncher.Models;

namespace PenguinLauncher.Services.GameScanner;

/// <summary>
/// Scans for installed and owned Epic Games Store titles.
/// Adapted from Playnite's EpicLibrary plugin:
///   - Reads .item manifest files from Epic's LauncherInstalled directory
///   - Reads local ownership cache files (OC_*.dat) for vault/account library detection
///   - Scans common drives for installed Epic Games
/// </summary>
public class EpicGameScanner : IGameScanner
{
    public Platform Platform => Platform.Epic;

    private const string EpicRegistryPath = @"HKLM\SOFTWARE\WOW6432Node\Epic Games\EpicGamesLauncher";

    private static readonly Dictionary<string, (string Name, string CoverUrl, string HeroUrl)> KnownEpicCovers = new(StringComparer.OrdinalIgnoreCase)
    {
        ["Fortnite"] = (
            "Fortnite",
            "https://cdn1.epicgames.com/offer/fn/Blade_2560x1440_2560x1440-95837f8d3249c3715737d0c514234d3f",
            "https://cdn2.unrealengine.com/14br-consoles-1920x1080-wlogo-1920x1080-432974386.jpg"
        ),
        ["RocketLeague"] = (
            "Rocket League",
            "https://cdn1.epicgames.com/offer/9773aa1aa54f4f7b80e44bef049cb812/EGS_RocketLeague_PsyonixLLC_S2_1200x1600-b6c8a74e5318bbca28f921d28ab5ebdd",
            "https://cdn1.epicgames.com/offer/9773aa1aa54f4f7b80e44bef049cb812/EGS_RocketLeague_PsyonixLLC_S1_2560x1440-8b1fc7d2c3dfb871c5643dc3d6118d3d"
        ),
        ["FallGuys"] = (
            "Fall Guys",
            "https://cdn1.epicgames.com/offer/50118b7f95cf450a88b5066928eeb020/EGS_FallGuys_Mediatonic_S1_1200x1600-cf772e2cf54e0bcf0a28f7fb74bcfe6e",
            "https://cdn1.epicgames.com/offer/50118b7f95cf450a88b5066928eeb020/EGS_FallGuys_Mediatonic_S2_2560x1440-10115024765d14dfb0ca0e58f2762a4d"
        ),
        ["GrandTheftAutoV"] = (
            "Grand Theft Auto V",
            "https://cdn1.epicgames.com/offer/0584dacc01364657940ee28ea430417e/EGS_GrandTheftAutoVPremiumEdition_RockstarGames_S2_1200x1600-382dd360cacb327b2b01712a4dfb7c25",
            "https://cdn1.epicgames.com/offer/0584dacc01364657940ee28ea430417e/EGS_GrandTheftAutoVPremiumEdition_RockstarGames_S1_2560x1440-67eb7312e4be5b69e5b85a3a41b53fbe"
        ),
        ["GenshinImpact"] = (
            "Genshin Impact",
            "https://cdn1.epicgames.com/offer/879b0d8776ab46a59c129994b79b8a8b/EGS_GenshinImpact_miHoYo_S2_1200x1600-b08e2f07fec9be62ef5e59ff7b5bb48e",
            "https://cdn1.epicgames.com/offer/879b0d8776ab46a59c129994b79b8a8b/EGS_GenshinImpact_miHoYo_S1_2560x1440-5f252cfb94e339ca9ca3b5dca6585ea1"
        ),
        ["UE_5"] = (
            "Unreal Engine 5",
            "https://cdn2.unrealengine.com/ue-logotype-2023-vertical-white-1686x2048-b30f2a93dd6a.png",
            "https://cdn2.unrealengine.com/ue-5-4-release-notes-banner-1920x1080-602958448.jpg"
        )
    };

    public bool IsInstalled()
    {
        return GetEpicManifestsPath() != null || GetEpicLauncherPath() != null || HasEpicData();
    }

    public async Task<List<Game>> ScanAsync()
    {
        var gamesDict = new Dictionary<string, Game>(StringComparer.OrdinalIgnoreCase);

        // 1. Scan .item manifests (installed titles)
        var manifestsPath = GetEpicManifestsPath();
        if (manifestsPath != null && Directory.Exists(manifestsPath))
        {
            var manifests = Directory.GetFiles(manifestsPath, "*.item");
            foreach (var manifest in manifests)
            {
                try
                {
                    var json = await File.ReadAllTextAsync(manifest);
                    var doc = JsonDocument.Parse(json);
                    var root = doc.RootElement;

                    var displayName = root.GetProperty("DisplayName").GetString();
                    var installLocation = root.GetProperty("InstallLocation").GetString();
                    var appName = root.GetProperty("AppName").GetString();
                    var catalogNamespace = root.TryGetProperty("CatalogNamespace", out var ns) ? ns.GetString() : "";
                    var catalogItemId = root.TryGetProperty("CatalogItemId", out var cid) ? cid.GetString() : "";

                    if (string.IsNullOrEmpty(displayName) || string.IsNullOrEmpty(appName)) continue;

                    var launchUri = $"com.epicgames.launcher://apps/{catalogNamespace}%3A{catalogItemId}%3A{appName}?action=launch&silent=true";
                    var (coverUrl, heroUrl) = ResolveEpicArt(appName, displayName);

                    bool isInstalled = !string.IsNullOrEmpty(installLocation) && Directory.Exists(installLocation);

                    var game = new Game(
                        Id: $"epic_{appName}",
                        Name: displayName,
                        Platform: Platform.Epic,
                        InstallPath: installLocation ?? string.Empty,
                        LaunchUri: launchUri,
                        CoverImageUrl: coverUrl,
                        BackgroundImageUrl: heroUrl,
                        AssociatedAccountIds: new List<string>()
                    )
                    {
                        PlatformGameId = appName,
                        IsInstalled = isInstalled
                    };

                    gamesDict[game.Id] = game;
                }
                catch
                {
                    // Skip malformed manifests
                }
            }
        }

        // 2. Scan drive directories for Epic Games (e.g. C:\Program Files\Epic Games\*, E:\Epic Games\*)
        var drives = DriveInfo.GetDrives()
            .Where(d => d.IsReady && d.DriveType == DriveType.Fixed)
            .Select(d => d.RootDirectory.FullName);

        var epicFolders = new[] { "Epic Games", @"Program Files\Epic Games", @"Games\Epic Games" };
        foreach (var drive in drives)
        {
            foreach (var ef in epicFolders)
            {
                var folderPath = Path.Combine(drive, ef);
                if (!Directory.Exists(folderPath)) continue;

                try
                {
                    foreach (var gameDir in Directory.GetDirectories(folderPath))
                    {
                        var folderName = Path.GetFileName(gameDir);
                        if (folderName.Equals("Launcher", StringComparison.OrdinalIgnoreCase) ||
                            folderName.Equals("DirectXRedist", StringComparison.OrdinalIgnoreCase) ||
                            folderName.Equals("GameInputRedist", StringComparison.OrdinalIgnoreCase))
                        {
                            continue;
                        }

                        var gameId = $"epic_{folderName}";
                        if (!gamesDict.ContainsKey(gameId))
                        {
                            var (coverUrl, heroUrl) = ResolveEpicArt(folderName, folderName);
                            gamesDict[gameId] = new Game(
                                Id: gameId,
                                Name: folderName,
                                Platform: Platform.Epic,
                                InstallPath: gameDir,
                                LaunchUri: $"com.epicgames.launcher://apps/{folderName}?action=launch&silent=true",
                                CoverImageUrl: coverUrl,
                                BackgroundImageUrl: heroUrl,
                                AssociatedAccountIds: new List<string>()
                            )
                            {
                                PlatformGameId = folderName,
                                IsInstalled = true
                            };
                        }
                    }
                }
                catch
                {
                    // Ignore
                }
            }
        }

        // 3. Scan local ownership cache files (OC_*.dat) in Saved/Data
        var savedDataPath = Path.Combine(
            Environment.GetFolderPath(Environment.SpecialFolder.LocalApplicationData),
            "EpicGamesLauncher", "Saved", "Data"
        );

        if (Directory.Exists(savedDataPath))
        {
            var ocFiles = Directory.GetFiles(savedDataPath, "OC_*.dat");
            foreach (var ocFile in ocFiles)
            {
                try
                {
                    var fileName = Path.GetFileNameWithoutExtension(ocFile);
                    var userId = fileName.StartsWith("OC_", StringComparison.OrdinalIgnoreCase)
                        ? fileName.Substring(3)
                        : fileName;
                    var accountId = $"epic_{userId}";

                    var bytes = await File.ReadAllBytesAsync(ocFile);
                    var text = System.Text.Encoding.ASCII.GetString(bytes);

                    // Replace non-printable bytes with space to enable smooth regex matching
                    var cleanText = new string(text.Select(c => (c >= 32 && c <= 126) ? c : ' ').ToArray());

                    // Parse games from ownership cache
                    var matches = Regex.Matches(cleanText, @"(?:(?<ns>[a-zA-Z0-9_-]+)\s*!)?\s*(?<itemId>[a-f0-9]{32})\s+(?<name>[a-zA-Z0-9_\. -]{2,35})");
                    foreach (Match m in matches)
                    {
                        var rawName = m.Groups["name"].Value.Trim();
                        var name = Regex.Split(rawName, @"\s{2,}")[0].Trim();
                        var ns = m.Groups["ns"].Value.Trim();
                        var itemId = m.Groups["itemId"].Value.Trim();

                        // Filter out engine plugins or empty titles
                        if (string.IsNullOrWhiteSpace(name) ||
                            name.StartsWith("QuixelBridge", StringComparison.OrdinalIgnoreCase) ||
                            name.StartsWith("FabPlugin", StringComparison.OrdinalIgnoreCase))
                        {
                            continue;
                        }

                        var cleanName = name;
                        if (cleanName.StartsWith("UE_", StringComparison.OrdinalIgnoreCase))
                        {
                            cleanName = "Unreal Engine " + cleanName.Substring(3).Replace("_", ".");
                        }

                        var appKey = cleanName.Replace(" ", "");
                        var gameId = $"epic_{appKey}";

                        // Check if installed on disk
                        string installPath = string.Empty;
                        bool isInstalled = false;
                        foreach (var drive in drives)
                        {
                            var candidate = Path.Combine(drive, "Program Files", "Epic Games", cleanName);
                            var candidate2 = Path.Combine(drive, "Epic Games", cleanName);
                            if (Directory.Exists(candidate)) { installPath = candidate; isInstalled = true; break; }
                            if (Directory.Exists(candidate2)) { installPath = candidate2; isInstalled = true; break; }
                        }

                        var launchUri = !string.IsNullOrEmpty(ns) && !string.IsNullOrEmpty(itemId)
                            ? $"com.epicgames.launcher://apps/{ns}%3A{itemId}%3A{appKey}?action=launch&silent=true"
                            : $"com.epicgames.launcher://apps/{appKey}?action=launch&silent=true";

                        var (coverUrl, heroUrl) = ResolveEpicArt(appKey, cleanName);

                        if (gamesDict.TryGetValue(gameId, out var existing))
                        {
                            if (!existing.AssociatedAccountIds.Contains(accountId, StringComparer.OrdinalIgnoreCase))
                            {
                                existing.AssociatedAccountIds.Add(accountId);
                            }
                        }
                        else
                        {
                            gamesDict[gameId] = new Game(
                                Id: gameId,
                                Name: cleanName,
                                Platform: Platform.Epic,
                                InstallPath: installPath,
                                LaunchUri: launchUri,
                                CoverImageUrl: coverUrl,
                                BackgroundImageUrl: heroUrl,
                                AssociatedAccountIds: new List<string> { accountId }
                            )
                            {
                                PlatformGameId = appKey,
                                IsInstalled = isInstalled
                            };
                        }
                    }
                }
                catch
                {
                    // Ignore parse errors on individual OC cache files
                }
            }
        }

        return gamesDict.Values.ToList();
    }

    private static (string? CoverUrl, string? HeroUrl) ResolveEpicArt(string appName, string displayName)
    {
        if (KnownEpicCovers.TryGetValue(appName, out var match))
        {
            return (match.CoverUrl, match.HeroUrl);
        }

        foreach (var kvp in KnownEpicCovers)
        {
            if (displayName.Contains(kvp.Key, StringComparison.OrdinalIgnoreCase) ||
                appName.Contains(kvp.Key, StringComparison.OrdinalIgnoreCase))
            {
                return (kvp.Value.CoverUrl, kvp.Value.HeroUrl);
            }
        }

        return (null, null);
    }

    private string? GetEpicManifestsPath()
    {
        var programData = Environment.GetFolderPath(Environment.SpecialFolder.CommonApplicationData);
        var path = Path.Combine(programData, "Epic", "EpicGamesLauncher", "Data", "Manifests");
        if (Directory.Exists(path)) return path;

        var regPath = RegistryHelper.GetValue(EpicRegistryPath, "AppDataPath");
        if (regPath != null)
        {
            var p = Path.Combine(regPath, "Manifests");
            if (Directory.Exists(p)) return p;
        }

        return null;
    }

    private string? GetEpicLauncherPath()
    {
        return RegistryHelper.GetValue(EpicRegistryPath, "AppDataPath");
    }

    private bool HasEpicData()
    {
        var savedDataPath = Path.Combine(
            Environment.GetFolderPath(Environment.SpecialFolder.LocalApplicationData),
            "EpicGamesLauncher", "Saved", "Data"
        );
        return Directory.Exists(savedDataPath);
    }
}

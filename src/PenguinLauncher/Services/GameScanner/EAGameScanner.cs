using System.Text.RegularExpressions;
using PenguinLauncher.Helpers;
using PenguinLauncher.Models;

namespace PenguinLauncher.Services.GameScanner;

/// <summary>
/// Scans for installed EA App (formerly Origin) games.
/// Adapted from Playnite's OriginLibrary / EALibrary plugin:
///   - Scans Windows Registry (HKLM\SOFTWARE\EA Games, Respawn, Electronic Arts)
///   - Scans file system drives for EA / EA Games / Origin Games directories
///   - Parses __Installer/installerdata.xml for content IDs and official titles
///   - Reads LocalContent and InstallData manifests
/// </summary>
public class EAGameScanner : IGameScanner
{
    public Platform Platform => Platform.EA;

    private const string EARegistryPath = @"HKLM\SOFTWARE\Electronic Arts\EA Desktop";
    private const string OriginRegistryPath = @"HKLM\SOFTWARE\WOW6432Node\Origin";

    private static readonly Dictionary<string, (string Name, string CoverUrl, string HeroUrl)> KnownEAGames = new(StringComparer.OrdinalIgnoreCase)
    {
        ["194908"] = (
            "Apex Legends",
            "https://cdn.cloudflare.steamstatic.com/steam/apps/1172470/header.jpg",
            "https://cdn.cloudflare.steamstatic.com/steam/apps/1172470/library_hero.jpg"
        ),
        ["1026023"] = (
            "Battlefield 1",
            "https://cdn.cloudflare.steamstatic.com/steam/apps/1238840/header.jpg",
            "https://cdn.cloudflare.steamstatic.com/steam/apps/1238840/library_hero.jpg"
        ),
        ["196216"] = (
            "Battlefield V",
            "https://cdn.cloudflare.steamstatic.com/steam/apps/1238810/header.jpg",
            "https://cdn.cloudflare.steamstatic.com/steam/apps/1238810/library_hero.jpg"
        ),
        ["1007968"] = (
            "Battlefield 4",
            "https://cdn.cloudflare.steamstatic.com/steam/apps/1238860/header.jpg",
            "https://cdn.cloudflare.steamstatic.com/steam/apps/1238860/library_hero.jpg"
        ),
        ["1016754"] = (
            "Titanfall 2",
            "https://cdn.cloudflare.steamstatic.com/steam/apps/1237970/header.jpg",
            "https://cdn.cloudflare.steamstatic.com/steam/apps/1237970/library_hero.jpg"
        ),
        ["1222670"] = (
            "The Sims 4",
            "https://cdn.cloudflare.steamstatic.com/steam/apps/1222670/header.jpg",
            "https://cdn.cloudflare.steamstatic.com/steam/apps/1222670/library_hero.jpg"
        ),
        ["1172380"] = (
            "STAR WARS Jedi: Fallen Order",
            "https://cdn.cloudflare.steamstatic.com/steam/apps/1172380/header.jpg",
            "https://cdn.cloudflare.steamstatic.com/steam/apps/1172380/library_hero.jpg"
        )
    };

    public bool IsInstalled()
    {
        return GetEAInstallPath() != null || HasEAGamesInstalled();
    }

    public async Task<List<Game>> ScanAsync()
    {
        var gamesDict = new Dictionary<string, Game>(StringComparer.OrdinalIgnoreCase);

        // 1. Scan Registry paths for EA games
        var registryBases = new[]
        {
            @"HKLM\SOFTWARE\EA Games",
            @"HKLM\SOFTWARE\WOW6432Node\EA Games",
            @"HKLM\SOFTWARE\Respawn",
            @"HKLM\SOFTWARE\WOW6432Node\Respawn",
            @"HKLM\SOFTWARE\Electronic Arts",
            @"HKLM\SOFTWARE\WOW6432Node\Electronic Arts"
        };

        foreach (var regBase in registryBases)
        {
            var subKeys = RegistryHelper.GetSubKeyNames(regBase);
            foreach (var subKey in subKeys)
            {
                var fullKey = $@"{regBase}\{subKey}";
                var installDir = RegistryHelper.GetValue(fullKey, "Install Dir")
                              ?? RegistryHelper.GetValue(fullKey, "InstallDir")
                              ?? RegistryHelper.GetValue(fullKey, "Path");

                var rawDisplayName = RegistryHelper.GetValue(fullKey, "DisplayName")
                                  ?? RegistryHelper.GetValue(fullKey, "GameName")
                                  ?? subKey;

                if (!string.IsNullOrEmpty(installDir) && Directory.Exists(installDir))
                {
                    var game = await TryParseEAGameFromDirectory(installDir, rawDisplayName, subKey);
                    if (game != null && !gamesDict.ContainsKey(game.Id))
                    {
                        gamesDict[game.Id] = game;
                    }
                }
            }
        }

        // 2. Scan drive directories (e.g. E:\EA\*, C:\EA Games\*, etc.)
        var commonFolderNames = new[] { "EA", "EA Games", "Origin Games", @"Games\EA", @"Program Files\EA Games", @"Program Files (x86)\Origin Games" };
        var drives = DriveInfo.GetDrives()
            .Where(d => d.IsReady && d.DriveType == DriveType.Fixed)
            .Select(d => d.RootDirectory.FullName);

        foreach (var drive in drives)
        {
            foreach (var folder in commonFolderNames)
            {
                var targetPath = Path.Combine(drive, folder);
                if (!Directory.Exists(targetPath)) continue;

                try
                {
                    foreach (var gameDir in Directory.GetDirectories(targetPath))
                    {
                        var dirName = Path.GetFileName(gameDir);
                        var game = await TryParseEAGameFromDirectory(gameDir, dirName, dirName);
                        if (game != null && !gamesDict.ContainsKey(game.Id))
                        {
                            gamesDict[game.Id] = game;
                        }
                    }
                }
                catch
                {
                    // Ignore access errors on individual directories
                }
            }
        }

        // 3. Scan ProgramData Origin LocalContent
        var originLocalContent = Path.Combine(
            Environment.GetFolderPath(Environment.SpecialFolder.CommonApplicationData),
            "Origin",
            "LocalContent"
        );

        if (Directory.Exists(originLocalContent))
        {
            try
            {
                foreach (var contentDir in Directory.GetDirectories(originLocalContent))
                {
                    var titleName = Path.GetFileName(contentDir);
                    // Check registry or standard paths if not already in dictionary
                    var regInstallPath = RegistryHelper.GetValue($@"HKLM\SOFTWARE\EA Games\{titleName}", "Install Dir")
                                      ?? RegistryHelper.GetValue($@"HKLM\SOFTWARE\WOW6432Node\EA Games\{titleName}", "Install Dir");

                    if (!string.IsNullOrEmpty(regInstallPath) && Directory.Exists(regInstallPath))
                    {
                        var game = await TryParseEAGameFromDirectory(regInstallPath, titleName, titleName);
                        if (game != null && !gamesDict.ContainsKey(game.Id))
                        {
                            gamesDict[game.Id] = game;
                        }
                    }
                }
            }
            catch
            {
                // Ignore
            }
        }

        return gamesDict.Values.ToList();
    }

    private async Task<Game?> TryParseEAGameFromDirectory(string gameDir, string fallbackDisplayName, string fallbackContentId)
    {
        try
        {
            string? contentId = null;
            string? displayName = null;

            var installerXml = Path.Combine(gameDir, "__Installer", "installerdata.xml");
            if (File.Exists(installerXml))
            {
                var xml = await File.ReadAllTextAsync(installerXml);
                contentId = ExtractXmlValue(xml, "contentID") ?? ExtractXmlValue(xml, "contentId");
                displayName = ExtractXmlValue(xml, "gameTitle") ?? ExtractXmlValue(xml, "title");
            }

            contentId ??= fallbackContentId;
            displayName = CleanGameTitle(displayName ?? fallbackDisplayName);

            if (string.IsNullOrWhiteSpace(displayName)) return null;

            // Normalize contentId
            contentId = Regex.Replace(contentId, @"[^a-zA-Z0-9_\.-]", "");
            if (string.IsNullOrEmpty(contentId)) contentId = displayName.ToLowerInvariant().Replace(" ", "_");

            string? coverUrl = null;
            string? heroUrl = null;

            if (KnownEAGames.TryGetValue(contentId, out var known))
            {
                coverUrl = known.CoverUrl;
                heroUrl = known.HeroUrl;
                if (!string.IsNullOrEmpty(known.Name)) displayName = known.Name;
            }
            else
            {
                // Check name matches in known games
                var byName = KnownEAGames.Values.FirstOrDefault(k =>
                    k.Name.Equals(displayName, StringComparison.OrdinalIgnoreCase) ||
                    displayName.Contains(k.Name, StringComparison.OrdinalIgnoreCase));

                if (byName != default)
                {
                    coverUrl = byName.CoverUrl;
                    heroUrl = byName.HeroUrl;
                }
            }

            var launchUri = $"origin://launchgame/{contentId}";

            return new Game(
                Id: $"ea_{contentId}",
                Name: displayName,
                Platform: Platform.EA,
                InstallPath: gameDir,
                LaunchUri: launchUri,
                CoverImageUrl: coverUrl,
                BackgroundImageUrl: heroUrl,
                AssociatedAccountIds: new List<string>()
            )
            {
                PlatformGameId = contentId,
                IsInstalled = true
            };
        }
        catch
        {
            return null;
        }
    }

    private static string CleanGameTitle(string raw)
    {
        if (string.IsNullOrWhiteSpace(raw)) return string.Empty;

        // Clean TM artifacts like "BattlefieldT 1", "Battlefield™ 1", "Battlefield, 1"
        var cleaned = raw
            .Replace("™", "")
            .Replace("®", "")
            .Replace("T 1", " 1")
            .Replace("T V", " V")
            .Replace("4T", "4")
            .Trim();

        return cleaned;
    }

    private static string? ExtractXmlValue(string xml, string elementName)
    {
        // Match <elementName> or <elementName ...>
        var pattern = $@"<{elementName}(?:\s+[^>]*)?>(?<val>.*?)</{elementName}>";
        var match = Regex.Match(xml, pattern, RegexOptions.Singleline | RegexOptions.IgnoreCase);
        if (match.Success)
        {
            return match.Groups["val"].Value.Trim();
        }

        return null;
    }

    private string? GetEAInstallPath()
    {
        var path = RegistryHelper.GetValue(EARegistryPath, "InstallLocation")
                ?? RegistryHelper.GetValue(OriginRegistryPath, "ClientPath");

        if (path != null)
        {
            var dir = Path.GetDirectoryName(path);
            if (dir != null && Directory.Exists(dir)) return dir;
        }

        var defaults = new[]
        {
            @"C:\Program Files\Electronic Arts\EA Desktop",
            @"C:\Program Files (x86)\Origin"
        };

        return defaults.FirstOrDefault(Directory.Exists);
    }

    private bool HasEAGamesInstalled()
    {
        var regKeys = new[] { @"HKLM\SOFTWARE\EA Games", @"HKLM\SOFTWARE\Respawn" };
        foreach (var rk in regKeys)
        {
            if (RegistryHelper.GetSubKeyNames(rk).Length > 0) return true;
        }
        return false;
    }
}

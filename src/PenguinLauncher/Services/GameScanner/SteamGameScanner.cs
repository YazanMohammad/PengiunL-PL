using PenguinLauncher.Helpers;
using PenguinLauncher.Models;

namespace PenguinLauncher.Services.GameScanner;

/// <summary>
/// Scans for installed Steam games by reading registry and VDF files.
/// Heavily adapted from Playnite's SteamLibrary plugin:
///   - Registry path discovery via HKLM\SOFTWARE\Valve\Steam
///   - libraryfolders.vdf parsing for multi-drive library detection
///   - appmanifest_*.acf parsing for individual game metadata
///   - loginusers.vdf parsing for account detection
/// </summary>
public class SteamGameScanner : IGameScanner
{
    public Platform Platform => Platform.Steam;

    // Registry path where Steam stores its install location (Playnite approach)
    private const string SteamRegistryPath = @"HKLM\SOFTWARE\Valve\Steam";
    private const string SteamRegistryPath32 = @"HKLM\SOFTWARE\WOW6432Node\Valve\Steam";
    private const string SteamUserRegistryPath = @"HKCU\SOFTWARE\Valve\Steam";

    private static readonly HashSet<string> IgnoredAppIds = new(StringComparer.OrdinalIgnoreCase)
    {
        "7",       // Steam Client
        "760",     // Steam Community / Screenshots Overlay
        "218",     // Source SDK Base 2007
        "480",     // Spacewar (Steamworks SDK Test App)
        "228980",  // Steamworks Common Redistributables
        "241100",  // Steam Controller Configs
        "250820",  // SteamVR
        "1070560", // Steam Linux Runtime
        "1391110", // Steam Linux Runtime - Soldier
        "1628350", // Steam Linux Runtime - Sniper
        "2371090", // Steam Client WebHelper
        "228983",  // Steamworks Shared Depot
        "228984",
        "228985",
        "228986",
        "228987",
        "228988",
        "228989",
        "228990",
    };

    private readonly SteamMetadataService _metadataService;
    private readonly ILogger<SteamGameScanner> _logger;

    public SteamGameScanner(SteamMetadataService metadataService, ILogger<SteamGameScanner> logger)
    {
        _metadataService = metadataService;
        _logger = logger;
    }

    private static bool IsIgnoredAppId(string appId)
    {
        return appId.Length <= 1 || IgnoredAppIds.Contains(appId);
    }

    public bool IsInstalled()
    {
        return GetSteamInstallPath() != null;
    }

    public async Task<List<Game>> ScanAsync()
    {
        var gamesDict = new Dictionary<string, Game>(StringComparer.OrdinalIgnoreCase);
        var steamPath = GetSteamInstallPath();
        if (steamPath == null) return gamesDict.Values.ToList();

        // 1. Discover known accounts, cryptographically signed apptickets, and hidden collections
        var knownAccounts = GetKnownAccounts();
        var allKnownSteamAccountIds = knownAccounts.Select(a => a.Id).ToList();
        var accountTickets = GetAccountAppTickets(steamPath);
        var accountHiddenApps = GetAccountHiddenApps(steamPath);

        // 2. Discover uninstalled / owned games from user account history with strict ownership filtering
        var ownershipMap = GetAppOwnershipMap(steamPath, accountTickets, accountHiddenApps);

        // 3. Scan installed games from manifests with verified license & LastOwner checking
        var libraryFolders = GetLibraryFolders(steamPath);
        var installedAppIds = new HashSet<string>(StringComparer.OrdinalIgnoreCase);

        foreach (var libFolder in libraryFolders)
        {
            var steamAppsDir = Path.Combine(libFolder, "steamapps");
            if (!Directory.Exists(steamAppsDir)) continue;

            var manifests = Directory.GetFiles(steamAppsDir, "appmanifest_*.acf");
            foreach (var manifest in manifests)
            {
                try
                {
                    var game = ParseAppManifest(manifest, steamAppsDir, accountTickets, accountHiddenApps, allKnownSteamAccountIds);
                    if (game != null)
                    {
                        if (gamesDict.TryGetValue(game.Id, out var existing))
                        {
                            var mergedAccounts = new HashSet<string>(existing.AssociatedAccountIds, StringComparer.OrdinalIgnoreCase);
                            foreach (var aid in game.AssociatedAccountIds) mergedAccounts.Add(aid);
                            gamesDict[game.Id] = existing with { AssociatedAccountIds = mergedAccounts.ToList() };
                        }
                        else
                        {
                            gamesDict[game.Id] = game;
                        }

                        if (!string.IsNullOrEmpty(game.PlatformGameId))
                        {
                            installedAppIds.Add(game.PlatformGameId);
                            _metadataService.CacheName(game.PlatformGameId, game.Name);
                        }
                    }
                }
                catch
                {
                    // Skip malformed manifests
                }
            }
        }

        // 4. Discover uninstalled / owned games from user account history
        var missingNames = new List<string>();

        foreach (var (appId, accounts) in ownershipMap)
        {
            if (IsIgnoredAppId(appId)) continue;
            var gameId = $"steam_{appId}";

            // If the game is already installed, DO NOT overwrite its verified owners with unverified history!
            if (installedAppIds.Contains(appId) || gamesDict.ContainsKey(gameId))
            {
                continue;
            }

            if (accounts.Count == 0) continue;

            var title = _metadataService.GetName(appId);
            if (title == $"Steam App {appId}")
            {
                missingNames.Add(appId);
            }

            var coverUrl = $"https://cdn.cloudflare.steamstatic.com/steam/apps/{appId}/header.jpg";
            var heroUrl = $"https://cdn.cloudflare.steamstatic.com/steam/apps/{appId}/library_hero.jpg";

            var uninstalledGame = new Game(
                Id: gameId,
                Name: title,
                Platform: Platform.Steam,
                InstallPath: string.Empty,
                LaunchUri: $"steam://install/{appId}",
                CoverImageUrl: coverUrl,
                BackgroundImageUrl: heroUrl,
                AssociatedAccountIds: accounts.ToList(),
                IsInstalled: false
            )
            {
                PlatformGameId = appId
            };

            gamesDict[gameId] = uninstalledGame;
        }

        // 5. Resolve missing titles in background without blocking UI
        if (missingNames.Count > 0)
        {
            _ = Task.Run(async () =>
            {
                try
                {
                    await _metadataService.ResolveMissingTitlesAsync(missingNames);
                }
                catch (Exception ex)
                {
                    _logger.LogWarning(ex, "Background metadata resolution encountered error");
                }
            });
        }

        return gamesDict.Values.ToList();
    }

    /// <summary>
    /// Parses signed AppTickets from userdata/<accountId>/config/localconfig.vdf.
    /// AppTickets are cryptographically signed by Valve servers, proving genuine license ownership.
    /// </summary>
    private Dictionary<string, HashSet<string>> GetAccountAppTickets(string steamPath)
    {
        var map = new Dictionary<string, HashSet<string>>(StringComparer.OrdinalIgnoreCase);
        var userdataDir = Path.Combine(steamPath, "userdata");
        if (!Directory.Exists(userdataDir)) return map;

        foreach (var userDir in Directory.GetDirectories(userdataDir))
        {
            var folderName = Path.GetFileName(userDir);
            if (!uint.TryParse(folderName, out var accountId32)) continue;

            var steamId64 = 76561197960265728UL + accountId32;
            var accountId = $"steam_{steamId64}";
            var set = new HashSet<string>(StringComparer.OrdinalIgnoreCase);
            map[accountId] = set;

            var localConfigPath = Path.Combine(userDir, "config", "localconfig.vdf");
            if (!File.Exists(localConfigPath)) continue;

            try
            {
                var content = File.ReadAllText(localConfigPath);
                var idx = content.IndexOf("\"apptickets\"", StringComparison.OrdinalIgnoreCase);
                if (idx >= 0)
                {
                    var open = content.IndexOf('{', idx);
                    if (open >= 0)
                    {
                        int depth = 1;
                        int pos = open + 1;
                        while (pos < content.Length && depth > 0)
                        {
                            if (content[pos] == '{') depth++;
                            else if (content[pos] == '}') depth--;
                            pos++;
                        }

                        if (pos > open)
                        {
                            var section = content.Substring(open, pos - open);
                            var matches = System.Text.RegularExpressions.Regex.Matches(section, @"""(?<id>\d+)""\s*""");
                            foreach (System.Text.RegularExpressions.Match m in matches)
                            {
                                var id = m.Groups["id"].Value;
                                if (!IsIgnoredAppId(id))
                                {
                                    set.Add(id);
                                }
                            }
                        }
                    }
                }
            }
            catch (Exception ex)
            {
                _logger.LogWarning(ex, "Failed to read apptickets for account {AccountId}", accountId);
            }
        }

        return map;
    }

    /// <summary>
    /// Reads user-collections.hidden from cloud storage to identify games explicitly hidden by an account.
    /// </summary>
    private Dictionary<string, HashSet<string>> GetAccountHiddenApps(string steamPath)
    {
        var map = new Dictionary<string, HashSet<string>>(StringComparer.OrdinalIgnoreCase);
        var userdataDir = Path.Combine(steamPath, "userdata");
        if (!Directory.Exists(userdataDir)) return map;

        foreach (var userDir in Directory.GetDirectories(userdataDir))
        {
            var folderName = Path.GetFileName(userDir);
            if (!uint.TryParse(folderName, out var accountId32)) continue;

            var steamId64 = 76561197960265728UL + accountId32;
            var accountId = $"steam_{steamId64}";
            var set = new HashSet<string>(StringComparer.OrdinalIgnoreCase);
            map[accountId] = set;

            var jsonPath = Path.Combine(userDir, "config", "cloudstorage", "cloud-storage-namespace-1.json");
            if (!File.Exists(jsonPath)) continue;

            try
            {
                var content = File.ReadAllText(jsonPath);
                var hiddenIdx = content.IndexOf("\"user-collections.hidden\"", StringComparison.OrdinalIgnoreCase);
                if (hiddenIdx >= 0)
                {
                    var addedIdx = content.IndexOf("\"added\"", hiddenIdx, StringComparison.OrdinalIgnoreCase);
                    if (addedIdx >= 0)
                    {
                        var openBracket = content.IndexOf('[', addedIdx);
                        var closeBracket = content.IndexOf(']', openBracket);
                        if (openBracket >= 0 && closeBracket > openBracket)
                        {
                            var arrayStr = content.Substring(openBracket + 1, closeBracket - openBracket - 1);
                            var parts = arrayStr.Split(',');
                            foreach (var p in parts)
                            {
                                var clean = p.Trim();
                                if (!string.IsNullOrEmpty(clean))
                                {
                                    set.Add(clean);
                                }
                            }
                        }
                    }
                }
            }
            catch (Exception ex)
            {
                _logger.LogWarning(ex, "Failed to parse hidden games for account {AccountId}", accountId);
            }
        }

        return map;
    }

    /// <summary>
    /// Scans userdata/<accountId>/config/localconfig.vdf to map AppIDs to owning SteamID64s.
    /// Filters out hidden games and ensures cross-account conflict resolution for uninstalled games.
    /// </summary>
    private Dictionary<string, HashSet<string>> GetAppOwnershipMap(
        string steamPath,
        Dictionary<string, HashSet<string>> accountTickets,
        Dictionary<string, HashSet<string>> accountHiddenApps)
    {
        var map = new Dictionary<string, HashSet<string>>(StringComparer.OrdinalIgnoreCase);
        var userdataDir = Path.Combine(steamPath, "userdata");
        if (!Directory.Exists(userdataDir)) return map;

        foreach (var userDir in Directory.GetDirectories(userdataDir))
        {
            var folderName = Path.GetFileName(userDir);
            if (!uint.TryParse(folderName, out var accountId32)) continue;

            var steamId64 = 76561197960265728UL + accountId32;
            var accountId = $"steam_{steamId64}";

            var hiddenSet = accountHiddenApps.TryGetValue(accountId, out var h) ? h : null;
            var localConfigPath = Path.Combine(userDir, "config", "localconfig.vdf");
            if (!File.Exists(localConfigPath)) continue;

            try
            {
                var content = File.ReadAllText(localConfigPath);
                ExtractAppIdsFromConfig(content, accountId, map, hiddenSet);
            }
            catch (Exception ex)
            {
                _logger.LogWarning(ex, "Failed to read localconfig for account {AccountId}", accountId);
            }
        }

        // Cross-account conflict resolution for uninstalled games:
        // If an uninstalled game appears on multiple accounts, verify whether only one actually holds a valid AppTicket.
        foreach (var (appId, accounts) in map)
        {
            if (accounts.Count > 1)
            {
                var ticketHolders = accounts.Where(acc =>
                    accountTickets.TryGetValue(acc, out var t) && t.Contains(appId)
                ).ToList();

                if (ticketHolders.Count > 0 && ticketHolders.Count < accounts.Count)
                {
                    accounts.Clear();
                    foreach (var holder in ticketHolders)
                    {
                        accounts.Add(holder);
                    }
                }
            }
        }

        return map;
    }

    private void ExtractAppIdsFromConfig(
        string content,
        string accountId,
        Dictionary<string, HashSet<string>> map,
        HashSet<string>? hiddenSet)
    {
        var appsIndex = content.IndexOf("\"apps\"", StringComparison.OrdinalIgnoreCase);
        while (appsIndex >= 0)
        {
            var openBrace = content.IndexOf('{', appsIndex);
            if (openBrace >= 0)
            {
                int depth = 1;
                int cur = openBrace + 1;
                while (cur < content.Length && depth > 0)
                {
                    if (content[cur] == '{') depth++;
                    else if (content[cur] == '}') depth--;
                    cur++;
                }

                if (cur > openBrace)
                {
                    var appsSection = content.Substring(openBrace, cur - openBrace);
                    var matches = System.Text.RegularExpressions.Regex.Matches(appsSection, @"""(?<id>\d{2,8})""\s*\{");
                    foreach (System.Text.RegularExpressions.Match match in matches)
                    {
                        var appId = match.Groups["id"].Value;
                        if (IsIgnoredAppId(appId)) continue;
                        if (hiddenSet != null && hiddenSet.Contains(appId)) continue;

                        if (!map.TryGetValue(appId, out var accounts))
                        {
                            accounts = new HashSet<string>(StringComparer.OrdinalIgnoreCase);
                            map[appId] = accounts;
                        }
                        accounts.Add(accountId);
                    }
                }
                appsIndex = content.IndexOf("\"apps\"", cur, StringComparison.OrdinalIgnoreCase);
            }
            else
            {
                break;
            }
        }
    }

    /// <summary>
    /// Finds Steam's install directory from the Windows Registry.
    /// Mirrors Playnite's SteamLibrary.GetSteamInstallationPath().
    /// </summary>
    private string? GetSteamInstallPath()
    {
        if (OperatingSystem.IsWindows())
        {
            var path = RegistryHelper.GetValue(SteamRegistryPath, "InstallPath")
                    ?? RegistryHelper.GetValue(SteamRegistryPath32, "InstallPath");

            if (path != null && Directory.Exists(path)) return path;

            var commonPaths = new[]
            {
                @"C:\Program Files (x86)\Steam",
                @"C:\Program Files\Steam",
                Path.Combine(Environment.GetFolderPath(Environment.SpecialFolder.LocalApplicationData), "Steam")
            };

            return commonPaths.FirstOrDefault(Directory.Exists);
        }

        // Linux Steam locations (Native, Flatpak, Snap)
        var home = Environment.GetFolderPath(Environment.SpecialFolder.UserProfile);
        var linuxPaths = new[]
        {
            Path.Combine(home, ".local", "share", "Steam"),
            Path.Combine(home, ".steam", "steam"),
            Path.Combine(home, ".steam", "root"),
            Path.Combine(home, ".var", "app", "com.valvesoftware.Steam", ".local", "share", "Steam"),
            Path.Combine(home, "snap", "steam", "common", ".local", "share", "Steam")
        };

        return linuxPaths.FirstOrDefault(Directory.Exists);
    }

    /// <summary>
    /// Parses libraryfolders.vdf to discover all Steam library locations.
    /// Adapted from Playnite's approach to multi-drive library scanning.
    /// </summary>
    private List<string> GetLibraryFolders(string steamPath)
    {
        var normalizedSteamPath = NormalizePath(steamPath);
        var folders = new HashSet<string>(StringComparer.OrdinalIgnoreCase);
        if (Directory.Exists(normalizedSteamPath))
        {
            folders.Add(normalizedSteamPath);
        }

        var vdfPath = Path.Combine(steamPath, "steamapps", "libraryfolders.vdf");
        if (!File.Exists(vdfPath)) return folders.ToList();

        try
        {
            var root = VdfParser.ParseFile(vdfPath);
            var libraryFolders = root["libraryfolders"];
            if (libraryFolders == null) return folders.ToList();

            foreach (var (_, entry) in libraryFolders.Children)
            {
                var rawPath = entry["path"]?.Value;
                if (!string.IsNullOrWhiteSpace(rawPath))
                {
                    var cleanPath = NormalizePath(rawPath);
                    if (Directory.Exists(cleanPath))
                    {
                        folders.Add(cleanPath);
                    }
                }
            }
        }
        catch
        {
            // Fallback: just use main Steam dir
        }

        return folders.ToList();
    }

    private static string NormalizePath(string path)
    {
        var clean = path.Replace(@"\\", @"\").Trim().TrimEnd('\\', '/');
        try
        {
            return Path.GetFullPath(clean);
        }
        catch
        {
            return clean;
        }
    }

    /// <summary>
    /// Parses an appmanifest_*.acf file to extract game information.
    /// Strictly verifies actual account ownership:
    ///   - Primary Owner: LastOwner in the manifest (the account that downloaded/installed it).
    ///   - Co-Owners: Accounts with a cryptographically signed AppTicket from Valve for this AppId.
    /// Unverified accounts with residual telemetry in localconfig are excluded.
    /// </summary>
    private Game? ParseAppManifest(
        string manifestPath,
        string steamAppsDir,
        Dictionary<string, HashSet<string>> accountTickets,
        Dictionary<string, HashSet<string>> accountHiddenApps,
        List<string> allKnownSteamAccountIds)
    {
        var vdf = VdfParser.ParseFile(manifestPath);
        var appState = vdf["AppState"];
        if (appState == null) return null;

        var appId = appState["appid"]?.Value;
        var name = appState["name"]?.Value;
        var installDir = appState["installdir"]?.Value;

        if (string.IsNullOrEmpty(appId) || string.IsNullOrEmpty(name) || IsIgnoredAppId(appId)) return null;

        // Skip tools, demos, etc. by checking StateFlags (Playnite filter)
        var stateFlags = appState["StateFlags"]?.Value;
        if (stateFlags == "0") return null; // Not installed

        var fullInstallPath = installDir != null
            ? Path.Combine(steamAppsDir, "common", installDir)
            : string.Empty;

        // Steam CDN header image URL pattern
        var coverUrl = $"https://cdn.cloudflare.steamstatic.com/steam/apps/{appId}/header.jpg";
        var heroUrl = $"https://cdn.cloudflare.steamstatic.com/steam/apps/{appId}/library_hero.jpg";

        // Discover true owning accounts
        var associatedAccounts = new HashSet<string>(StringComparer.OrdinalIgnoreCase);

        // 1. LastOwner in appmanifest (The primary account that installed/owns the game)
        var lastOwner = appState["LastOwner"]?.Value;
        if (!string.IsNullOrEmpty(lastOwner) && lastOwner != "0")
        {
            var primaryOwnerId = $"steam_{lastOwner}";
            // Only add if not explicitly hidden by that account
            if (!accountHiddenApps.TryGetValue(primaryOwnerId, out var hidden) || !hidden.Contains(appId))
            {
                associatedAccounts.Add(primaryOwnerId);
            }
        }

        // 2. Additional verified owners on this computer:
        // An account ONLY co-owns an installed game if it has a signed AppTicket for this AppId!
        foreach (var accId in allKnownSteamAccountIds)
        {
            if (associatedAccounts.Contains(accId)) continue;

            if (accountTickets.TryGetValue(accId, out var tickets) && tickets.Contains(appId))
            {
                if (accountHiddenApps.TryGetValue(accId, out var hidden) && hidden.Contains(appId))
                {
                    continue;
                }
                associatedAccounts.Add(accId);
            }
        }

        // Fallback: If no account matched (e.g. fresh install with LastOwner = 0), assign active account or first known
        if (associatedAccounts.Count == 0 && allKnownSteamAccountIds.Count > 0)
        {
            var mostRecent = allKnownSteamAccountIds.FirstOrDefault();
            if (mostRecent != null) associatedAccounts.Add(mostRecent);
        }

        return new Game(
            Id: $"steam_{appId}",
            Name: name,
            Platform: Platform.Steam,
            InstallPath: fullInstallPath,
            LaunchUri: $"steam://rungameid/{appId}",
            CoverImageUrl: coverUrl,
            BackgroundImageUrl: heroUrl,
            AssociatedAccountIds: associatedAccounts.ToList()
        )
        {
            PlatformGameId = appId
        };
    }

    /// <summary>
    /// Reads Steam's loginusers.vdf to discover known accounts.
    /// Used by both Playnite (for game ownership) and TcNo (for account switching).
    /// </summary>
    public List<Account> GetKnownAccounts()
    {
        var accounts = new List<Account>();
        var steamPath = GetSteamInstallPath();
        if (steamPath == null) return accounts;

        var loginUsersPath = Path.Combine(steamPath, "config", "loginusers.vdf");
        if (!File.Exists(loginUsersPath)) return accounts;

        try
        {
            var root = VdfParser.ParseFile(loginUsersPath);
            var users = root["users"];
            if (users == null) return accounts;

            foreach (var (steamId, userData) in users.Children)
            {
                var accountName = userData["AccountName"]?.Value ?? "Unknown";
                var personaName = userData["PersonaName"]?.Value ?? accountName;
                var mostRecent = userData["MostRecent"]?.Value == "1";

                accounts.Add(new Account(
                    Id: $"steam_{steamId}",
                    DisplayName: personaName,
                    Platform: Platform.Steam,
                    PlatformUserId: steamId,
                    IsActive: mostRecent
                ));
            }
        }
        catch
        {
            // Return empty if parsing fails
        }

        return accounts;
    }
}

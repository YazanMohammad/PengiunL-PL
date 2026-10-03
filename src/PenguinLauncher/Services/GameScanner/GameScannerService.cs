using PenguinLauncher.Models;
using PenguinLauncher.Services.AccountSwapper;
using PenguinLauncher.Services.Storage;

namespace PenguinLauncher.Services.GameScanner;

/// <summary>
/// Orchestrates all platform-specific game scanners.
/// Runs all scanners in parallel and merges results.
/// </summary>
public class GameScannerService
{
    private readonly IEnumerable<IGameScanner> _scanners;
    private readonly AccountSwapperService _accountSwapper;
    private readonly JsonStorageService _storage;
    private readonly ILogger<GameScannerService> _logger;

    public GameScannerService(
        IEnumerable<IGameScanner> scanners,
        AccountSwapperService accountSwapper,
        JsonStorageService storage,
        ILogger<GameScannerService> logger)
    {
        _scanners = scanners;
        _accountSwapper = accountSwapper;
        _storage = storage;
        _logger = logger;
    }

    /// <summary>
    /// Runs all platform scanners in parallel and returns the unified game list.
    /// Preserves existing account mappings from saved state.
    /// </summary>
    public async Task<List<Game>> ScanAllAsync()
    {
        var tasks = _scanners
            .Where(s => s.IsInstalled())
            .Select(async scanner =>
            {
                try
                {
                    _logger.LogInformation("Scanning {Platform}...", scanner.Platform);
                    var games = await scanner.ScanAsync();
                    _logger.LogInformation("Found {Count} games on {Platform}", games.Count, scanner.Platform);
                    return games;
                }
                catch (Exception ex)
                {
                    _logger.LogError(ex, "Error scanning {Platform}", scanner.Platform);
                    return new List<Game>();
                }
            });

        var results = await Task.WhenAll(tasks);
        var gamesDict = new Dictionary<string, Game>(StringComparer.OrdinalIgnoreCase);

        foreach (var game in results.SelectMany(g => g))
        {
            if (gamesDict.TryGetValue(game.Id, out var existing))
            {
                var mergedAccounts = new HashSet<string>(existing.AssociatedAccountIds, StringComparer.OrdinalIgnoreCase);
                foreach (var aid in game.AssociatedAccountIds) mergedAccounts.Add(aid);

                bool isInstalled = existing.IsInstalled || game.IsInstalled;
                string installPath = !string.IsNullOrEmpty(existing.InstallPath) ? existing.InstallPath : game.InstallPath;
                string? launchUri = !string.IsNullOrEmpty(existing.LaunchUri) ? existing.LaunchUri : game.LaunchUri;
                string? coverUrl = existing.CoverImageUrl ?? game.CoverImageUrl;
                string? bgUrl = existing.BackgroundImageUrl ?? game.BackgroundImageUrl;

                gamesDict[game.Id] = existing with
                {
                    IsInstalled = isInstalled,
                    InstallPath = installPath,
                    LaunchUri = launchUri,
                    CoverImageUrl = coverUrl,
                    BackgroundImageUrl = bgUrl,
                    AssociatedAccountIds = mergedAccounts.ToList()
                };
            }
            else
            {
                gamesDict[game.Id] = game;
            }
        }

        // Merge with existing state to preserve account mappings and associate accounts
        var state = await _storage.LoadAsync();
        var existingMappings = state.GameAccountMappings;
        var accounts = await _accountSwapper.GetAllAccountsAsync();
        state.Accounts = accounts;

        foreach (var game in gamesDict.Values)
        {
            // Apply explicit user mappings first
            if (existingMappings.TryGetValue(game.Id, out var accountId))
            {
                if (!game.AssociatedAccountIds.Contains(accountId, StringComparer.OrdinalIgnoreCase))
                {
                    game.AssociatedAccountIds.Add(accountId);
                }
            }

            // For non-Steam platforms (Epic, EA, Riot), all games detected for that platform
            // belong to the available account(s) on that platform
            if (game.Platform != Platform.Steam)
            {
                var platformAccounts = accounts.Where(a => a.Platform == game.Platform).Select(a => a.Id);
                foreach (var pAccId in platformAccounts)
                {
                    if (!game.AssociatedAccountIds.Contains(pAccId, StringComparer.OrdinalIgnoreCase))
                    {
                        game.AssociatedAccountIds.Add(pAccId);
                    }
                }
            }
            else
            {
                // For Steam: if game has no associated accounts at all (e.g. unmapped),
                // associate with the active Steam account so it shows in the active account library
                if (game.AssociatedAccountIds.Count == 0)
                {
                    var activeSteam = accounts.FirstOrDefault(a => a.Platform == Platform.Steam && a.IsActive)
                                   ?? accounts.FirstOrDefault(a => a.Platform == Platform.Steam);
                    if (activeSteam != null)
                    {
                        game.AssociatedAccountIds.Add(activeSteam.Id);
                    }
                }
            }
        }

        var allGames = gamesDict.Values.ToList();
        state.Games = allGames;
        state.LastScan = DateTime.UtcNow;
        await _storage.SaveAsync(state);

        return allGames;
    }

    /// <summary>
    /// Returns cached games if available, otherwise triggers a scan.
    /// </summary>
    public async Task<List<Game>> GetGamesAsync(bool forceRescan = false)
    {
        if (!forceRescan)
        {
            var state = await _storage.LoadAsync();
            if (state.Games.Count > 0)
                return state.Games;
        }

        return await ScanAllAsync();
    }
}

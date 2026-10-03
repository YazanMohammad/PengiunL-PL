using PenguinLauncher.Helpers;
using PenguinLauncher.Models;
using PenguinLauncher.Services.AccountSwapper;
using PenguinLauncher.Services.GameScanner;
using PenguinLauncher.Services.Storage;

namespace PenguinLauncher.Services.LaunchManager;

/// <summary>
/// Smart launch integration service.
/// Handles the full workflow:
///   1. Check if game needs an account swap
///   2. If conflict (multiple accounts own the game), return ConflictInfo
///   3. Execute swap if needed
///   4. Launch the game via protocol URI or direct exe
/// </summary>
public class LaunchManagerService
{
    private readonly GameScannerService _gameScanner;
    private readonly AccountSwapperService _accountSwapper;
    private readonly JsonStorageService _storage;
    private readonly ILogger<LaunchManagerService> _logger;

    public LaunchManagerService(
        GameScannerService gameScanner,
        AccountSwapperService accountSwapper,
        JsonStorageService storage,
        ILogger<LaunchManagerService> logger)
    {
        _gameScanner = gameScanner;
        _accountSwapper = accountSwapper;
        _storage = storage;
        _logger = logger;
    }

    /// <summary>
    /// Pre-launch check: determines if a conflict modal is needed.
    /// Returns ConflictInfo if the game has multiple associated accounts.
    /// </summary>
    public async Task<ConflictInfo?> CheckForConflictAsync(string gameId)
    {
        var state = await _storage.LoadAsync();
        var game = state.Games.FirstOrDefault(g => g.Id == gameId);
        if (game == null)
        {
            var scanned = await _gameScanner.GetGamesAsync();
            game = scanned.FirstOrDefault(g => g.Id == gameId);
        }
        if (game == null) return null;

        // If the user already explicitly mapped an account for this game, no conflict
        if (state.GameAccountMappings.ContainsKey(game.Id))
        {
            return null;
        }

        // If game has multiple associated accounts, check if there's an actual choice
        if (game.AssociatedAccountIds.Count > 1)
        {
            var allAccounts = await _accountSwapper.GetAllAccountsAsync();
            var accounts = allAccounts
                .Where(a => game.AssociatedAccountIds.Contains(a.Id, StringComparer.OrdinalIgnoreCase))
                .ToList();

            if (accounts.Count > 1)
            {
                return new ConflictInfo(game.Id, game.Name, accounts);
            }
        }

        return null;
    }

    /// <summary>
    /// Executes the full launch workflow:
    ///   1. Find the game
    ///   2. Determine the target account (auto-switching to the containing account)
    ///   3. Check if account swap is needed
    ///   4. Perform swap if needed
    ///   5. Launch the game
    /// </summary>
    public async Task<LaunchResult> LaunchGameAsync(LaunchRequest request)
    {
        try
        {
            var state = await _storage.LoadAsync();
            var game = state.Games.FirstOrDefault(g => g.Id == request.GameId);
        if (game == null)
        {
            var scanned = await _gameScanner.GetGamesAsync();
            game = scanned.FirstOrDefault(g => g.Id == request.GameId);
        }

        if (game == null)
        {
            return new LaunchResult(false, $"Game not found: {request.GameId}", false);
        }

        _logger.LogInformation("Launching game: {Game} ({Platform})", game.Name, game.Platform);

        var allAccounts = await _accountSwapper.GetAllAccountsAsync();
        var swapper = _accountSwapper.GetSwapper(game.Platform);
        var activeAccount = swapper != null ? await swapper.GetActiveAccountAsync() : null;

        // Determine target account
        Account? targetAccount = null;
        bool swapped = false;

        if (!string.IsNullOrEmpty(request.AccountId))
        {
            targetAccount = allAccounts.FirstOrDefault(a => a.Id == request.AccountId);
        }
        else if (state.GameAccountMappings.TryGetValue(game.Id, out var mappedAccountId))
        {
            targetAccount = allAccounts.FirstOrDefault(a => a.Id == mappedAccountId);
        }
        else if (game.AssociatedAccountIds.Count > 0)
        {
            // Auto-detect the containing account
            var candidateAccounts = allAccounts
                .Where(a => game.AssociatedAccountIds.Contains(a.Id, StringComparer.OrdinalIgnoreCase))
                .ToList();

            if (candidateAccounts.Count > 1)
            {
                // Must prompt user when multiple accounts own the game!
                return new LaunchResult(false, "Multiple accounts own this game. Please choose an account to launch.", false);
            }
            else if (candidateAccounts.Count == 1)
            {
                targetAccount = candidateAccounts[0];
            }
        }

        // Check if we need to swap accounts
        if (targetAccount != null && swapper != null)
        {
            // Only swap if the active account doesn't match the target containing account
            if (activeAccount == null || !activeAccount.Id.Equals(targetAccount.Id, StringComparison.OrdinalIgnoreCase))
            {
                _logger.LogInformation(
                    "Account mismatch detected! Active: {Active}, Target: {Target}. Hot-swapping launcher session...",
                    activeAccount?.DisplayName ?? "None",
                    targetAccount.DisplayName);

                var success = await _accountSwapper.SwapAccountAsync(game.Platform, targetAccount);
                if (!success)
                {
                    return new LaunchResult(false, $"Failed to hot-swap to account: {targetAccount.DisplayName}", false);
                }

                swapped = true;

                // Give launcher time to initialize with the new session
                await Task.Delay(2500);
            }
        }

        // Launch the game
        var launched = false;

        if (game.Platform == Platform.Riot)
        {
            var riotClientExe = FindRiotClientServicesExe();
            if (riotClientExe != null && !string.IsNullOrEmpty(game.PlatformGameId))
            {
                _logger.LogInformation("Launching Riot game via RiotClientServices: {Game}", game.PlatformGameId);
                var proc = ProcessHelper.Launch(riotClientExe, $"--launch-product={game.PlatformGameId} --launch-patchline=live");
                launched = proc != null;
            }
        }

        if (!launched && !string.IsNullOrEmpty(game.LaunchUri) && !game.LaunchUri.StartsWith("riotclient://", StringComparison.OrdinalIgnoreCase))
        {
            // Launch via protocol URI (preferred)
            _logger.LogInformation("Launching via URI: {Uri}", game.LaunchUri);
            var proc = ProcessHelper.LaunchUri(game.LaunchUri);
            launched = proc != null;
        }

        if (!launched && !string.IsNullOrEmpty(game.InstallPath))
        {
            // Direct exe launch as fallback
            var exePath = FindGameExecutable(game.InstallPath);
            if (exePath != null)
            {
                _logger.LogInformation("Launching exe: {Path}", exePath);
                var proc = ProcessHelper.Launch(exePath);
                launched = proc != null;
            }
        }

        if (launched)
        {
            return new LaunchResult(true, $"Launched {game.Name}", swapped);
        }

        return new LaunchResult(false, $"Failed to launch {game.Name}", swapped);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Unexpected error launching game {GameId}", request.GameId);
            return new LaunchResult(false, $"Error launching game: {ex.Message}", false);
        }
    }

    private string? FindRiotClientServicesExe()
    {
        var candidates = new[]
        {
            @"C:\Riot Games\Riot Client\RiotClientServices.exe",
            @"E:\Riot Games\Riot Client\RiotClientServices.exe",
            Path.Combine(Environment.GetFolderPath(Environment.SpecialFolder.LocalApplicationData), "Riot Games", "Riot Client", "RiotClientServices.exe")
        };

        return candidates.FirstOrDefault(File.Exists);
    }

    /// <summary>
    /// Attempts to find the main game executable in an install directory.
    /// </summary>
    private string? FindGameExecutable(string installPath)
    {
        try
        {
            if (!Directory.Exists(installPath)) return null;

            // Look for common exe patterns
            var exes = Directory.GetFiles(installPath, "*.exe", SearchOption.TopDirectoryOnly);
            if (exes.Length == 1) return exes[0];

            // Prefer exes that don't look like installers/uninstallers/crash reporters
            var skipPatterns = new[] { "unins", "crash", "report", "setup", "install", "redist", "update" };
            var filtered = exes.Where(e =>
                !skipPatterns.Any(p => Path.GetFileNameWithoutExtension(e)
                    .Contains(p, StringComparison.OrdinalIgnoreCase)))
                .ToArray();

            return filtered.FirstOrDefault() ?? exes.FirstOrDefault();
        }
        catch (Exception ex)
        {
            _logger.LogWarning(ex, "Failed to scan for game executable in {Path}", installPath);
            return null;
        }
    }
}

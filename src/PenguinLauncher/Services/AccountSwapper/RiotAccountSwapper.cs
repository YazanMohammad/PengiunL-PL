using PenguinLauncher.Helpers;
using PenguinLauncher.Models;
using PenguinLauncher.Services.Storage;
using YamlDotNet.Serialization;
using YamlDotNet.Serialization.NamingConventions;

namespace PenguinLauncher.Services.AccountSwapper;

/// <summary>
/// Handles Riot Games account hot-swapping.
/// Adapted from TcNo Account Switcher's Riot/Valorant switching:
///   - Kills Riot Client and game processes
///   - Backs up/restores RiotGamesPrivateSettings.yaml
///   - Manages RiotClientPrivateSettings.yaml for session tokens
/// Reference: TcNo-Acc-Switcher/TcNo-Acc-Switcher-Server/Pages/Riot/RiotSwitcherFuncs.cs
/// </summary>
public class RiotAccountSwapper : IAccountSwapper
{
    public Platform Platform => Platform.Riot;

    private readonly JsonStorageService _storage;
    private readonly ILogger<RiotAccountSwapper> _logger;

    // Riot Client process names to kill (from TcNo)
    private static readonly string[] RiotProcesses = new[]
    {
        "RiotClientUx",
        "RiotClientServices",
        "VALORANT-Win64-Shipping",
        "LeagueClient",
        "League of Legends"
    };

    public RiotAccountSwapper(JsonStorageService storage, ILogger<RiotAccountSwapper> logger)
    {
        _storage = storage;
        _logger = logger;
    }

    /// <summary>
    /// Gets the currently active Riot account (from saved state).
    /// </summary>
    public async Task<Account?> GetActiveAccountAsync()
    {
        var state = await _storage.LoadAsync();
        return state.Accounts
            .Where(a => a.Platform == Platform.Riot && a.IsActive)
            .FirstOrDefault();
    }

    /// <summary>
    /// Returns all known Riot accounts (backed up sessions).
    /// </summary>
    public async Task<List<Account>> GetAvailableAccountsAsync()
    {
        var state = await _storage.LoadAsync();
        var accounts = state.Accounts.Where(a => a.Platform == Platform.Riot).ToList();

        if (accounts.Count == 0)
        {
            var riotDataPath = GetRiotLocalAppDataPath();
            if (riotDataPath != null)
            {
                var privateSettingsPath = Path.Combine(riotDataPath, "Riot Games", "Riot Client", "Data", "RiotGamesPrivateSettings.yaml");
                if (File.Exists(privateSettingsPath))
                {
                    var initialAccount = new Account(
                        Id: $"riot_active_profile",
                        DisplayName: "Riot Active Profile",
                        Platform: Platform.Riot,
                        PlatformUserId: "Active User",
                        IsActive: true
                    );
                    state.Accounts.Add(initialAccount);
                    await _storage.SaveAsync(state);
                    await BackupCurrentSessionAsync(initialAccount.Id);
                    accounts.Add(initialAccount);
                }
            }
        }

        return accounts;
    }

    /// <summary>
    /// Backs up the current Riot session files for later restoration.
    /// Adapted from TcNo's SaveRiotAccount().
    /// </summary>
    public async Task BackupCurrentSessionAsync(string accountId)
    {
        var riotDataPath = GetRiotLocalAppDataPath();
        if (riotDataPath == null) return;

        var privateSettingsPath = Path.Combine(riotDataPath, "Riot Games", "Riot Client", "Data", "RiotGamesPrivateSettings.yaml");
        var clientSettingsPath = Path.Combine(riotDataPath, "Riot Games", "Riot Client", "Data", "RiotClientPrivateSettings.yaml");

        var backupDir = GetBackupDir(accountId);
        Directory.CreateDirectory(backupDir);

        try
        {
            if (File.Exists(privateSettingsPath))
                File.Copy(privateSettingsPath, Path.Combine(backupDir, "RiotGamesPrivateSettings.yaml"), overwrite: true);

            if (File.Exists(clientSettingsPath))
                File.Copy(clientSettingsPath, Path.Combine(backupDir, "RiotClientPrivateSettings.yaml"), overwrite: true);

            _logger.LogInformation("Backed up Riot session for account: {AccountId}", accountId);
        }
        catch (Exception ex)
        {
            _logger.LogWarning(ex, "Failed to backup Riot session files for {AccountId}", accountId);
        }
    }

    /// <summary>
    /// Performs the Riot account swap:
    /// 1. Kill all Riot processes (TcNo approach)
    /// 2. Backup current session
    /// 3. Restore target account's session files
    /// 4. Launch Riot Client
    /// </summary>
    public async Task<bool> SwapToAccountAsync(Account account)
    {
        _logger.LogInformation("Swapping to Riot account: {Account}", account.DisplayName);

        // Step 1: Kill all Riot processes
        foreach (var processName in RiotProcesses)
        {
            if (ProcessHelper.IsRunning(processName))
            {
                _logger.LogInformation("Killing {Process}...", processName);
                await ProcessHelper.KillProcess(processName);
            }
        }

        await Task.Delay(1500); // Wait for processes to fully exit

        // Step 2: Backup current active session (if any)
        var activeAccount = await GetActiveAccountAsync();
        if (activeAccount != null)
        {
            await BackupCurrentSessionAsync(activeAccount.Id);
        }

        // Step 3: Restore target account's session files
        var riotDataPath = GetRiotLocalAppDataPath();
        if (riotDataPath == null)
        {
            _logger.LogError("Riot local data path not found");
            return false;
        }

        var backupDir = GetBackupDir(account.Id);
        var targetDir = Path.Combine(riotDataPath, "Riot Games", "Riot Client", "Data");
        Directory.CreateDirectory(targetDir);

        // Restore RiotGamesPrivateSettings.yaml (contains auth tokens)
        var backedUpPrivateSettings = Path.Combine(backupDir, "RiotGamesPrivateSettings.yaml");
        var targetPrivateSettings = Path.Combine(targetDir, "RiotGamesPrivateSettings.yaml");

        if (File.Exists(backedUpPrivateSettings))
        {
            File.Copy(backedUpPrivateSettings, targetPrivateSettings, overwrite: true);
            _logger.LogInformation("Restored RiotGamesPrivateSettings.yaml for {Account}", account.DisplayName);
        }
        else
        {
            // If no backup exists, clear the file to force re-login (TcNo behavior)
            _logger.LogWarning("No backup found for {Account}, clearing session", account.DisplayName);
            if (File.Exists(targetPrivateSettings))
                File.Delete(targetPrivateSettings);
        }

        // Restore RiotClientPrivateSettings.yaml
        var backedUpClientSettings = Path.Combine(backupDir, "RiotClientPrivateSettings.yaml");
        var targetClientSettings = Path.Combine(targetDir, "RiotClientPrivateSettings.yaml");

        if (File.Exists(backedUpClientSettings))
        {
            File.Copy(backedUpClientSettings, targetClientSettings, overwrite: true);
        }

        // Step 4: Update state
        var state = await _storage.LoadAsync();
        for (int i = 0; i < state.Accounts.Count; i++)
        {
            if (state.Accounts[i].Platform == Platform.Riot)
            {
                state.Accounts[i] = state.Accounts[i] with { IsActive = (state.Accounts[i].Id == account.Id) };
            }
        }
        await _storage.SaveAsync(state);

        // Step 5: Launch Riot Client
        var riotClientPath = FindRiotClientExe();
        if (riotClientPath != null)
        {
            _logger.LogInformation("Launching Riot Client...");
            ProcessHelper.Launch(riotClientPath);
        }

        return true;
    }

    private string? GetRiotLocalAppDataPath()
    {
        return Environment.GetFolderPath(Environment.SpecialFolder.LocalApplicationData);
    }

    private string GetBackupDir(string accountId)
    {
        var appData = Environment.GetFolderPath(Environment.SpecialFolder.ApplicationData);
        return Path.Combine(appData, "PenguinLauncher", "backups", "riot", accountId);
    }

    private string? FindRiotClientExe()
    {
        var commonPaths = new[]
        {
            Path.Combine(Environment.GetFolderPath(Environment.SpecialFolder.LocalApplicationData),
                "Riot Games", "Riot Client", "RiotClientServices.exe"),
            @"C:\Riot Games\Riot Client\RiotClientServices.exe"
        };

        return commonPaths.FirstOrDefault(File.Exists);
    }

    public async Task<bool> AddAccountAsync(Account account)
    {
        var state = await _storage.LoadAsync();
        state.Accounts.RemoveAll(a => a.Id == account.Id);
        state.Accounts.Add(account);
        await _storage.SaveAsync(state);
        return true;
    }

    public async Task<bool> RemoveAccountAsync(string accountId)
    {
        var state = await _storage.LoadAsync();
        var removed = state.Accounts.RemoveAll(a => a.Id == accountId && a.Platform == Platform.Riot);
        if (removed > 0)
        {
            await _storage.SaveAsync(state);
            try
            {
                var backupDir = GetBackupDir(accountId);
                if (Directory.Exists(backupDir)) Directory.Delete(backupDir, true);
            }
            catch (Exception ex)
            {
                _logger.LogWarning(ex, "Failed to delete Riot backup dir for {Id}", accountId);
            }
            return true;
        }
        return false;
    }

    public async Task<Account?> CaptureActiveSessionAsync(string? customDisplayName = null)
    {
        var riotDataPath = GetRiotLocalAppDataPath();
        if (riotDataPath == null) return null;

        var privateSettings = Path.Combine(riotDataPath, "Riot Games", "Riot Client", "Data", "RiotGamesPrivateSettings.yaml");
        if (!File.Exists(privateSettings)) return null;

        var accountId = $"riot_{DateTime.UtcNow.Ticks}";
        var displayName = !string.IsNullOrWhiteSpace(customDisplayName)
            ? customDisplayName
            : $"Riot Profile {DateTime.Now:MMM dd HH:mm}";

        var account = new Account(
            Id: accountId,
            DisplayName: displayName,
            Platform: Platform.Riot,
            PlatformUserId: accountId,
            IsActive: true
        );

        await BackupCurrentSessionAsync(accountId);

        var state = await _storage.LoadAsync();
        for (int i = 0; i < state.Accounts.Count; i++)
        {
            if (state.Accounts[i].Platform == Platform.Riot)
            {
                state.Accounts[i] = state.Accounts[i] with { IsActive = false };
            }
        }
        state.Accounts.Add(account);
        await _storage.SaveAsync(state);

        return account;
    }

    public async Task<bool> LogoutAsync()
    {
        _logger.LogInformation("Logging out of Riot Games...");
        foreach (var proc in RiotProcesses)
        {
            if (ProcessHelper.IsRunning(proc)) await ProcessHelper.KillProcess(proc);
        }
        await Task.Delay(1000);

        var riotDataPath = GetRiotLocalAppDataPath();
        if (riotDataPath != null)
        {
            var privateSettings = Path.Combine(riotDataPath, "Riot Games", "Riot Client", "Data", "RiotGamesPrivateSettings.yaml");
            if (File.Exists(privateSettings))
            {
                try
                {
                    File.Delete(privateSettings);
                    _logger.LogInformation("Deleted RiotGamesPrivateSettings.yaml to force clean login");
                }
                catch (Exception ex)
                {
                    _logger.LogWarning(ex, "Could not delete RiotGamesPrivateSettings.yaml");
                }
            }
        }

        var state = await _storage.LoadAsync();
        for (int i = 0; i < state.Accounts.Count; i++)
        {
            if (state.Accounts[i].Platform == Platform.Riot)
            {
                state.Accounts[i] = state.Accounts[i] with { IsActive = false };
            }
        }
        await _storage.SaveAsync(state);

        return true;
    }
}

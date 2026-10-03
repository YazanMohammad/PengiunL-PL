using PenguinLauncher.Helpers;
using PenguinLauncher.Models;
using PenguinLauncher.Services.Storage;
using System.Text.RegularExpressions;

namespace PenguinLauncher.Services.AccountSwapper;

/// <summary>
/// Handles Epic Games Launcher account hot-swapping.
/// Adapted from TcNo Account Switcher:
///   - Kills EpicGamesLauncher and EpicWebHelper processes
///   - Backs up/restores GameUserSettings.ini (remember-me tokens) and Data directory
///   - Manages active user configuration
/// </summary>
public class EpicAccountSwapper : IAccountSwapper
{
    public Platform Platform => Platform.Epic;

    private readonly JsonStorageService _storage;
    private readonly ILogger<EpicAccountSwapper> _logger;

    private static readonly string[] EpicProcesses = new[]
    {
        "EpicGamesLauncher",
        "EpicWebHelper"
    };

    public EpicAccountSwapper(JsonStorageService storage, ILogger<EpicAccountSwapper> logger)
    {
        _storage = storage;
        _logger = logger;
    }

    public async Task<Account?> GetActiveAccountAsync()
    {
        var accounts = await GetAvailableAccountsAsync();
        return accounts.FirstOrDefault(a => a.IsActive);
    }

    public async Task<List<Account>> GetAvailableAccountsAsync()
    {
        var state = await _storage.LoadAsync();
        var accounts = state.Accounts.Where(a => a.Platform == Platform.Epic).ToList();

        if (accounts.Count == 0)
        {
            var epicSavedPath = GetEpicSavedPath();
            if (epicSavedPath != null)
            {
                var iniPath = FindGameUserSettingsIni(epicSavedPath);
                if (iniPath != null && File.Exists(iniPath))
                {
                    var (userId, hasToken) = ExtractEpicUserId(iniPath);
                    if (hasToken)
                    {
                        var initialAccount = new Account(
                            Id: $"epic_{userId}",
                            DisplayName: "Epic Games Account",
                            Platform: Platform.Epic,
                            PlatformUserId: userId,
                            IsActive: true
                        );

                        state.Accounts.Add(initialAccount);
                        await _storage.SaveAsync(state);
                        await BackupCurrentSessionAsync(initialAccount.Id);
                        accounts.Add(initialAccount);
                    }
                }
            }
        }

        return accounts;
    }

    public async Task BackupCurrentSessionAsync(string accountId)
    {
        var epicSaved = GetEpicSavedPath();
        if (epicSaved == null || !Directory.Exists(epicSaved)) return;

        var backupDir = GetBackupDir(accountId);
        Directory.CreateDirectory(backupDir);

        // Backup Config folder
        var configSource = Path.Combine(epicSaved, "Config");
        if (Directory.Exists(configSource))
        {
            var configDest = Path.Combine(backupDir, "Config");
            CopyDirectory(configSource, configDest);
        }

        // Backup Data folder
        var dataSource = Path.Combine(epicSaved, "Data");
        if (Directory.Exists(dataSource))
        {
            var dataDest = Path.Combine(backupDir, "Data");
            CopyDirectory(dataSource, dataDest);
        }

        _logger.LogInformation("Backed up Epic session for account {AccountId}", accountId);
        await Task.CompletedTask;
    }

    public async Task<bool> SwapToAccountAsync(Account account)
    {
        _logger.LogInformation("Swapping to Epic account: {Account}", account.DisplayName);

        // Step 1: Kill Epic processes
        foreach (var proc in EpicProcesses)
        {
            if (ProcessHelper.IsRunning(proc))
            {
                _logger.LogInformation("Killing {Proc}...", proc);
                await ProcessHelper.KillProcess(proc);
            }
        }
        await Task.Delay(1500);

        // Step 2: Backup current active session
        var activeAccount = await GetActiveAccountAsync();
        if (activeAccount != null && activeAccount.Id != account.Id)
        {
            await BackupCurrentSessionAsync(activeAccount.Id);
        }

        // Step 3: Restore target account files
        var epicSaved = GetEpicSavedPath();
        if (epicSaved == null)
        {
            _logger.LogError("Epic Saved path not found");
            return false;
        }

        var backupDir = GetBackupDir(account.Id);
        if (Directory.Exists(backupDir))
        {
            var backedUpConfig = Path.Combine(backupDir, "Config");
            if (Directory.Exists(backedUpConfig))
            {
                CopyDirectory(backedUpConfig, Path.Combine(epicSaved, "Config"));
            }

            var backedUpData = Path.Combine(backupDir, "Data");
            if (Directory.Exists(backedUpData))
            {
                CopyDirectory(backedUpData, Path.Combine(epicSaved, "Data"));
            }

            _logger.LogInformation("Restored Epic session for {Account}", account.DisplayName);
        }
        else
        {
            _logger.LogWarning("No backup found for Epic account {Account}", account.DisplayName);
        }

        // Step 4: Update state
        var state = await _storage.LoadAsync();
        for (int i = 0; i < state.Accounts.Count; i++)
        {
            if (state.Accounts[i].Platform == Platform.Epic)
            {
                state.Accounts[i] = state.Accounts[i] with { IsActive = (state.Accounts[i].Id == account.Id) };
            }
        }
        await _storage.SaveAsync(state);

        // Step 5: Restart Epic Games Launcher
        var launcherExe = FindEpicLauncherExe();
        if (launcherExe != null)
        {
            _logger.LogInformation("Restarting Epic Games Launcher...");
            ProcessHelper.Launch(launcherExe);
        }
        else
        {
            ProcessHelper.LaunchUri("com.epicgames.launcher://");
        }

        return true;
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
        var removed = state.Accounts.RemoveAll(a => a.Id == accountId && a.Platform == Platform.Epic);
        if (removed > 0)
        {
            await _storage.SaveAsync(state);
            try
            {
                var dir = GetBackupDir(accountId);
                if (Directory.Exists(dir)) Directory.Delete(dir, true);
            }
            catch (Exception ex)
            {
                _logger.LogWarning(ex, "Failed to delete Epic backup dir for {Id}", accountId);
            }
            return true;
        }
        return false;
    }

    public async Task<Account?> CaptureActiveSessionAsync(string? customDisplayName = null)
    {
        var epicSaved = GetEpicSavedPath();
        if (epicSaved == null) return null;

        var iniPath = FindGameUserSettingsIni(epicSaved);
        var (userId, hasToken) = iniPath != null ? ExtractEpicUserId(iniPath) : ($"{DateTime.UtcNow.Ticks}", true);

        var accountId = $"epic_{userId}";
        var displayName = !string.IsNullOrWhiteSpace(customDisplayName)
            ? customDisplayName
            : $"Epic Account ({userId[..Math.Min(8, userId.Length)]})";

        var account = new Account(
            Id: accountId,
            DisplayName: displayName,
            Platform: Platform.Epic,
            PlatformUserId: userId,
            IsActive: true
        );

        await BackupCurrentSessionAsync(accountId);

        var state = await _storage.LoadAsync();
        for (int i = 0; i < state.Accounts.Count; i++)
        {
            if (state.Accounts[i].Platform == Platform.Epic)
            {
                state.Accounts[i] = state.Accounts[i] with { IsActive = false };
            }
        }
        state.Accounts.RemoveAll(a => a.Id == accountId);
        state.Accounts.Add(account);
        await _storage.SaveAsync(state);

        return account;
    }

    public async Task<bool> LogoutAsync()
    {
        _logger.LogInformation("Logging out of Epic Games Launcher...");
        foreach (var proc in EpicProcesses)
        {
            if (ProcessHelper.IsRunning(proc)) await ProcessHelper.KillProcess(proc);
        }
        await Task.Delay(1000);

        var epicSaved = GetEpicSavedPath();
        if (epicSaved != null)
        {
            var iniPath = FindGameUserSettingsIni(epicSaved);
            if (iniPath != null && File.Exists(iniPath))
            {
                try
                {
                    // Clear RememberMe tokens from GameUserSettings.ini
                    var content = await File.ReadAllTextAsync(iniPath);
                    var cleaned = Regex.Replace(content, @"\[RememberMe\][\r\n]+Enable=.*[\r\n]+Data=.*", "[RememberMe]\nEnable=False");
                    await File.WriteAllTextAsync(iniPath, cleaned);
                }
                catch (Exception ex)
                {
                    _logger.LogWarning(ex, "Failed to clear Epic RememberMe token");
                }
            }
        }

        var state = await _storage.LoadAsync();
        for (int i = 0; i < state.Accounts.Count; i++)
        {
            if (state.Accounts[i].Platform == Platform.Epic)
            {
                state.Accounts[i] = state.Accounts[i] with { IsActive = false };
            }
        }
        await _storage.SaveAsync(state);

        return true;
    }

    private string? GetEpicSavedPath()
    {
        var localAppData = Environment.GetFolderPath(Environment.SpecialFolder.LocalApplicationData);
        var path = Path.Combine(localAppData, "EpicGamesLauncher", "Saved");
        return Directory.Exists(path) ? path : null;
    }

    private string? FindGameUserSettingsIni(string savedPath)
    {
        var candidate1 = Path.Combine(savedPath, "Config", "WindowsEditor", "GameUserSettings.ini");
        if (File.Exists(candidate1)) return candidate1;

        var candidate2 = Path.Combine(savedPath, "Config", "Windows", "GameUserSettings.ini");
        if (File.Exists(candidate2)) return candidate2;

        return null;
    }

    private (string userId, bool hasToken) ExtractEpicUserId(string iniPath)
    {
        try
        {
            var text = File.ReadAllText(iniPath);
            var match = Regex.Match(text, @"\[([a-f0-9]{24,36})_General\]", RegexOptions.IgnoreCase);
            var hasToken = text.Contains("[RememberMe]") && text.Contains("Enable=True");
            var id = match.Success ? match.Groups[1].Value : $"{DateTime.UtcNow.Ticks}";
            return (id, hasToken);
        }
        catch
        {
            return ($"{DateTime.UtcNow.Ticks}", false);
        }
    }

    private string GetBackupDir(string accountId)
    {
        var appData = Environment.GetFolderPath(Environment.SpecialFolder.ApplicationData);
        return Path.Combine(appData, "PenguinLauncher", "backups", "epic", accountId);
    }

    private string? FindEpicLauncherExe()
    {
        var reg = RegistryHelper.GetValue(@"HKLM\SOFTWARE\WOW6432Node\Epic Games\EpicGamesLauncher", "AppDataPath");
        if (reg != null)
        {
            var candidate = Path.Combine(reg, "..", "Portal", "Binaries", "Win64", "EpicGamesLauncher.exe");
            if (File.Exists(candidate)) return Path.GetFullPath(candidate);
        }

        var fallbacks = new[]
        {
            @"C:\Program Files (x86)\Epic Games\Launcher\Portal\Binaries\Win64\EpicGamesLauncher.exe",
            @"C:\Program Files\Epic Games\Launcher\Portal\Binaries\Win64\EpicGamesLauncher.exe"
        };

        return fallbacks.FirstOrDefault(File.Exists);
    }

    private static void CopyDirectory(string sourceDir, string destDir)
    {
        try
        {
            Directory.CreateDirectory(destDir);
            foreach (var file in Directory.GetFiles(sourceDir))
            {
                try
                {
                    var destFile = Path.Combine(destDir, Path.GetFileName(file));
                    File.Copy(file, destFile, true);
                }
                catch
                {
                    // Ignore locked files
                }
            }
            foreach (var dir in Directory.GetDirectories(sourceDir))
            {
                try
                {
                    var destSub = Path.Combine(destDir, Path.GetFileName(dir));
                    CopyDirectory(dir, destSub);
                }
                catch
                {
                    // Ignore locked subdirectories
                }
            }
        }
        catch
        {
            // Ignore access errors on sourceDir
        }
    }
}

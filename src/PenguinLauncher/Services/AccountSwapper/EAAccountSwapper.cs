using PenguinLauncher.Helpers;
using PenguinLauncher.Models;
using PenguinLauncher.Services.Storage;
using System.Text.RegularExpressions;

namespace PenguinLauncher.Services.AccountSwapper;

/// <summary>
/// Handles EA App (Electronic Arts Desktop) account hot-swapping.
/// Adapted from TcNo Account Switcher:
///   - Kills EADesktop, EABackgroundService, Origin processes
///   - Backs up/restores user_*.ini, cookie.ini, telemetry.ini session tokens
///   - Manages active user authentication state
/// </summary>
public class EAAccountSwapper : IAccountSwapper
{
    public Platform Platform => Platform.EA;

    private readonly JsonStorageService _storage;
    private readonly ILogger<EAAccountSwapper> _logger;

    private static readonly string[] EAProcesses = new[]
    {
        "EADesktop",
        "EABackgroundService",
        "EALauncher",
        "Origin",
        "OriginWebHelperService"
    };

    public EAAccountSwapper(JsonStorageService storage, ILogger<EAAccountSwapper> logger)
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
        var accounts = state.Accounts.Where(a => a.Platform == Platform.EA).ToList();

        if (accounts.Count == 0)
        {
            var eaPath = GetEALocalAppDataPath();
            if (eaPath != null && Directory.Exists(eaPath))
            {
                var userIniFiles = Directory.GetFiles(eaPath, "user_*.ini");
                if (userIniFiles.Length > 0)
                {
                    var file = userIniFiles[0];
                    var (userId, persona) = ParseEAIniFile(file);

                    var initialAccount = new Account(
                        Id: $"ea_{userId}",
                        DisplayName: persona ?? "EA App User",
                        Platform: Platform.EA,
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

        return accounts;
    }

    public async Task BackupCurrentSessionAsync(string accountId)
    {
        var eaPath = GetEALocalAppDataPath();
        if (eaPath == null || !Directory.Exists(eaPath)) return;

        var backupDir = GetBackupDir(accountId);
        Directory.CreateDirectory(backupDir);

        // Copy user_*.ini files
        foreach (var file in Directory.GetFiles(eaPath, "user_*.ini"))
        {
            try { File.Copy(file, Path.Combine(backupDir, Path.GetFileName(file)), true); } catch { }
        }

        // Copy cookie.ini and telemetry.ini
        var cookieFile = Path.Combine(eaPath, "cookie.ini");
        if (File.Exists(cookieFile))
            try { File.Copy(cookieFile, Path.Combine(backupDir, "cookie.ini"), true); } catch { }

        var telemetryFile = Path.Combine(eaPath, "telemetry.ini");
        if (File.Exists(telemetryFile))
            try { File.Copy(telemetryFile, Path.Combine(backupDir, "telemetry.ini"), true); } catch { }

        _logger.LogInformation("Backed up EA session for account {AccountId}", accountId);
        await Task.CompletedTask;
    }

    public async Task<bool> SwapToAccountAsync(Account account)
    {
        _logger.LogInformation("Swapping to EA account: {Account}", account.DisplayName);

        // Step 1: Kill EA processes
        foreach (var proc in EAProcesses)
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
        var eaPath = GetEALocalAppDataPath();
        if (eaPath == null)
        {
            _logger.LogError("EA local app data path not found");
            return false;
        }

        var backupDir = GetBackupDir(account.Id);
        if (Directory.Exists(backupDir))
        {
            // Clear current user_*.ini in target folder
            foreach (var f in Directory.GetFiles(eaPath, "user_*.ini"))
            {
                try { File.Delete(f); } catch { }
            }

            // Restore files from backup
            foreach (var f in Directory.GetFiles(backupDir))
            {
                try { File.Copy(f, Path.Combine(eaPath, Path.GetFileName(f)), true); } catch { }
            }

            _logger.LogInformation("Restored EA session for {Account}", account.DisplayName);
        }
        else
        {
            _logger.LogWarning("No backup found for EA account {Account}", account.DisplayName);
        }

        // Step 4: Update state
        var state = await _storage.LoadAsync();
        for (int i = 0; i < state.Accounts.Count; i++)
        {
            if (state.Accounts[i].Platform == Platform.EA)
            {
                state.Accounts[i] = state.Accounts[i] with { IsActive = (state.Accounts[i].Id == account.Id) };
            }
        }
        await _storage.SaveAsync(state);

        // Step 5: Restart EA App
        var eaExe = FindEALauncherExe();
        if (eaExe != null)
        {
            _logger.LogInformation("Restarting EA App...");
            ProcessHelper.Launch(eaExe);
        }
        else
        {
            ProcessHelper.LaunchUri("origin://");
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
        var removed = state.Accounts.RemoveAll(a => a.Id == accountId && a.Platform == Platform.EA);
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
                _logger.LogWarning(ex, "Failed to delete EA backup dir for {Id}", accountId);
            }
            return true;
        }
        return false;
    }

    public async Task<Account?> CaptureActiveSessionAsync(string? customDisplayName = null)
    {
        var eaPath = GetEALocalAppDataPath();
        if (eaPath == null) return null;

        var userIniFiles = Directory.GetFiles(eaPath, "user_*.ini");
        var userId = $"{DateTime.UtcNow.Ticks}";
        string? persona = null;

        if (userIniFiles.Length > 0)
        {
            var parsed = ParseEAIniFile(userIniFiles[0]);
            userId = parsed.userId;
            persona = parsed.persona;
        }

        var accountId = $"ea_{userId}";
        var displayName = !string.IsNullOrWhiteSpace(customDisplayName)
            ? customDisplayName
            : persona ?? $"EA Account ({userId[..Math.Min(8, userId.Length)]})";

        var account = new Account(
            Id: accountId,
            DisplayName: displayName,
            Platform: Platform.EA,
            PlatformUserId: userId,
            IsActive: true
        );

        await BackupCurrentSessionAsync(accountId);

        var state = await _storage.LoadAsync();
        for (int i = 0; i < state.Accounts.Count; i++)
        {
            if (state.Accounts[i].Platform == Platform.EA)
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
        _logger.LogInformation("Logging out of EA App...");
        foreach (var proc in EAProcesses)
        {
            if (ProcessHelper.IsRunning(proc)) await ProcessHelper.KillProcess(proc);
        }
        await Task.Delay(1000);

        var eaPath = GetEALocalAppDataPath();
        if (eaPath != null)
        {
            foreach (var f in Directory.GetFiles(eaPath, "user_*.ini"))
            {
                try { File.Delete(f); } catch { }
            }
            var cookie = Path.Combine(eaPath, "cookie.ini");
            if (File.Exists(cookie))
            {
                try { File.Delete(cookie); } catch { }
            }
        }

        var state = await _storage.LoadAsync();
        for (int i = 0; i < state.Accounts.Count; i++)
        {
            if (state.Accounts[i].Platform == Platform.EA)
            {
                state.Accounts[i] = state.Accounts[i] with { IsActive = false };
            }
        }
        await _storage.SaveAsync(state);

        return true;
    }

    private string? GetEALocalAppDataPath()
    {
        var localAppData = Environment.GetFolderPath(Environment.SpecialFolder.LocalApplicationData);
        var eaPath = Path.Combine(localAppData, "Electronic Arts", "EA Desktop");
        if (Directory.Exists(eaPath)) return eaPath;

        var originPath = Path.Combine(localAppData, "Origin");
        if (Directory.Exists(originPath)) return originPath;

        return null;
    }

    private (string userId, string? persona) ParseEAIniFile(string filePath)
    {
        try
        {
            var fileName = Path.GetFileNameWithoutExtension(filePath);
            var idMatch = Regex.Match(fileName, @"user_(\d+)");
            var id = idMatch.Success ? idMatch.Groups[1].Value : $"{DateTime.UtcNow.Ticks}";

            var lines = File.ReadAllLines(filePath);
            string? userId = null;
            foreach (var line in lines)
            {
                if (line.StartsWith("user.userid=", StringComparison.OrdinalIgnoreCase))
                {
                    userId = line["user.userid=".Length..].Trim();
                }
            }

            return (userId ?? id, null);
        }
        catch
        {
            return ($"{DateTime.UtcNow.Ticks}", null);
        }
    }

    private string GetBackupDir(string accountId)
    {
        var appData = Environment.GetFolderPath(Environment.SpecialFolder.ApplicationData);
        return Path.Combine(appData, "PenguinLauncher", "backups", "ea", accountId);
    }

    private string? FindEALauncherExe()
    {
        var reg = RegistryHelper.GetValue(@"HKLM\SOFTWARE\Electronic Arts\EA Desktop", "InstallLocation")
               ?? RegistryHelper.GetValue(@"HKLM\SOFTWARE\WOW6432Node\Origin", "ClientPath");

        if (reg != null)
        {
            if (File.Exists(reg)) return reg;
            var dir = Path.GetDirectoryName(reg);
            if (dir != null)
            {
                var candidate = Path.Combine(dir, "EADesktop.exe");
                if (File.Exists(candidate)) return candidate;
                var candidate2 = Path.Combine(dir, "EALauncher.exe");
                if (File.Exists(candidate2)) return candidate2;
            }
        }

        var fallbacks = new[]
        {
            @"C:\Program Files\Electronic Arts\EA Desktop\EA Desktop\EADesktop.exe",
            @"C:\Program Files\Electronic Arts\EA Desktop\EA Desktop\EALauncher.exe",
            @"C:\Program Files (x86)\Origin\Origin.exe"
        };

        return fallbacks.FirstOrDefault(File.Exists);
    }
}

using PenguinLauncher.Helpers;
using PenguinLauncher.Models;
using PenguinLauncher.Services.Storage;

namespace PenguinLauncher.Services.AccountSwapper;

/// <summary>
/// Handles Steam account hot-swapping.
/// Heavily adapted from TcNo Account Switcher's Steam switching logic:
///   - Kills Steam process
///   - Modifies loginusers.vdf to set the target account as "MostRecent"
///   - Sets HKCU\SOFTWARE\Valve\Steam -> AutoLoginUser registry key
///   - Sets RememberPassword flag
///   - Restarts Steam with the correct user context
/// Reference: TcNo-Acc-Switcher/TcNo-Acc-Switcher-Server/Pages/Steam/SteamSwitcherFuncs.cs
/// </summary>
public class SteamAccountSwapper : IAccountSwapper
{
    public Platform Platform => Platform.Steam;

    private const string SteamRegistryPath = @"HKCU\SOFTWARE\Valve\Steam";
    private readonly JsonStorageService _storage;
    private readonly ILogger<SteamAccountSwapper> _logger;

    public SteamAccountSwapper(JsonStorageService storage, ILogger<SteamAccountSwapper> logger)
    {
        _storage = storage;
        _logger = logger;
    }

    /// <summary>
    /// Gets the currently active Steam account from the registry.
    /// Mirrors TcNo's GetCurrentAccountId().
    /// </summary>
    public async Task<Account?> GetActiveAccountAsync()
    {
        var autoLoginUser = RegistryHelper.GetValue(SteamRegistryPath, "AutoLoginUser");
        if (string.IsNullOrEmpty(autoLoginUser)) return null;

        var accounts = await GetAvailableAccountsAsync();
        return accounts.FirstOrDefault(a =>
            a.PlatformUserId == autoLoginUser ||
            a.DisplayName.Equals(autoLoginUser, StringComparison.OrdinalIgnoreCase) ||
            a.Id.Equals(autoLoginUser, StringComparison.OrdinalIgnoreCase));
    }

    /// <summary>
    /// Reads all known accounts from loginusers.vdf.
    /// Adapted from TcNo's account discovery logic.
    /// </summary>
    public async Task<List<Account>> GetAvailableAccountsAsync()
    {
        var steamPath = GetSteamPath();
        var state = await _storage.LoadAsync();
        var stateAccounts = state.Accounts.Where(a => a.Platform == Platform.Steam).ToList();

        if (steamPath == null) return stateAccounts;

        var loginUsersPath = Path.Combine(steamPath, "config", "loginusers.vdf");
        if (!File.Exists(loginUsersPath)) return stateAccounts;

        var accounts = new List<Account>();

        try
        {
            var root = VdfParser.ParseFile(loginUsersPath);
            var users = root["users"];
            if (users == null) return stateAccounts;

            var autoLoginUser = RegistryHelper.GetValue(SteamRegistryPath, "AutoLoginUser") ?? "";

            foreach (var (steamId, userData) in users.Children)
            {
                var accountName = userData["AccountName"]?.Value ?? "Unknown";
                var personaName = userData["PersonaName"]?.Value ?? accountName;
                var isActive = !string.IsNullOrEmpty(autoLoginUser) && (
                    accountName.Equals(autoLoginUser, StringComparison.OrdinalIgnoreCase) ||
                    steamId.Equals(autoLoginUser, StringComparison.OrdinalIgnoreCase));

                // Check if user set a custom display name in state
                var existing = stateAccounts.FirstOrDefault(a => a.PlatformUserId == steamId || a.Id == $"steam_{steamId}");
                var displayName = existing != null ? existing.DisplayName : personaName;

                accounts.Add(new Account(
                    Id: $"steam_{steamId}",
                    DisplayName: displayName,
                    Platform: Platform.Steam,
                    PlatformUserId: steamId,
                    IsActive: isActive
                ));
            }

            // Include any custom accounts in state that weren't in loginusers.vdf
            foreach (var sa in stateAccounts)
            {
                if (!accounts.Any(a => a.Id == sa.Id))
                {
                    accounts.Add(sa);
                }
            }
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to parse loginusers.vdf");
            return stateAccounts;
        }

        return accounts;
    }

    /// <summary>
    /// Performs the actual account swap. This is the core of TcNo's Steam switching:
    /// 1. Kill Steam
    /// 2. Modify loginusers.vdf (set MostRecent=1 for target, 0 for others)
    /// 3. Update registry AutoLoginUser
    /// 4. Restart Steam
    /// </summary>
    public async Task<bool> SwapToAccountAsync(Account account)
    {
        var steamPath = GetSteamPath();
        if (steamPath == null)
        {
            _logger.LogError("Steam install path not found");
            return false;
        }

        _logger.LogInformation("Swapping to Steam account: {Account}", account.DisplayName);

        // Step 1: Kill Steam (TcNo approach)
        _logger.LogInformation("Killing Steam process...");
        var killed = await ProcessHelper.KillProcess("steam");
        if (!killed)
        {
            _logger.LogWarning("Failed to fully kill Steam, proceeding anyway");
        }

        // Give Steam time to fully close
        await Task.Delay(1500);

        // Step 2: Modify loginusers.vdf (TcNo's SwapSteamAccounts logic)
        var loginUsersPath = Path.Combine(steamPath, "config", "loginusers.vdf");
        if (File.Exists(loginUsersPath))
        {
            try
            {
                var root = VdfParser.ParseFile(loginUsersPath);
                var users = root["users"];
                if (users != null)
                {
                    // Find the account name for this Steam ID
                    string? targetAccountName = null;

                    foreach (var (steamId, userData) in users.Children)
                    {
                        if (steamId == account.PlatformUserId ||
                            $"steam_{steamId}" == account.Id)
                        {
                            // Set this as most recent
                            userData.Children["MostRecent"] = new VdfParser.VdfNode { Value = "1" };
                            userData.Children["RememberPassword"] = new VdfParser.VdfNode { Value = "1" };
                            targetAccountName = userData["AccountName"]?.Value;
                        }
                        else
                        {
                            // Clear MostRecent for all other accounts
                            userData.Children["MostRecent"] = new VdfParser.VdfNode { Value = "0" };
                        }
                    }

                    // Write back the modified VDF
                    var serialized = VdfParser.Serialize(root);
                    await File.WriteAllTextAsync(loginUsersPath, serialized);

                    // Step 3: Update registry (TcNo's SetSteamRegistryAutoLogin)
                    if (targetAccountName != null)
                    {
                        RegistryHelper.SetValue(SteamRegistryPath, "AutoLoginUser", targetAccountName);
                        RegistryHelper.SetDword(SteamRegistryPath, "RememberPassword", 1);
                        _logger.LogInformation("Set AutoLoginUser to: {User}", targetAccountName);
                    }
                }
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Failed to modify loginusers.vdf");
                return false;
            }
        }

        // Step 4: Restart Steam
        var steamExe = Path.Combine(steamPath, "steam.exe");
        if (File.Exists(steamExe))
        {
            _logger.LogInformation("Restarting Steam...");
            ProcessHelper.Launch(steamExe, "-silent");
        }

        // Step 5: Update state
        try
        {
            var state = await _storage.LoadAsync();
            for (int i = 0; i < state.Accounts.Count; i++)
            {
                if (state.Accounts[i].Platform == Platform.Steam)
                {
                    bool isTarget = state.Accounts[i].Id == account.Id ||
                                    state.Accounts[i].PlatformUserId == account.PlatformUserId;
                    state.Accounts[i] = state.Accounts[i] with { IsActive = isTarget };
                }
            }
            await _storage.SaveAsync(state);
        }
        catch (Exception ex)
        {
            _logger.LogWarning(ex, "Failed to persist Steam active state");
        }

        return true;
    }

    public Task BackupCurrentSessionAsync(string accountId)
    {
        // Steam doesn't need explicit session backup — loginusers.vdf is the source of truth
        // TcNo handles this implicitly through the VDF manipulation
        return Task.CompletedTask;
    }

    public async Task<bool> AddAccountAsync(Account account)
    {
        var state = await _storage.LoadAsync();
        state.Accounts.RemoveAll(a => a.Id == account.Id || (a.Platform == Platform.Steam && a.PlatformUserId == account.PlatformUserId));
        state.Accounts.Add(account);
        await _storage.SaveAsync(state);
        return true;
    }

    public async Task<bool> RemoveAccountAsync(string accountId)
    {
        var state = await _storage.LoadAsync();
        var removed = state.Accounts.RemoveAll(a => a.Id == accountId && a.Platform == Platform.Steam);

        // Also if found in loginusers.vdf, remove the entry so it won't reappear
        var steamPath = GetSteamPath();
        if (steamPath != null)
        {
            var loginUsersPath = Path.Combine(steamPath, "config", "loginusers.vdf");
            if (File.Exists(loginUsersPath))
            {
                try
                {
                    var root = VdfParser.ParseFile(loginUsersPath);
                    var users = root["users"];
                    var rawId = accountId.StartsWith("steam_") ? accountId[6..] : accountId;
                    if (users != null && users.Children.ContainsKey(rawId))
                    {
                        users.Children.Remove(rawId);
                        var serialized = VdfParser.Serialize(root);
                        await File.WriteAllTextAsync(loginUsersPath, serialized);
                        removed++;
                    }
                }
                catch (Exception ex)
                {
                    _logger.LogWarning(ex, "Failed to remove account from loginusers.vdf");
                }
            }
        }

        if (removed > 0)
        {
            await _storage.SaveAsync(state);
            return true;
        }
        return false;
    }

    public async Task<Account?> CaptureActiveSessionAsync(string? customDisplayName = null)
    {
        var autoLoginUser = RegistryHelper.GetValue(SteamRegistryPath, "AutoLoginUser");
        var accounts = await GetAvailableAccountsAsync();

        Account? target = null;
        if (!string.IsNullOrEmpty(autoLoginUser))
        {
            target = accounts.FirstOrDefault(a =>
                a.PlatformUserId == autoLoginUser ||
                a.DisplayName.Equals(autoLoginUser, StringComparison.OrdinalIgnoreCase));
        }

        if (target == null && accounts.Count > 0)
        {
            target = accounts.First();
        }

        if (target == null) return null;

        var finalAccount = target with
        {
            DisplayName = !string.IsNullOrWhiteSpace(customDisplayName) ? customDisplayName : target.DisplayName,
            IsActive = true
        };

        await AddAccountAsync(finalAccount);
        return finalAccount;
    }

    public async Task<bool> LogoutAsync()
    {
        _logger.LogInformation("Logging out of Steam...");
        await ProcessHelper.KillProcess("steam");
        await Task.Delay(1000);

        // Clear AutoLoginUser and RememberPassword
        RegistryHelper.SetValue(SteamRegistryPath, "AutoLoginUser", "");
        RegistryHelper.SetDword(SteamRegistryPath, "RememberPassword", 0);

        var state = await _storage.LoadAsync();
        for (int i = 0; i < state.Accounts.Count; i++)
        {
            if (state.Accounts[i].Platform == Platform.Steam)
            {
                state.Accounts[i] = state.Accounts[i] with { IsActive = false };
            }
        }
        await _storage.SaveAsync(state);

        return true;
    }

    private string? GetSteamPath()
    {
        var path = RegistryHelper.GetValue(@"HKLM\SOFTWARE\Valve\Steam", "InstallPath")
                ?? RegistryHelper.GetValue(@"HKLM\SOFTWARE\WOW6432Node\Valve\Steam", "InstallPath");

        if (path != null && Directory.Exists(path)) return path;

        var fallbacks = new[]
        {
            @"C:\Program Files (x86)\Steam",
            @"C:\Program Files\Steam"
        };

        return fallbacks.FirstOrDefault(Directory.Exists);
    }
}

using PenguinLauncher.Models;

namespace PenguinLauncher.Services.AccountSwapper;

/// <summary>
/// Orchestrates account swapping across all platforms.
/// Routes swap requests to the correct platform-specific swapper.
/// </summary>
public class AccountSwapperService
{
    private readonly IEnumerable<IAccountSwapper> _swappers;
    private readonly ILogger<AccountSwapperService> _logger;

    public AccountSwapperService(
        IEnumerable<IAccountSwapper> swappers,
        ILogger<AccountSwapperService> logger)
    {
        _swappers = swappers;
        _logger = logger;
    }

    public IAccountSwapper? GetSwapper(Platform platform)
    {
        return _swappers.FirstOrDefault(s => s.Platform == platform);
    }

    public async Task<bool> SwapAccountAsync(Platform platform, Account account)
    {
        var swapper = GetSwapper(platform);
        if (swapper == null)
        {
            _logger.LogError("No swapper registered for platform: {Platform}", platform);
            return false;
        }

        return await swapper.SwapToAccountAsync(account);
    }

    public async Task<List<Account>> GetAllAccountsAsync()
    {
        var allAccounts = new List<Account>();
        foreach (var swapper in _swappers)
        {
            try
            {
                var accounts = await swapper.GetAvailableAccountsAsync();
                allAccounts.AddRange(accounts);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting accounts for {Platform}", swapper.Platform);
            }
        }
        return allAccounts;
    }

    public async Task<bool> AddAccountAsync(Platform platform, Account account)
    {
        var swapper = GetSwapper(platform);
        if (swapper == null) return false;
        return await swapper.AddAccountAsync(account);
    }

    public async Task<bool> RemoveAccountAsync(string accountId)
    {
        foreach (var swapper in _swappers)
        {
            var success = await swapper.RemoveAccountAsync(accountId);
            if (success) return true;
        }
        return false;
    }

    public async Task<Account?> CaptureActiveSessionAsync(Platform platform, string? customDisplayName = null)
    {
        var swapper = GetSwapper(platform);
        if (swapper == null) return null;
        return await swapper.CaptureActiveSessionAsync(customDisplayName);
    }

    public async Task<bool> LogoutPlatformAsync(Platform platform)
    {
        var swapper = GetSwapper(platform);
        if (swapper == null) return false;
        return await swapper.LogoutAsync();
    }
}

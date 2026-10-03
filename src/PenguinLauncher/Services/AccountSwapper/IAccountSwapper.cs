using PenguinLauncher.Models;

namespace PenguinLauncher.Services.AccountSwapper;

public interface IAccountSwapper
{
    Platform Platform { get; }
    Task<bool> SwapToAccountAsync(Account account);
    Task<Account?> GetActiveAccountAsync();
    Task<List<Account>> GetAvailableAccountsAsync();
    Task BackupCurrentSessionAsync(string accountId);
    Task<bool> AddAccountAsync(Account account);
    Task<bool> RemoveAccountAsync(string accountId);
    Task<Account?> CaptureActiveSessionAsync(string? customDisplayName = null);
    Task<bool> LogoutAsync();
}

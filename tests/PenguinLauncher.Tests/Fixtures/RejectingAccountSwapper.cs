using PenguinLauncher.Models;
using PenguinLauncher.Services.AccountSwapper;

namespace PenguinLauncher.Tests.Fixtures;

// Every session operation stops here; no platform implementation is constructed.
public sealed class RejectingAccountSwapper : IAccountSwapper
{
    private int _operationCalls;

    public Platform Platform => Platform.Steam;
    public int OperationCalls => Volatile.Read(ref _operationCalls);

    public Task<bool> SwapToAccountAsync(Account account) => Reject<bool>();
    public Task<Account?> GetActiveAccountAsync() => Reject<Account?>();
    public Task<List<Account>> GetAvailableAccountsAsync() => Reject<List<Account>>();
    public Task BackupCurrentSessionAsync(string accountId) => Reject<bool>();
    public Task<bool> AddAccountAsync(Account account) => Reject<bool>();
    public Task<bool> RemoveAccountAsync(string accountId) => Reject<bool>();
    public Task<Account?> CaptureActiveSessionAsync(string? customDisplayName = null) => Reject<Account?>();
    public Task<bool> LogoutAsync() => Reject<bool>();

    private Task<T> Reject<T>()
    {
        Interlocked.Increment(ref _operationCalls);
        throw new InvalidOperationException("Session operations are forbidden in request guard tests.");
    }
}

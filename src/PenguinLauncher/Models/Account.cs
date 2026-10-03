namespace PenguinLauncher.Models;

public record Account(
    string Id,
    string DisplayName,
    Platform Platform,
    string PlatformUserId,
    bool IsActive
)
{
    /// <summary>
    /// Path to the backed-up session/token files for this account.
    /// </summary>
    public string? SessionBackupPath { get; init; }

    /// <summary>
    /// Timestamp of the last successful login with this account.
    /// </summary>
    public DateTime? LastLogin { get; init; }
}

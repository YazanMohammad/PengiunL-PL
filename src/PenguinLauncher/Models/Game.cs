namespace PenguinLauncher.Models;

public record Game(
    string Id,
    string Name,
    Platform Platform,
    string InstallPath,
    string? LaunchUri,
    string? CoverImageUrl,
    string? BackgroundImageUrl,
    List<string> AssociatedAccountIds,
    bool IsInstalled = true
)
{
    /// <summary>
    /// Platform-specific game identifier (e.g., Steam AppId, Riot product name).
    /// </summary>
    public string PlatformGameId { get; init; } = string.Empty;
}

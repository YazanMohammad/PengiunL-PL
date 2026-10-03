using PenguinLauncher.Models;

namespace PenguinLauncher.Services.GameScanner;

/// <summary>
/// Interface for platform-specific game scanning.
/// Adapted from Playnite's library plugin architecture.
/// </summary>
public interface IGameScanner
{
    Platform Platform { get; }
    Task<List<Game>> ScanAsync();
    bool IsInstalled();
}

namespace PenguinLauncher.Models;

/// <summary>
/// Persisted application state including all known games, accounts, and mappings.
/// </summary>
public class AppState
{
    public List<Game> Games { get; set; } = new();
    public List<Account> Accounts { get; set; } = new();
    public Dictionary<string, string> GameAccountMappings { get; set; } = new(); // GameId -> AccountId
    public DateTime LastScan { get; set; } = DateTime.MinValue;
}

namespace PenguinLauncher.Models;

public record LaunchRequest(
    string GameId,
    string? AccountId
);

public record LaunchResult(
    bool Success,
    string Message,
    bool AccountSwapped
);

public record ConflictInfo(
    string GameId,
    string GameName,
    List<Account> AvailableAccounts
);

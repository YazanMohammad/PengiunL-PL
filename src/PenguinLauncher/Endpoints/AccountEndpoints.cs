using PenguinLauncher.Models;
using PenguinLauncher.Services.AccountSwapper;
using PenguinLauncher.Services.Storage;

namespace PenguinLauncher.Endpoints;

public static class AccountEndpoints
{
    public static void MapAccountEndpoints(this WebApplication app)
    {
        var group = app.MapGroup("/api/accounts");

        group.MapGet("/", async (AccountSwapperService swapper) =>
        {
            try
            {
                var accounts = await swapper.GetAllAccountsAsync();
                return Results.Ok(accounts);
            }
            catch (Exception ex)
            {
                return Results.Problem(detail: ex.Message, statusCode: StatusCodes.Status500InternalServerError);
            }
        });

        group.MapGet("/{platform}", async (string platform, AccountSwapperService swapper) =>
        {
            try
            {
                if (!Enum.TryParse<Platform>(platform, ignoreCase: true, out var p))
                    return Results.BadRequest(new { error = $"Unknown platform: {platform}" });

                var s = swapper.GetSwapper(p);
                if (s == null) return Results.NotFound(new { error = $"No swapper available for platform: {platform}" });

                var accounts = await s.GetAvailableAccountsAsync();
                return Results.Ok(accounts);
            }
            catch (Exception ex)
            {
                return Results.Problem(detail: ex.Message, statusCode: StatusCodes.Status500InternalServerError);
            }
        });

        group.MapPost("/map", async (GameAccountMapping? mapping, JsonStorageService storage) =>
        {
            try
            {
                if (mapping == null || string.IsNullOrWhiteSpace(mapping.GameId) || string.IsNullOrWhiteSpace(mapping.AccountId))
                    return Results.BadRequest(new { error = "GameId and AccountId are required." });

                var state = await storage.LoadAsync();
                state.GameAccountMappings[mapping.GameId] = mapping.AccountId;
                await storage.SaveAsync(state);
                return Results.Ok(new { success = true, gameId = mapping.GameId, accountId = mapping.AccountId });
            }
            catch (Exception ex)
            {
                return Results.Problem(detail: ex.Message, statusCode: StatusCodes.Status500InternalServerError);
            }
        });

        group.MapPost("/swap", async (SwapAccountRequest? request, AccountSwapperService swapper, JsonStorageService storage) =>
        {
            try
            {
                if (request == null || string.IsNullOrWhiteSpace(request.AccountId))
                    return Results.BadRequest(new { error = "AccountId is required." });

                var state = await storage.LoadAsync();
                var account = state.Accounts.FirstOrDefault(a => a.Id == request.AccountId);
                if (account == null)
                {
                    var all = await swapper.GetAllAccountsAsync();
                    account = all.FirstOrDefault(a => a.Id == request.AccountId);
                }
                if (account == null) return Results.NotFound(new { error = $"Account '{request.AccountId}' not found." });

                var success = await swapper.SwapAccountAsync(account.Platform, account);
                return success
                    ? Results.Ok(new { success = true, account })
                    : Results.UnprocessableEntity(new { error = $"Failed to hot-swap to {account.DisplayName} ({account.Platform}). Please ensure launcher is closed." });
            }
            catch (Exception ex)
            {
                return Results.Problem(detail: ex.Message, statusCode: StatusCodes.Status500InternalServerError);
            }
        });

        group.MapPost("/add", async (AddAccountRequest? request, AccountSwapperService swapper) =>
        {
            try
            {
                if (request == null)
                    return Results.BadRequest(new { error = "Request body is required." });

                if (!Enum.TryParse<Platform>(request.Platform, ignoreCase: true, out var p))
                    return Results.BadRequest(new { error = $"Invalid platform: {request.Platform}" });

                if (string.IsNullOrWhiteSpace(request.DisplayName))
                    return Results.BadRequest(new { error = "Display name is required." });

                var userId = !string.IsNullOrWhiteSpace(request.PlatformUserId)
                    ? request.PlatformUserId
                    : $"{DateTime.UtcNow.Ticks}";

                var accountId = $"{request.Platform.ToLowerInvariant()}_{userId}";

                var account = new Account(
                    Id: accountId,
                    DisplayName: request.DisplayName.Trim(),
                    Platform: p,
                    PlatformUserId: userId,
                    IsActive: false
                );

                var success = await swapper.AddAccountAsync(p, account);
                return success ? Results.Ok(account) : Results.UnprocessableEntity(new { error = "Failed to add profile." });
            }
            catch (Exception ex)
            {
                return Results.Problem(detail: ex.Message, statusCode: StatusCodes.Status500InternalServerError);
            }
        });

        group.MapDelete("/{id}", async (string id, AccountSwapperService swapper) =>
        {
            try
            {
                if (string.IsNullOrWhiteSpace(id))
                    return Results.BadRequest(new { error = "Account id is required." });

                var success = await swapper.RemoveAccountAsync(id);
                return success
                    ? Results.Ok(new { success = true, message = "Account removed" })
                    : Results.NotFound(new { error = "Account not found" });
            }
            catch (Exception ex)
            {
                return Results.Problem(detail: ex.Message, statusCode: StatusCodes.Status500InternalServerError);
            }
        });

        group.MapPost("/capture", async (CaptureSessionRequest? request, AccountSwapperService swapper) =>
        {
            try
            {
                if (request == null || string.IsNullOrWhiteSpace(request.Platform))
                    return Results.BadRequest(new { error = "Platform is required." });

                if (!Enum.TryParse<Platform>(request.Platform, ignoreCase: true, out var p))
                    return Results.BadRequest(new { error = $"Invalid platform: {request.Platform}" });

                var captured = await swapper.CaptureActiveSessionAsync(p, request.DisplayName);
                return captured != null
                    ? Results.Ok(captured)
                    : Results.UnprocessableEntity(new { error = $"No active session detected for platform: {request.Platform}. Please log in first." });
            }
            catch (Exception ex)
            {
                return Results.Problem(detail: ex.Message, statusCode: StatusCodes.Status500InternalServerError);
            }
        });

        group.MapPost("/logout/{platform}", async (string platform, AccountSwapperService swapper) =>
        {
            try
            {
                if (!Enum.TryParse<Platform>(platform, ignoreCase: true, out var p))
                    return Results.BadRequest(new { error = $"Invalid platform: {platform}" });

                var success = await swapper.LogoutPlatformAsync(p);
                return success
                    ? Results.Ok(new { success = true, message = $"Logged out of {platform}" })
                    : Results.UnprocessableEntity(new { error = $"Failed to logout of {platform}" });
            }
            catch (Exception ex)
            {
                return Results.Problem(detail: ex.Message, statusCode: StatusCodes.Status500InternalServerError);
            }
        });

        group.MapPost("/rename", async (RenameAccountRequest? request, AccountSwapperService swapper, JsonStorageService storage) =>
        {
            try
            {
                if (request == null || string.IsNullOrWhiteSpace(request.AccountId))
                    return Results.BadRequest(new { error = "AccountId is required." });

                if (string.IsNullOrWhiteSpace(request.NewDisplayName))
                    return Results.BadRequest(new { error = "New display name cannot be empty." });

                var state = await storage.LoadAsync();
                var account = state.Accounts.FirstOrDefault(a => a.Id == request.AccountId);
                if (account == null)
                {
                    var all = await swapper.GetAllAccountsAsync();
                    account = all.FirstOrDefault(a => a.Id == request.AccountId);
                    if (account != null)
                    {
                        var renamedAccount = account with { DisplayName = request.NewDisplayName.Trim() };
                        state.Accounts.Add(renamedAccount);
                        await storage.SaveAsync(state);
                        return Results.Ok(renamedAccount);
                    }
                    return Results.NotFound(new { error = "Account not found." });
                }

                var idx = state.Accounts.IndexOf(account);
                var updated = account with { DisplayName = request.NewDisplayName.Trim() };
                state.Accounts[idx] = updated;
                await storage.SaveAsync(state);

                return Results.Ok(updated);
            }
            catch (Exception ex)
            {
                return Results.Problem(detail: ex.Message, statusCode: StatusCodes.Status500InternalServerError);
            }
        });
    }
}

public record GameAccountMapping(string GameId, string AccountId);
public record SwapAccountRequest(string AccountId);
public record AddAccountRequest(string DisplayName, string Platform, string? PlatformUserId);
public record CaptureSessionRequest(string Platform, string? DisplayName);
public record RenameAccountRequest(string AccountId, string NewDisplayName);

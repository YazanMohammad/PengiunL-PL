using PenguinLauncher.Models;
using PenguinLauncher.Services.LaunchManager;

namespace PenguinLauncher.Endpoints;

public static class LaunchEndpoints
{
    public static void MapLaunchEndpoints(this WebApplication app)
    {
        var group = app.MapGroup("/api/launch");

        /// <summary>
        /// Pre-flight check: returns conflict info if the game has multiple accounts.
        /// Frontend should call this before launching to decide if the modal is needed.
        /// </summary>
        group.MapGet("/preflight/{gameId}", async (string gameId, LaunchManagerService launcher) =>
        {
            try
            {
                if (string.IsNullOrWhiteSpace(gameId))
                    return Results.BadRequest(new { error = "GameId is required." });

                var conflict = await launcher.CheckForConflictAsync(gameId);
                if (conflict != null)
                    return Results.Ok(new { hasConflict = true, conflict });
                return Results.Ok(new { hasConflict = false });
            }
            catch (Exception ex)
            {
                return Results.Problem(detail: ex.Message, statusCode: StatusCodes.Status500InternalServerError);
            }
        });

        /// <summary>
        /// Executes the full launch workflow:
        /// account swap (if needed) + game launch.
        /// </summary>
        group.MapPost("/", async (LaunchRequest? request, LaunchManagerService launcher) =>
        {
            try
            {
                if (request == null || string.IsNullOrWhiteSpace(request.GameId))
                    return Results.BadRequest(new { error = "GameId is required." });

                var result = await launcher.LaunchGameAsync(request);
                return result.Success
                    ? Results.Ok(result)
                    : Results.UnprocessableEntity(result);
            }
            catch (Exception ex)
            {
                return Results.Problem(detail: ex.Message, statusCode: StatusCodes.Status500InternalServerError);
            }
        });
    }
}

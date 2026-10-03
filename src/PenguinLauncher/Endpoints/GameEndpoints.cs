using PenguinLauncher.Services.GameScanner;

namespace PenguinLauncher.Endpoints;

public static class GameEndpoints
{
    public static void MapGameEndpoints(this WebApplication app)
    {
        var group = app.MapGroup("/api/games");

        group.MapGet("/", async (GameScannerService scanner, bool? rescan) =>
        {
            try
            {
                var games = await scanner.GetGamesAsync(forceRescan: rescan ?? false);
                return Results.Ok(games);
            }
            catch (Exception ex)
            {
                return Results.Problem(detail: ex.Message, statusCode: StatusCodes.Status500InternalServerError);
            }
        });

        group.MapPost("/scan", async (GameScannerService scanner) =>
        {
            try
            {
                var games = await scanner.ScanAllAsync();
                return Results.Ok(games);
            }
            catch (Exception ex)
            {
                return Results.Problem(detail: ex.Message, statusCode: StatusCodes.Status500InternalServerError);
            }
        });
    }
}

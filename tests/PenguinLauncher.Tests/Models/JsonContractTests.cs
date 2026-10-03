using System.Text.Json;
using System.Text.Json.Serialization;
using PenguinLauncher.Models;
using Xunit;

namespace PenguinLauncher.Tests.Models;

// DTO contracts with explicit web serialization options; these do not verify Program.Main wiring.
public class JsonContractTests
{
    private static JsonSerializerOptions CreateOptions()
    {
        var options = new JsonSerializerOptions(JsonSerializerDefaults.Web);
        options.Converters.Add(new JsonStringEnumConverter());
        return options;
    }

    [Fact]
    public void Game_DtoContract_UsesCamelCaseAndStringPlatform()
    {
        var game = new Game("game-a", "Synthetic game", Platform.Steam, "synthetic-install",
            null, null, null, ["account-a"], IsInstalled: true)
        {
            PlatformGameId = "42"
        };
        using var json = JsonDocument.Parse(JsonSerializer.Serialize(game, CreateOptions()));
        var root = json.RootElement;

        Assert.Equal("Steam", root.GetProperty("platform").GetString());
        Assert.Equal("account-a", Assert.Single(root.GetProperty("associatedAccountIds").EnumerateArray()).GetString());
        Assert.Equal("42", root.GetProperty("platformGameId").GetString());
        Assert.True(root.GetProperty("isInstalled").GetBoolean());
    }

    [Fact]
    public void LaunchRequest_DtoContract_SerializesIdentifiers()
    {
        var request = new LaunchRequest("game-a", "account-a");
        using var json = JsonDocument.Parse(JsonSerializer.Serialize(request, CreateOptions()));

        Assert.Equal("game-a", json.RootElement.GetProperty("gameId").GetString());
        Assert.Equal("account-a", json.RootElement.GetProperty("accountId").GetString());
    }

    [Fact]
    public void LaunchRequest_DtoContract_DeserializesCamelCaseIdentifiers()
    {
        var request = JsonSerializer.Deserialize<LaunchRequest>(
            """{"gameId":"game-a","accountId":"account-a"}""", CreateOptions());

        Assert.NotNull(request);
        Assert.Equal("game-a", request.GameId);
        Assert.Equal("account-a", request.AccountId);
    }

    [Fact]
    public void LaunchResult_DtoContract_SerializesOutcome()
    {
        var result = new LaunchResult(true, "synthetic launch", false);
        using var json = JsonDocument.Parse(JsonSerializer.Serialize(result, CreateOptions()));

        Assert.True(json.RootElement.GetProperty("success").GetBoolean());
        Assert.Equal("synthetic launch", json.RootElement.GetProperty("message").GetString());
        Assert.False(json.RootElement.GetProperty("accountSwapped").GetBoolean());
    }
}

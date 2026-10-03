using System.Net;
using System.Text;
using System.Text.Json;
using PenguinLauncher.Tests.Fixtures;
using Xunit;

namespace PenguinLauncher.Tests.Endpoints;

public class RequestGuardTests
{
    // Removing an endpoint guard must produce a non-400 response through the safe
    // dependencies; changing its error contract must fail the independent literal.
    [Theory]
    [InlineData("/api/accounts/map", "{}", "GameId and AccountId are required.")]
    [InlineData("/api/accounts/map", """{"accountId":"account-a"}""", "GameId and AccountId are required.")]
    [InlineData("/api/accounts/map", """{"gameId":"","accountId":"account-a"}""", "GameId and AccountId are required.")]
    [InlineData("/api/accounts/map", """{"gameId":" \t ","accountId":"account-a"}""", "GameId and AccountId are required.")]
    [InlineData("/api/accounts/map", """{"gameId":null,"accountId":"account-a"}""", "GameId and AccountId are required.")]
    [InlineData("/api/accounts/map", """{"gameId":"game-a"}""", "GameId and AccountId are required.")]
    [InlineData("/api/accounts/map", """{"gameId":"game-a","accountId":""}""", "GameId and AccountId are required.")]
    [InlineData("/api/accounts/map", """{"gameId":"game-a","accountId":" \t "}""", "GameId and AccountId are required.")]
    [InlineData("/api/accounts/map", """{"gameId":"game-a","accountId":null}""", "GameId and AccountId are required.")]
    [InlineData("/api/accounts/map", "null", "GameId and AccountId are required.")]
    [InlineData("/api/accounts/swap", "{}", "AccountId is required.")]
    [InlineData("/api/accounts/swap", """{"accountId":""}""", "AccountId is required.")]
    [InlineData("/api/accounts/swap", """{"accountId":" \t "}""", "AccountId is required.")]
    [InlineData("/api/accounts/swap", """{"accountId":null}""", "AccountId is required.")]
    [InlineData("/api/accounts/swap", "null", "AccountId is required.")]
    [InlineData("/api/launch/", "{}", "GameId is required.")]
    [InlineData("/api/launch/", """{"gameId":""}""", "GameId is required.")]
    [InlineData("/api/launch/", """{"gameId":" \t "}""", "GameId is required.")]
    [InlineData("/api/launch/", """{"gameId":null}""", "GameId is required.")]
    [InlineData("/api/launch/", "null", "GameId is required.")]
    public async Task InvalidIdentifiers_Return400WithoutSessionOperations(
        string path, string body, string expectedError)
    {
        await AssertRejectedByHandlerAsync(path, body, expectedError);
    }

    [Theory]
    [InlineData("/api/accounts/add", "null", "Request body is required.")]
    [InlineData("/api/accounts/add", """{"displayName":"Synthetic"}""", "Invalid platform: ")]
    [InlineData("/api/accounts/add", """{"platform":"","displayName":"Synthetic"}""", "Invalid platform: ")]
    [InlineData("/api/accounts/add", """{"platform":"unknown-platform","displayName":"Synthetic"}""", "Invalid platform: unknown-platform")]
    [InlineData("/api/accounts/add", """{"platform":"Steam"}""", "Display name is required.")]
    [InlineData("/api/accounts/add", """{"platform":"Steam","displayName":""}""", "Display name is required.")]
    [InlineData("/api/accounts/add", """{"platform":"Steam","displayName":" \t "}""", "Display name is required.")]
    [InlineData("/api/accounts/add", """{"platform":"Steam","displayName":null}""", "Display name is required.")]
    [InlineData("/api/accounts/capture", "null", "Platform is required.")]
    [InlineData("/api/accounts/capture", "{}", "Platform is required.")]
    [InlineData("/api/accounts/capture", """{"platform":""}""", "Platform is required.")]
    [InlineData("/api/accounts/capture", """{"platform":" \t "}""", "Platform is required.")]
    [InlineData("/api/accounts/capture", """{"platform":null}""", "Platform is required.")]
    [InlineData("/api/accounts/capture", """{"platform":"unknown-platform"}""", "Invalid platform: unknown-platform")]
    [InlineData("/api/accounts/rename", "null", "AccountId is required.")]
    [InlineData("/api/accounts/rename", """{"newDisplayName":"Synthetic"}""", "AccountId is required.")]
    [InlineData("/api/accounts/rename", """{"accountId":"","newDisplayName":"Synthetic"}""", "AccountId is required.")]
    [InlineData("/api/accounts/rename", """{"accountId":" \t ","newDisplayName":"Synthetic"}""", "AccountId is required.")]
    [InlineData("/api/accounts/rename", """{"accountId":null,"newDisplayName":"Synthetic"}""", "AccountId is required.")]
    [InlineData("/api/accounts/rename", """{"accountId":"account-a"}""", "New display name cannot be empty.")]
    [InlineData("/api/accounts/rename", """{"accountId":"account-a","newDisplayName":""}""", "New display name cannot be empty.")]
    [InlineData("/api/accounts/rename", """{"accountId":"account-a","newDisplayName":" \t "}""", "New display name cannot be empty.")]
    [InlineData("/api/accounts/rename", """{"accountId":"account-a","newDisplayName":null}""", "New display name cannot be empty.")]
    public async Task InvalidProfileRequests_Return400WithoutSessionOperations(
        string path, string body, string expectedError)
    {
        await AssertRejectedByHandlerAsync(path, body, expectedError);
    }

    [Fact]
    public async Task GuardStorage_LoadAndSaveFailAtLockBeforeIo()
    {
        await using var fixture = await GuardApiFixture.CreateAsync();

        var loadError = await Assert.ThrowsAsync<NullReferenceException>(
            () => fixture.GuardStorage.LoadAsync());
        var saveError = await Assert.ThrowsAsync<NullReferenceException>(
            () => fixture.GuardStorage.SaveAsync());

        Assert.Contains("JsonStorageService.LoadAsync", loadError.StackTrace);
        Assert.Contains("JsonStorageService.SaveAsync", saveError.StackTrace);
        Assert.Equal(0, fixture.Swapper.OperationCalls);
    }

    // Broadening the fixture boundary must not expose another mapped handler.
    [Theory]
    [InlineData("GET", "/api/accounts/")]
    [InlineData("GET", "/api/accounts/Steam")]
    [InlineData("GET", "/api/accounts/map")]
    [InlineData("DELETE", "/api/accounts/account-a")]
    [InlineData("POST", "/api/accounts/logout/Steam")]
    [InlineData("GET", "/api/launch/preflight/game-a")]
    [InlineData("GET", "/api/launch/")]
    [InlineData("POST", "/api/launch")]
    [InlineData("POST", "/api/accounts/MAP")]
    [InlineData("POST", "/api/accounts/map/")]
    [InlineData("POST", "/not-allowlisted")]
    public async Task NonAllowlistedRequests_Return404WithoutSessionOperations(string method, string path)
    {
        await using var fixture = await GuardApiFixture.CreateAsync();
        using var request = new HttpRequestMessage(new HttpMethod(method), path)
        {
            // Invalid JSON confirms the boundary decides only on path and method.
            Content = new StringContent("not-json", Encoding.UTF8, "application/json")
        };

        using var response = await fixture.Client.SendAsync(request);

        Assert.Equal(HttpStatusCode.NotFound, response.StatusCode);
        Assert.Equal(0, fixture.Swapper.OperationCalls);
    }

    private static async Task AssertRejectedByHandlerAsync(string path, string body, string expectedError)
    {
        await using var fixture = await GuardApiFixture.CreateAsync();
        using var content = new StringContent(body, Encoding.UTF8, "application/json");
        using var response = await fixture.Client.PostAsync(path, content);

        Assert.Equal(HttpStatusCode.BadRequest, response.StatusCode);
        using var json = JsonDocument.Parse(await response.Content.ReadAsStringAsync());
        Assert.Equal(expectedError, json.RootElement.GetProperty("error").GetString());
        Assert.Equal(0, fixture.Swapper.OperationCalls);
    }
}

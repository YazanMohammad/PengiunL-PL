using System.Net;
using System.Text;
using System.Text.Json;
using PenguinLauncher.Hosting;
using PenguinLauncher.Tests.Fixtures;
using Xunit;

namespace PenguinLauncher.Tests.Endpoints;

public class AuthenticatedRequestGuardTests
{
    private const string Token = "AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA";

    // Removing shared composition must expose the existing 400 guard without auth;
    // changing a guard must change its authenticated validation response.
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
    public async Task InvalidBodies_RequireAuthenticationBeforeExistingGuard(
        string path, string body, string expectedError)
    {
        await using var fixture = await GuardApiFixture.CreateAsync(
            ApiSessionPolicy.Create(true, false, Token, null));
        foreach (var authenticated in new[] { false, true })
        {
            using var request = new HttpRequestMessage(HttpMethod.Post, path)
            {
                Content = new StringContent(body, Encoding.UTF8, "application/json")
            };
            if (authenticated)
                request.Headers.TryAddWithoutValidation("Authorization", "Bearer " + Token);
            using var response = await fixture.Client.SendAsync(request);
            Assert.Equal(authenticated ? HttpStatusCode.BadRequest : HttpStatusCode.Unauthorized,
                response.StatusCode);
            Assert.Equal("no-store", response.Headers.CacheControl?.ToString());
            using var json = JsonDocument.Parse(await response.Content.ReadAsStringAsync());
            Assert.Equal(authenticated ? expectedError : "Authentication required.",
                json.RootElement.GetProperty("error").GetString());
            if (!authenticated)
                Assert.Equal("Bearer", response.Headers.WwwAuthenticate.Single().Scheme);
            Assert.Equal(0, fixture.Swapper.OperationCalls);
        }
    }
}

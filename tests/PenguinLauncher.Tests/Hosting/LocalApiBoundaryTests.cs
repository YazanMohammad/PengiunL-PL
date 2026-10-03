using System.Net;
using System.Text;
using System.Text.Json;
using PenguinLauncher.Hosting;
using PenguinLauncher.Tests.Fixtures;
using Xunit;

namespace PenguinLauncher.Tests.Hosting;

public class LocalApiBoundaryTests
{
    private const string Token = "AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA";
    private const string DevOrigin = "http://localhost:5173";

    private static ApiSessionPolicy Policy(bool development = false) =>
        ApiSessionPolicy.Create(true, development, Token, development ? DevOrigin : null);

    // Missing protection must expose a synthetic handler or fallback, never real services.
    [Theory]
    [InlineData("GET", "/api/games/")]
    [InlineData("POST", "/api/games/scan")]
    [InlineData("GET", "/api/accounts/")]
    [InlineData("GET", "/api/accounts/Steam")]
    [InlineData("POST", "/api/accounts/map")]
    [InlineData("POST", "/api/accounts/swap")]
    [InlineData("POST", "/api/accounts/add")]
    [InlineData("DELETE", "/api/accounts/account-a")]
    [InlineData("POST", "/api/accounts/capture")]
    [InlineData("POST", "/api/accounts/logout/Steam")]
    [InlineData("POST", "/api/accounts/rename")]
    [InlineData("GET", "/api/launch/preflight/game-a")]
    [InlineData("POST", "/api/launch/")]
    [InlineData("GET", "/api/system/info")]
    [InlineData("GET", "/api/health")]
    [InlineData("GET", "/api")]
    [InlineData("GET", "/api/")]
    [InlineData("GET", "/api/unknown")]
    [InlineData("HEAD", "/api/health")]
    [InlineData("PUT", "/api/health")]
    [InlineData("PATCH", "/api/health")]
    [InlineData("OPTIONS", "/api/health")]
    [InlineData("GET", "/API/health")]
    [InlineData("GET", "/ApI/HeAlTh/")]
    [InlineData("GET", "/api//health")]
    public async Task AnonymousApiRequests_NeverReachHandlers(string method, string path)
    {
        await using var fixture = await ApiBoundaryFixture.CreateAsync(
            ApiSessionPolicy.Create(false, false, null, null));
        using var request = new HttpRequestMessage(new HttpMethod(method), path)
        {
            Content = new StringContent("not-json", Encoding.UTF8, "application/json")
        };
        using var response = await fixture.Client.SendAsync(request);
        await AssertErrorAsync(response, HttpStatusCode.Unauthorized, "Authentication required.");
        Assert.Equal("Bearer", response.Headers.WwwAuthenticate.Single().Scheme);
        Assert.Equal(0, fixture.HandlerCalls);
    }

    // Removing strict header parsing or policy comparison would admit these callers.
    [Theory]
    [InlineData("")]
    [InlineData("Basic AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA")]
    [InlineData("Bearer AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAE")]
    [InlineData("Bearer AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA=")]
    [InlineData("Bearer AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAB")]
    [InlineData("Bearer  AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA")]
    [InlineData("Bearer\tAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA")]
    [InlineData("Bearer AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA ")]
    [InlineData("Bearer AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA, Bearer AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA")]
    public async Task InvalidCredentials_Return401WithoutHandler(string authorization)
    {
        await using var fixture = await ApiBoundaryFixture.CreateAsync(Policy());
        using var response = await fixture.SendRawAsync(context =>
            context.Request.Headers.Authorization = authorization);
        await AssertErrorAsync(response, HttpStatusCode.Unauthorized, "Authentication required.");
        Assert.Equal("Bearer", response.Headers.WwwAuthenticate.Single().Scheme);
        Assert.Equal(0, fixture.HandlerCalls);
    }

    [Fact]
    public async Task DuplicateCredentials_Return401WithoutHandler()
    {
        await using var fixture = await ApiBoundaryFixture.CreateAsync(Policy());
        using var request = Request("GET", "/api/health", false);
        request.Headers.TryAddWithoutValidation("Authorization", new[] { "Bearer " + Token, "Bearer " + Token });
        using var response = await fixture.Client.SendAsync(request);
        await AssertErrorAsync(response, HttpStatusCode.Unauthorized, "Authentication required.");
        Assert.Equal(0, fixture.HandlerCalls);
    }

    [Fact]
    public async Task RetiredProcessCredential_Returns401WithoutHandler()
    {
        var retired = ApiSessionPolicy.Create(false, false, null, null);
        await using var fixture = await ApiBoundaryFixture.CreateAsync(ApiSessionPolicy.Create(false, false, null, null));
        using var request = Request("GET", "/api/health", false);
        request.Headers.TryAddWithoutValidation("Authorization", "Bearer " + retired.CreateBootstrapUri().Fragment[17..]);
        using var response = await fixture.Client.SendAsync(request);
        await AssertErrorAsync(response, HttpStatusCode.Unauthorized, "Authentication required.");
        Assert.Equal(0, fixture.HandlerCalls);
    }

    // Removing authority validation must expose either API handlers or static content.
    [Theory]
    [InlineData("localhost")]
    [InlineData("localhost:80")]
    [InlineData("localhost.:5100")]
    [InlineData("localhost.evil:5100")]
    [InlineData("evil.localhost:5100")]
    [InlineData("127.0.0.2:5100")]
    [InlineData("[::2]:5100")]
    [InlineData("localhost:05100")]
    [InlineData("localhost:5100,127.0.0.1:5100")]
    [InlineData("")]
    public async Task ForeignAuthority_RejectsBeforeHandlersAndStatic(string authority)
    {
        await using var fixture = await ApiBoundaryFixture.CreateAsync(Policy());
        foreach (var path in new[] { "/api/health", "/assets/test.js" })
        {
            using var response = await fixture.SendRawAsync(context =>
            {
                context.Request.Path = path;
                context.Request.Headers.Authorization = "Bearer " + Token;
                context.Request.Headers.Host = authority;
                context.Request.Headers["X-Forwarded-Host"] = "localhost:5100";
                context.Request.Headers["X-Forwarded-Proto"] = "http";
            });
            Assert.Equal(HttpStatusCode.Forbidden, response.StatusCode);
            if (path.StartsWith("/api", StringComparison.Ordinal))
                await AssertErrorAsync(response, HttpStatusCode.Forbidden, "Request not allowed.");
        }
        Assert.Equal(0, fixture.HandlerCalls);
    }

    [Fact]
    public async Task MultipleHostFields_Return403WithoutHandler()
    {
        await using var fixture = await ApiBoundaryFixture.CreateAsync(Policy());
        using var request = Request("GET", "/api/health");
        request.Headers.TryAddWithoutValidation("Host", new[] { "localhost:5100", "127.0.0.1:5100" });
        using var response = await fixture.Client.SendAsync(request);
        await AssertErrorAsync(response, HttpStatusCode.Forbidden, "Request not allowed.");
        Assert.Equal(0, fixture.HandlerCalls);
    }

    [Theory]
    [InlineData("localhost:5100", "http://localhost:5100")]
    [InlineData("LOCALHOST:5100", "http://LOCALHOST:5100")]
    [InlineData("127.0.0.1:5100", "http://127.0.0.1:5100")]
    [InlineData("[::1]:5100", "http://[::1]:5100")]
    public async Task AllowedAuthorityAndMatchingOrigin_ReachHandler(string authority, string origin)
    {
        await using var fixture = await ApiBoundaryFixture.CreateAsync(Policy());
        using var request = Request("GET", "/api/health");
        request.Headers.Host = authority;
        request.Headers.TryAddWithoutValidation("Origin", origin);
        request.Headers.TryAddWithoutValidation("X-Forwarded-Host", "evil.example:5100");
        request.Headers.TryAddWithoutValidation("X-Forwarded-Proto", "https");
        using var response = await fixture.Client.SendAsync(request);
        Assert.Equal(HttpStatusCode.OK, response.StatusCode);
        Assert.Equal("no-store", response.Headers.CacheControl?.ToString());
        Assert.False(response.Headers.Contains("Access-Control-Allow-Origin"));
        Assert.Equal(1, fixture.HandlerCalls);
    }

    // A valid token must never compensate for a foreign/null/ambiguous Origin.
    [Theory]
    [InlineData("null")]
    [InlineData("")]
    [InlineData("https://localhost:5100")]
    [InlineData("http://localhost:5173")]
    [InlineData("http://127.0.0.1:5100")]
    [InlineData("http://localhost:5100/")]
    [InlineData("http://localhost.evil:5100")]
    [InlineData("http://evil.localhost:5100")]
    [InlineData("http://localhost:5100 http://evil.example")]
    [InlineData("http://localhost:5100,http://localhost:5100")]
    public async Task InvalidOrigin_Returns403DespiteValidToken(string origin)
    {
        await using var fixture = await ApiBoundaryFixture.CreateAsync(Policy());
        using var response = await fixture.SendRawAsync(context =>
        {
            context.Request.Headers.Authorization = "Bearer " + Token;
            context.Request.Headers.Origin = origin;
        });
        await AssertErrorAsync(response, HttpStatusCode.Forbidden, "Request not allowed.");
        Assert.False(response.Headers.Contains("Access-Control-Allow-Origin"));
        Assert.Equal(0, fixture.HandlerCalls);
    }

    [Fact]
    public async Task DuplicateOrigins_Return403WithoutHandler()
    {
        await using var fixture = await ApiBoundaryFixture.CreateAsync(Policy(true));
        using var request = Request("GET", "/api/health");
        request.Headers.TryAddWithoutValidation("Origin", new[] { DevOrigin, DevOrigin });
        using var response = await fixture.Client.SendAsync(request);
        await AssertErrorAsync(response, HttpStatusCode.Forbidden, "Request not allowed.");
        Assert.False(response.Headers.Contains("Access-Control-Allow-Origin"));
        Assert.Equal(0, fixture.HandlerCalls);
    }

    [Theory]
    [InlineData(false, null, "cross-site", 403)]
    [InlineData(false, "http://localhost:5100", "cross-site", 403)]
    [InlineData(true, null, "cross-site", 403)]
    [InlineData(true, "http://localhost:5100", "cross-site", 403)]
    [InlineData(true, "http://localhost:5173", "cross-site", 200)]
    [InlineData(false, null, "same-origin", 200)]
    [InlineData(false, null, "none", 200)]
    public async Task FetchMetadata_RequiresExplicitDevelopmentOriginForCrossSite(
        bool development, string? origin, string metadata, int expectedStatus)
    {
        await using var fixture = await ApiBoundaryFixture.CreateAsync(Policy(development));
        using var request = Request("GET", "/api/health");
        if (origin is not null)
            request.Headers.TryAddWithoutValidation("Origin", origin);
        request.Headers.TryAddWithoutValidation("Sec-Fetch-Site", metadata);
        using var response = await fixture.Client.SendAsync(request);
        Assert.Equal((HttpStatusCode)expectedStatus, response.StatusCode);
        Assert.Equal(expectedStatus == 200 ? 1 : 0, fixture.HandlerCalls);
        if (expectedStatus == 403)
            await AssertErrorAsync(response, HttpStatusCode.Forbidden, "Request not allowed.");
    }

    [Theory]
    [InlineData("/api/health", 200)]
    [InlineData("/API/health/", 200)]
    [InlineData("/api/synthetic-error", 400)]
    [InlineData("/api", 404)]
    [InlineData("/api/", 404)]
    [InlineData("/API/unknown", 404)]
    [InlineData("/api//unknown", 404)]
    public async Task AuthenticatedDiagnosticRequests_HaveNoStoreAndSafeFallback(string path, int status)
    {
        await using var fixture = await ApiBoundaryFixture.CreateAsync(Policy());
        using var request = Request("GET", path);
        // Bearer schemes are case-insensitive; diagnostics need no Origin.
        request.Headers.Remove("Authorization");
        request.Headers.TryAddWithoutValidation("Authorization", "bEaReR " + Token);
        using var response = await fixture.Client.SendAsync(request);
        Assert.Equal((HttpStatusCode)status, response.StatusCode);
        Assert.Equal("no-store", response.Headers.CacheControl?.ToString());
        Assert.Equal(status == 404 ? 0 : 1, fixture.HandlerCalls);
        if (status == 404)
            await AssertErrorAsync(response, HttpStatusCode.NotFound, "API endpoint not found.");
        else if (status == 200)
        {
            using var json = JsonDocument.Parse(await response.Content.ReadAsStringAsync());
            Assert.True(json.RootElement.GetProperty("synthetic").GetBoolean());
        }
    }

    [Theory]
    [InlineData("/apiary")]
    [InlineData("/APIary/settings")]
    [InlineData("/settings/accounts")]
    public async Task NonApiSpaNavigation_RemainsAnonymousHtml(string path)
    {
        await using var fixture = await ApiBoundaryFixture.CreateAsync(Policy());
        using var response = await fixture.Client.GetAsync(path);
        Assert.Equal(HttpStatusCode.OK, response.StatusCode);
        Assert.Equal("text/html", response.Content.Headers.ContentType?.MediaType);
        Assert.Null(response.Headers.CacheControl);
        Assert.Equal(0, fixture.HandlerCalls);
    }

    // A nonfile-only fallback silently drops the JSON error contract for dotted API paths.
    [Fact]
    public async Task AuthenticatedDottedUnknownApi_ReturnsJson404()
    {
        await using var fixture = await ApiBoundaryFixture.CreateAsync(Policy());
        using var request = Request("GET", "/api/unknown.json");
        using var response = await fixture.Client.SendAsync(request);
        await AssertErrorAsync(response, HttpStatusCode.NotFound, "API endpoint not found.");
        Assert.Equal(0, fixture.HandlerCalls);
    }

    // Broadening the SPA fallback would wrongly turn missing ordinary assets into HTML.
    [Fact]
    public async Task MissingNonApiStaticAsset_RemainsFramework404()
    {
        await using var fixture = await ApiBoundaryFixture.CreateAsync(Policy());
        using var response = await fixture.Client.GetAsync("/assets/missing.js");
        Assert.Equal(HttpStatusCode.NotFound, response.StatusCode);
        Assert.NotEqual("text/html", response.Content.Headers.ContentType?.MediaType);
        Assert.Null(response.Headers.CacheControl);
        Assert.Equal(0, fixture.HandlerCalls);
    }

    [Fact]
    public async Task StaticAsset_RemainsAnonymousWithExistingCachePolicy()
    {
        await using var fixture = await ApiBoundaryFixture.CreateAsync(Policy());
        using var response = await fixture.Client.GetAsync("/assets/test.js");
        Assert.Equal(HttpStatusCode.OK, response.StatusCode);
        Assert.Equal("public, max-age=3600", response.Headers.CacheControl?.ToString());
        Assert.Equal(0, fixture.HandlerCalls);
    }

    [Theory]
    [InlineData("GET", "")]
    [InlineData("POST", "Authorization")]
    [InlineData("DELETE", "content-type")]
    [InlineData("HEAD", "authorization, CONTENT-TYPE")]
    [InlineData("GET", null)]
    public async Task ValidDevelopmentPreflight_Returns204WithoutTokenOrHandler(string method, string? headers)
    {
        await using var fixture = await ApiBoundaryFixture.CreateAsync(Policy(true));
        using var request = Preflight(DevOrigin, method, headers);
        using var response = await fixture.Client.SendAsync(request);
        Assert.Equal(HttpStatusCode.NoContent, response.StatusCode);
        Assert.Equal("no-store", response.Headers.CacheControl?.ToString());
        AssertCors(response);
        Assert.Equal(method, response.Headers.GetValues("Access-Control-Allow-Methods").Single());
        if (string.IsNullOrEmpty(headers))
            Assert.False(response.Headers.Contains("Access-Control-Allow-Headers"));
        else
            Assert.Equal(headers.Split(',').Select(value => value.Trim().ToLowerInvariant()).Order(),
                response.Headers.GetValues("Access-Control-Allow-Headers").Single().Split(',')
                    .Select(value => value.Trim().ToLowerInvariant()).Order());
        Assert.Equal("", await response.Content.ReadAsStringAsync());
        Assert.Equal(0, fixture.HandlerCalls);
    }

    [Theory]
    [InlineData(false, "http://localhost:5173", "GET", "Authorization")]
    [InlineData(false, "http://localhost:5100", "GET", "Authorization")]
    [InlineData(true, "http://evil.example:5173", "GET", "Authorization")]
    [InlineData(true, "http://localhost:5100", "GET", "Authorization")]
    [InlineData(true, "http://localhost:5173", "PUT", "Authorization")]
    [InlineData(true, "http://localhost:5173", "PATCH", "Authorization")]
    [InlineData(true, "http://localhost:5173", "OPTIONS", "Authorization")]
    [InlineData(true, "http://localhost:5173", "get", "Authorization")]
    [InlineData(true, "http://localhost:5173", "", "Authorization")]
    [InlineData(true, "http://localhost:5173", "GET, POST", "Authorization")]
    [InlineData(true, "http://localhost:5173", null, "Authorization")]
    [InlineData(true, "http://localhost:5173", "GET", "X-Anything")]
    [InlineData(true, "http://localhost:5173", "GET", "Authorization,")]
    [InlineData(true, "http://localhost:5173", "GET", "Authorization,,Content-Type")]
    [InlineData(true, "http://localhost:5173", "GET", "*")]
    public async Task InvalidPreflight_Returns403WithoutHandler(
        bool development, string origin, string? method, string? headers)
    {
        await using var fixture = await ApiBoundaryFixture.CreateAsync(Policy(development));
        using var request = Preflight(origin, method, headers);
        using var response = await fixture.Client.SendAsync(request);
        await AssertErrorAsync(response, HttpStatusCode.Forbidden, "Request not allowed.");
        Assert.Equal(0, fixture.HandlerCalls);
        Assert.False(response.Headers.Contains("Access-Control-Allow-Methods"));
        Assert.False(response.Headers.Contains("Access-Control-Allow-Headers"));
        if (development && origin == DevOrigin)
            AssertCors(response);
        else
            Assert.False(response.Headers.Contains("Access-Control-Allow-Origin"));
    }

    [Theory]
    [InlineData("Access-Control-Request-Method", "GET")]
    [InlineData("Access-Control-Request-Headers", "Authorization")]
    public async Task DuplicatePreflightDeclarations_Return403(string header, string value)
    {
        await using var fixture = await ApiBoundaryFixture.CreateAsync(Policy(true));
        using var request = Preflight(DevOrigin, "GET", "Authorization");
        request.Headers.Remove(header);
        request.Headers.TryAddWithoutValidation(header, new[] { value, value });
        using var response = await fixture.Client.SendAsync(request);
        await AssertErrorAsync(response, HttpStatusCode.Forbidden, "Request not allowed.");
        AssertCors(response);
        Assert.Equal(0, fixture.HandlerCalls);
    }

    [Theory]
    [InlineData(false)]
    [InlineData(true)]
    public async Task OrdinaryOptions_StillRequiresAuthentication(bool development)
    {
        await using var fixture = await ApiBoundaryFixture.CreateAsync(Policy(development));
        using var request = Request("OPTIONS", "/api/unknown", false);
        if (development)
            request.Headers.TryAddWithoutValidation("Origin", DevOrigin);
        using var response = await fixture.Client.SendAsync(request);
        await AssertErrorAsync(response, HttpStatusCode.Unauthorized, "Authentication required.");
        if (development)
            AssertCors(response);
        Assert.Equal(0, fixture.HandlerCalls);
    }

    [Theory]
    [InlineData(false, null, 401)]
    [InlineData(true, "cross-site", 200)]
    public async Task DevelopmentOrigin_ReceivesReadableAuthenticatedOrUnauthorizedResponse(
        bool authenticated, string? metadata, int status)
    {
        await using var fixture = await ApiBoundaryFixture.CreateAsync(Policy(true));
        using var request = Request("GET", "/api/health", authenticated);
        request.Headers.TryAddWithoutValidation("Origin", DevOrigin);
        if (metadata is not null)
            request.Headers.TryAddWithoutValidation("Sec-Fetch-Site", metadata);
        using var response = await fixture.Client.SendAsync(request);
        Assert.Equal((HttpStatusCode)status, response.StatusCode);
        AssertCors(response);
        Assert.Equal(authenticated ? 1 : 0, fixture.HandlerCalls);
        if (status == 401)
            await AssertErrorAsync(response, HttpStatusCode.Unauthorized, "Authentication required.");
    }

    private static HttpRequestMessage Request(string method, string path, bool authenticated = true)
    {
        var request = new HttpRequestMessage(new HttpMethod(method), path);
        if (authenticated)
            request.Headers.TryAddWithoutValidation("Authorization", "Bearer " + Token);
        return request;
    }

    private static HttpRequestMessage Preflight(string origin, string? method, string? headers)
    {
        var request = Request("OPTIONS", "/api/health", false);
        request.Headers.TryAddWithoutValidation("Origin", origin);
        if (method is not null)
            request.Headers.TryAddWithoutValidation("Access-Control-Request-Method", method);
        if (headers is not null)
            request.Headers.TryAddWithoutValidation("Access-Control-Request-Headers", headers);
        return request;
    }

    private static void AssertCors(HttpResponseMessage response)
    {
        Assert.Equal(DevOrigin, response.Headers.GetValues("Access-Control-Allow-Origin").Single());
        Assert.Contains("Origin", response.Headers.Vary);
        Assert.False(response.Headers.Contains("Access-Control-Allow-Credentials"));
    }

    private static async Task AssertErrorAsync(HttpResponseMessage response,
        HttpStatusCode status, string error)
    {
        Assert.Equal(status, response.StatusCode);
        Assert.Equal("no-store", response.Headers.CacheControl?.ToString());
        Assert.Equal("application/json", response.Content.Headers.ContentType?.MediaType);
        using var json = JsonDocument.Parse(await response.Content.ReadAsStringAsync());
        Assert.Equal(error, json.RootElement.GetProperty("error").GetString());
        Assert.Single(json.RootElement.EnumerateObject());
    }
}

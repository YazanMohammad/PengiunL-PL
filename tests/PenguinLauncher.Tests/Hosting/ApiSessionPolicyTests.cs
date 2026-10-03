using Microsoft.Extensions.Primitives;
using PenguinLauncher.Hosting;
using Xunit;

namespace PenguinLauncher.Tests.Hosting;

public class ApiSessionPolicyTests
{
    private static readonly string SyntheticToken = Convert.ToBase64String(new byte[32])
        .TrimEnd('=').Replace('+', '-').Replace('/', '_');

    [Fact]
    public void ScanOnly_TakesPrecedence() => Assert.Equal(LaunchMode.ScanOnly,
        LaunchModes.Resolve(["--server-only", "--scan-only"]));

    [Fact]
    public void EmptyArguments_SelectDesktop() => Assert.Equal(LaunchMode.Desktop,
        LaunchModes.Resolve([]));

    [Fact]
    public void ServerOnlyFlag_SelectsServerOnly() => Assert.Equal(LaunchMode.ServerOnly,
        LaunchModes.Resolve(["--server-only"]));

    [Fact]
    public void DesktopPolicies_CreateDifferentCanonicalBootstrapCredentials()
    {
        var first = ApiSessionPolicy.Create(false, false, null, null);
        var second = ApiSessionPolicy.Create(false, false, null, null);
        var firstUri = first.CreateBootstrapUri();
        var secondUri = second.CreateBootstrapUri();

        Assert.Equal("http", firstUri.Scheme);
        Assert.Equal("localhost", firstUri.Host);
        Assert.Equal(5100, firstUri.Port);
        Assert.Equal("/", firstUri.PathAndQuery);
        Assert.Empty(firstUri.Query);
        Assert.StartsWith("#penguin-session=", firstUri.Fragment);
        Assert.False(firstUri.Fragment == secondUri.Fragment);
        Assert.Equal(32, DecodeBootstrapToken(firstUri).Length);
        Assert.Equal(32, DecodeBootstrapToken(secondUri).Length);
    }

    [Fact]
    public void DesktopPolicy_AcceptsItsCredentialAndRejectsAnotherProcess()
    {
        var first = ApiSessionPolicy.Create(false, false, null, null);
        var second = ApiSessionPolicy.Create(false, false, null, null);

        Assert.True(first.IsAuthorized("Bearer " + BootstrapToken(first.CreateBootstrapUri())));
        Assert.False(first.IsAuthorized("Bearer " + BootstrapToken(second.CreateBootstrapUri())));
    }

    [Fact]
    public void DesktopPolicy_DoesNotAdoptConfiguredToken()
    {
        var policy = ApiSessionPolicy.Create(false, false, SyntheticToken, null);

        Assert.False(policy.IsAuthorized("Bearer " + SyntheticToken));
        Assert.False(BootstrapToken(policy.CreateBootstrapUri()) == SyntheticToken);
    }

    [Fact]
    public void Policy_ToStringDoesNotDiscloseCredential()
    {
        var policy = ApiSessionPolicy.Create(false, false, null, null);

        Assert.False(policy.ToString()!.Contains(BootstrapToken(policy.CreateBootstrapUri()),
            StringComparison.Ordinal));
    }

    public static TheoryData<string?> InvalidConfiguredTokens => new()
    {
        null, "", " ", SyntheticToken + "=", " " + SyntheticToken, SyntheticToken + " ",
        SyntheticToken[..42], SyntheticToken + "A", new string('A', 42) + "B",
        new string('A', 42) + "+", new string('A', 42) + "/", new string('A', 42) + "\n"
    };

    [Theory]
    [MemberData(nameof(InvalidConfiguredTokens))]
    public void ServerOnly_RejectsInvalidConfigurationWithoutDisclosingIt(string? token)
    {
        var error = Assert.Throws<ArgumentException>(() =>
            ApiSessionPolicy.Create(true, false, token, null));

        Assert.Equal("Invalid API session configuration.", error.Message);
        Assert.Null(error.ParamName);
        Assert.Null(error.InnerException);
    }

    [Theory]
    [InlineData("Bearer")]
    [InlineData("bearer")]
    [InlineData("BEARER")]
    public void ServerOnly_AcceptsExactCanonicalCredentialWithCaseInsensitiveScheme(string scheme)
    {
        var policy = ApiSessionPolicy.Create(true, false, SyntheticToken, null);

        Assert.True(policy.IsAuthorized(scheme + " " + SyntheticToken));
    }

    public static TheoryData<string?> InvalidAuthorization => new()
    {
        null, "", "Bearer", "Basic " + SyntheticToken, "Bearer  " + SyntheticToken,
        "Bearer\t" + SyntheticToken, "Bearer " + SyntheticToken + " ",
        "Bearer " + SyntheticToken + "=", "Bearer " + SyntheticToken[..42],
        "Bearer " + SyntheticToken + "A", "Bearer " + new string('A', 42) + "B",
        "Bearer " + new string('A', 42) + "+", "Bearer " + new string('A', 42) + "/",
        "Bearer " + new string('B', 42) + "A",
        "Bearer " + SyntheticToken + ", Bearer " + SyntheticToken,
        "Bearer " + SyntheticToken + "\r\n"
    };

    [Theory]
    [MemberData(nameof(InvalidAuthorization))]
    public void Authorization_RejectsMalformedOrWrongCredential(string? value)
    {
        var policy = ApiSessionPolicy.Create(true, false, SyntheticToken, null);

        Assert.False(policy.IsAuthorized(new StringValues(value)));
    }

    [Fact]
    public void Authorization_RejectsDuplicateFields()
    {
        var policy = ApiSessionPolicy.Create(true, false, SyntheticToken, null);

        Assert.False(policy.IsAuthorized(new StringValues(
            ["Bearer " + SyntheticToken, "Bearer " + SyntheticToken])));
        Assert.False(policy.IsAuthorized(StringValues.Empty));
    }

    [Theory]
    [InlineData("localhost:5100", true)]
    [InlineData("LOCALHOST:5100", true)]
    [InlineData("127.0.0.1:5100", true)]
    [InlineData("[::1]:5100", true)]
    [InlineData("", false)]
    [InlineData("localhost", false)]
    [InlineData("localhost:05100", false)]
    [InlineData("localhost:5101", false)]
    [InlineData("localhost.:5100", false)]
    [InlineData("localhost.evil:5100", false)]
    [InlineData("evil.localhost:5100", false)]
    [InlineData("127.1:5100", false)]
    [InlineData("[0:0:0:0:0:0:0:1]:5100", false)]
    [InlineData("::1:5100", false)]
    [InlineData("localhost:5100,127.0.0.1:5100", false)]
    [InlineData("localhost:5100/", false)]
    [InlineData("user@localhost:5100", false)]
    [InlineData("http://localhost:5100", false)]
    [InlineData(" localhost:5100", false)]
    [InlineData("localhost:5100 ", false)]
    public void Authority_AllowsOnlyExactLoopbackPort(string authority, bool allowed)
    {
        var policy = ApiSessionPolicy.Create(true, false, SyntheticToken, null);

        Assert.Equal(allowed, policy.IsAllowedAuthority(authority));
    }

    [Theory]
    [InlineData("http://localhost:5100", "localhost:5100", true)]
    [InlineData("http://LOCALHOST:5100", "localhost:5100", true)]
    [InlineData("http://localhost:5100", "LOCALHOST:5100", true)]
    [InlineData("http://127.0.0.1:5100", "127.0.0.1:5100", true)]
    [InlineData("http://[::1]:5100", "[::1]:5100", true)]
    [InlineData("http://127.0.0.1:5100", "localhost:5100", false)]
    [InlineData("null", "localhost:5100", false)]
    [InlineData("", "localhost:5100", false)]
    [InlineData("https://localhost:5100", "localhost:5100", false)]
    [InlineData("http://localhost:5101", "localhost:5100", false)]
    [InlineData("http://localhost", "localhost:5100", false)]
    [InlineData("http://localhost:5100.evil", "localhost:5100", false)]
    [InlineData("http://localhost.evil:5100", "localhost:5100", false)]
    [InlineData("http://localhost.:5100", "localhost:5100", false)]
    [InlineData("http://localhost:5100 http://127.0.0.1:5100", "localhost:5100", false)]
    [InlineData("http://localhost:5100,http://127.0.0.1:5100", "localhost:5100", false)]
    [InlineData("http://localhost:5100/", "localhost:5100", false)]
    [InlineData("http://localhost:5100?x=1", "localhost:5100", false)]
    [InlineData("http://localhost:5100#x", "localhost:5100", false)]
    [InlineData("http://user@localhost:5100", "localhost:5100", false)]
    [InlineData("http://localhost:5100", "evil:5100", false)]
    public void Origin_AllowsOnlyCanonicalMatchingAuthority(string origin, string authority, bool allowed)
    {
        var policy = ApiSessionPolicy.Create(true, false, SyntheticToken, null);

        Assert.Equal(allowed, policy.IsAllowedOrigin(origin, authority));
    }

    [Theory]
    [InlineData("http://localhost:5173")]
    [InlineData("http://127.0.0.1:5173")]
    [InlineData("http://[::1]:5173")]
    [InlineData("http://localhost:80")]
    [InlineData("http://localhost:65535")]
    public void DevelopmentOrigin_GrantsOnlyExplicitConfiguredOrigin(string origin)
    {
        var policy = ApiSessionPolicy.Create(true, true, SyntheticToken, origin);

        Assert.Equal(origin, policy.DevelopmentOrigin);
        Assert.True(policy.IsAllowedOrigin(origin, "localhost:5100"));
        Assert.False(policy.IsAllowedOrigin("http://localhost:5174", "localhost:5100"));
        Assert.False(policy.IsAllowedOrigin(origin, "evil:5100"));
    }

    [Fact]
    public void DevelopmentWithoutOrigin_GrantsNoCrossOriginAccess()
    {
        var policy = ApiSessionPolicy.Create(true, true, SyntheticToken, null);

        Assert.Null(policy.DevelopmentOrigin);
        Assert.False(policy.IsAllowedOrigin("http://localhost:5173", "localhost:5100"));
    }

    [Theory]
    [InlineData(false, false)]
    [InlineData(false, true)]
    [InlineData(true, false)]
    public void DevelopmentOrigin_RequiresServerOnlyDevelopment(bool serverOnly, bool development)
    {
        var error = Assert.Throws<ArgumentException>(() => ApiSessionPolicy.Create(
            serverOnly, development, SyntheticToken, "http://localhost:5173"));

        Assert.Equal("Invalid API session configuration.", error.Message);
    }

    [Theory]
    [InlineData("")]
    [InlineData(" ")]
    [InlineData("null")]
    [InlineData("https://localhost:5173")]
    [InlineData("http://localhost")]
    [InlineData("http://localhost:5100")]
    [InlineData("http://localhost:0")]
    [InlineData("http://localhost:65536")]
    [InlineData("http://localhost:05173")]
    [InlineData("http://localhost:5173/")]
    [InlineData("http://localhost:5173/path")]
    [InlineData("http://localhost:5173?query=1")]
    [InlineData("http://localhost:5173#fragment")]
    [InlineData("http://user@localhost:5173")]
    [InlineData("http://*.localhost:5173")]
    [InlineData("http://localhost.evil:5173")]
    [InlineData("http://localhost.:5173")]
    [InlineData("http://127.1:5173")]
    [InlineData("http://[0:0:0:0:0:0:0:1]:5173")]
    [InlineData(" http://localhost:5173")]
    [InlineData("http://localhost:5173 ")]
    [InlineData("http://localhost:5173,http://127.0.0.1:5173")]
    [InlineData("http://localhost:5173 http://127.0.0.1:5173")]
    public void DevelopmentOrigin_RejectsInvalidConfigurationWithGenericError(string origin)
    {
        var error = Assert.Throws<ArgumentException>(() =>
            ApiSessionPolicy.Create(true, true, SyntheticToken, origin));

        Assert.Equal("Invalid API session configuration.", error.Message);
        Assert.Null(error.ParamName);
        Assert.Null(error.InnerException);
    }

    private static string BootstrapToken(Uri uri) => uri.Fragment["#penguin-session=".Length..];

    private static byte[] DecodeBootstrapToken(Uri uri)
    {
        var token = BootstrapToken(uri);
        Assert.Equal(43, token.Length);
        Assert.Matches("^[A-Za-z0-9_-]{43}$", token);
        return Convert.FromBase64String(token.Replace('-', '+').Replace('_', '/') + "=");
    }
}

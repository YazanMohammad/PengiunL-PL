using System.Globalization;
using System.Security.Cryptography;
using Microsoft.Extensions.Primitives;

namespace PenguinLauncher.Hosting;

public sealed class ApiSessionPolicy
{
    private readonly byte[] _credential;
    private readonly Authority? _developmentAuthority;

    private ApiSessionPolicy(byte[] credential, Authority? developmentAuthority)
    {
        _credential = credential;
        _developmentAuthority = developmentAuthority;
        DevelopmentOrigin = developmentAuthority is { } authority
            ? $"http://{authority.Host}:{authority.Port.ToString(CultureInfo.InvariantCulture)}"
            : null;
    }

    public static ApiSessionPolicy Create(bool serverOnly, bool isDevelopment,
        string? configuredToken, string? developmentOrigin)
    {
        Authority? developmentAuthority = null;
        if (developmentOrigin is not null)
        {
            if (!serverOnly || !isDevelopment || !TryParseOrigin(developmentOrigin, out var origin)
                || origin.Port == 5100)
                throw InvalidConfiguration();

            developmentAuthority = origin;
        }

        byte[] credential;
        if (serverOnly)
        {
            if (!TryDecodeToken(configuredToken, out credential))
                throw InvalidConfiguration();
        }
        else
        {
            credential = RandomNumberGenerator.GetBytes(32);
        }

        return new ApiSessionPolicy(credential, developmentAuthority);
    }

    public string? DevelopmentOrigin { get; }

    public bool IsAuthorized(StringValues authorization)
    {
        if (authorization.Count != 1)
            return false;

        var value = authorization[0];
        if (value is null || value.Length != 50
            || !value.StartsWith("Bearer ", StringComparison.OrdinalIgnoreCase)
            || !TryDecodeToken(value[7..], out var candidate))
            return false;

        return CryptographicOperations.FixedTimeEquals(_credential, candidate);
    }

    public bool IsAllowedAuthority(string authority) =>
        TryParseAuthority(authority, out var parsed) && parsed.Port == 5100;

    public bool IsAllowedOrigin(string origin, string authority)
    {
        if (!TryParseAuthority(authority, out var requestAuthority) || requestAuthority.Port != 5100
            || !TryParseOrigin(origin, out var originAuthority))
            return false;

        return originAuthority == requestAuthority || originAuthority == _developmentAuthority;
    }

    public Uri CreateBootstrapUri() => new($"http://localhost:5100/#penguin-session={EncodeToken(_credential)}");

    private static bool TryDecodeToken(string? token, out byte[] bytes)
    {
        bytes = [];
        if (token is null || token.Length != 43
            || token.Any(character => !(character is >= 'A' and <= 'Z' or >= 'a' and <= 'z'
                or >= '0' and <= '9' or '-' or '_')))
            return false;

        var decoded = Convert.FromBase64String(token.Replace('-', '+').Replace('_', '/') + "=");
        if (decoded.Length != 32 || !string.Equals(EncodeToken(decoded), token, StringComparison.Ordinal))
            return false;

        bytes = decoded;
        return true;
    }

    private static string EncodeToken(byte[] bytes) => Convert.ToBase64String(bytes)
        .TrimEnd('=').Replace('+', '-').Replace('/', '_');

    private static bool TryParseOrigin(string origin, out Authority authority)
    {
        authority = default;
        return origin is not null && origin.StartsWith("http://", StringComparison.Ordinal)
            && TryParseAuthority(origin[7..], out authority);
    }

    private static bool TryParseAuthority(string authority, out Authority parsed)
    {
        parsed = default;
        if (string.IsNullOrEmpty(authority))
            return false;

        var separator = authority.LastIndexOf(':');
        if (separator < 0)
            return false;

        var host = authority[..separator];
        if (!host.Equals("localhost", StringComparison.OrdinalIgnoreCase)
            && host != "127.0.0.1" && host != "[::1]")
            return false;

        var portText = authority[(separator + 1)..];
        if (!int.TryParse(portText, NumberStyles.None, CultureInfo.InvariantCulture, out var port)
            || port is < 1 or > 65535
            || portText != port.ToString(CultureInfo.InvariantCulture))
            return false;

        parsed = new Authority(host.ToLowerInvariant(), port);
        return true;
    }

    private static ArgumentException InvalidConfiguration() => new("Invalid API session configuration.");

    private readonly record struct Authority(string Host, int Port);
}

namespace PenguinLauncher.Hosting;

public static class LocalApiBoundary
{
    public static WebApplication UseLocalApiBoundary(this WebApplication app, ApiSessionPolicy policy)
    {
        app.Use(async (HttpContext context, RequestDelegate next) =>
        {
            var request = context.Request;
            if (IsApiPath(request.Path))
            {
                // Run when headers start, after downstream code has finished setting them.
                context.Response.OnStarting(() =>
                {
                    context.Response.Headers.CacheControl = "no-store";
                    return Task.CompletedTask;
                });
            }

            var hosts = request.Headers.Host;
            if (hosts.Count != 1 || !policy.IsAllowedAuthority(hosts[0]!))
            {
                await WriteErrorAsync(context, StatusCodes.Status403Forbidden, "Request not allowed.");
                return;
            }

            if (!IsApiPath(request.Path))
            {
                await next(context);
                return;
            }

            var origins = request.Headers.Origin;
            var hasOrigin = request.Headers.ContainsKey("Origin");
            if (hasOrigin && (origins.Count != 1 || !policy.IsAllowedOrigin(origins[0]!, hosts[0]!)))
            {
                await WriteErrorAsync(context, StatusCodes.Status403Forbidden, "Request not allowed.");
                return;
            }

            var isDevelopmentOrigin = hasOrigin && policy.DevelopmentOrigin is not null
                && string.Equals(origins[0], policy.DevelopmentOrigin, StringComparison.OrdinalIgnoreCase);
            if (isDevelopmentOrigin)
            {
                context.Response.Headers.AccessControlAllowOrigin = policy.DevelopmentOrigin;
                context.Response.Headers.Append("Vary", "Origin");
            }

            if (request.Headers["Sec-Fetch-Site"].Any(value =>
                value?.Split(',').Any(part => part.Trim().Equals("cross-site", StringComparison.OrdinalIgnoreCase)) == true)
                && !isDevelopmentOrigin)
            {
                await WriteErrorAsync(context, StatusCodes.Status403Forbidden, "Request not allowed.");
                return;
            }

            var hasPreflightDeclaration = request.Headers.ContainsKey("Access-Control-Request-Method")
                || request.Headers.ContainsKey("Access-Control-Request-Headers");
            if (HttpMethods.IsOptions(request.Method) && hasPreflightDeclaration)
            {
                var methods = request.Headers.AccessControlRequestMethod;
                var headers = request.Headers.AccessControlRequestHeaders;
                var requestedHeaders = headers.Count == 1 && !string.IsNullOrEmpty(headers[0])
                    ? headers[0]!.Split(',').Select(header => header.Trim()).ToArray()
                    : Array.Empty<string>();
                if (!isDevelopmentOrigin || methods.Count != 1
                    || methods[0] is not ("GET" or "POST" or "DELETE" or "HEAD")
                    || headers.Count > 1
                    || requestedHeaders.Any(header =>
                        !header.Equals("Authorization", StringComparison.OrdinalIgnoreCase)
                        && !header.Equals("Content-Type", StringComparison.OrdinalIgnoreCase)))
                {
                    await WriteErrorAsync(context, StatusCodes.Status403Forbidden, "Request not allowed.");
                    return;
                }

                context.Response.Headers.AccessControlAllowMethods = methods[0];
                if (requestedHeaders.Length > 0)
                    context.Response.Headers.AccessControlAllowHeaders = string.Join(", ", requestedHeaders);
                context.Response.StatusCode = StatusCodes.Status204NoContent;
                return;
            }

            if (!policy.IsAuthorized(request.Headers.Authorization))
            {
                context.Response.Headers.WWWAuthenticate = "Bearer";
                await WriteErrorAsync(context, StatusCodes.Status401Unauthorized, "Authentication required.");
                return;
            }

            await next(context);
        });
        return app;
    }

    public static bool IsApiPath(PathString path) =>
        path.StartsWithSegments("/api", StringComparison.OrdinalIgnoreCase);

    public static Task WriteApiNotFoundAsync(HttpContext context) =>
        WriteErrorAsync(context, StatusCodes.Status404NotFound, "API endpoint not found.");

    private static Task WriteErrorAsync(HttpContext context, int statusCode, string error)
    {
        context.Response.StatusCode = statusCode;
        return context.Response.WriteAsJsonAsync(new { error });
    }
}

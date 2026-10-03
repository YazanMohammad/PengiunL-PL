using System.Text.RegularExpressions;
using PenguinLauncher.Models;

namespace PenguinLauncher.Services.GameScanner;

/// <summary>
/// Scans Linux .desktop entry files in system and user directories to discover
/// natively installed games, Flatpak titles, and Heroic/Lutris games.
/// Adapted from Playnite's Linux desktop scanner logic.
/// </summary>
public class LinuxDesktopScanner : IGameScanner
{
    public Platform Platform => Platform.LinuxNative;

    public bool IsInstalled()
    {
        return OperatingSystem.IsLinux();
    }

    public async Task<List<Game>> ScanAsync()
    {
        var games = new List<Game>();
        if (!OperatingSystem.IsLinux()) return games;

        var home = Environment.GetFolderPath(Environment.SpecialFolder.UserProfile);
        var searchDirs = new[]
        {
            "/usr/share/applications",
            "/usr/local/share/applications",
            Path.Combine(home, ".local", "share", "applications"),
            "/var/lib/flatpak/exports/share/applications",
            Path.Combine(home, ".local", "share", "flatpak", "exports", "share", "applications")
        };

        var visitedNames = new HashSet<string>(StringComparer.OrdinalIgnoreCase);

        foreach (var dir in searchDirs)
        {
            if (!Directory.Exists(dir)) continue;

            string[] files;
            try
            {
                files = Directory.GetFiles(dir, "*.desktop", SearchOption.AllDirectories);
            }
            catch
            {
                continue;
            }

            foreach (var file in files)
            {
                try
                {
                    var lines = await File.ReadAllLinesAsync(file);
                    var props = ParseDesktopFile(lines);

                    // Must be an application
                    if (!props.TryGetValue("Type", out var type) || !type.Equals("Application", StringComparison.OrdinalIgnoreCase))
                        continue;

                    // Skip hidden entries
                    if (props.TryGetValue("NoDisplay", out var noDisplay) && noDisplay.Equals("true", StringComparison.OrdinalIgnoreCase))
                        continue;

                    // Check if it's categorized as a Game or belongs to a known game runner
                    var isGame = false;
                    if (props.TryGetValue("Categories", out var categories) && categories.Contains("Game", StringComparison.OrdinalIgnoreCase))
                    {
                        isGame = true;
                    }
                    else if (file.Contains("heroic", StringComparison.OrdinalIgnoreCase) ||
                             file.Contains("lutris", StringComparison.OrdinalIgnoreCase) ||
                             file.Contains("bottles", StringComparison.OrdinalIgnoreCase))
                    {
                        isGame = true;
                    }

                    if (!isGame) continue;

                    if (!props.TryGetValue("Name", out var name) || string.IsNullOrWhiteSpace(name))
                        continue;

                    if (visitedNames.Contains(name)) continue;
                    visitedNames.Add(name);

                    props.TryGetValue("Exec", out var exec);
                    props.TryGetValue("Path", out var workDir);
                    props.TryGetValue("Icon", out var icon);

                    // Clean exec parameter (%u, %f, etc.)
                    var cleanExec = CleanExecCommand(exec ?? "");
                    var fileId = Path.GetFileNameWithoutExtension(file);

                    games.Add(new Game(
                        Id: $"linux_{fileId.ToLowerInvariant().Replace(' ', '_')}",
                        Name: name,
                        Platform: Platform.LinuxNative,
                        InstallPath: workDir ?? file,
                        LaunchUri: !string.IsNullOrEmpty(cleanExec) ? $"exec://{cleanExec}" : null,
                        CoverImageUrl: null,
                        BackgroundImageUrl: null,
                        AssociatedAccountIds: new List<string>()
                    )
                    {
                        PlatformGameId = fileId
                    });
                }
                catch
                {
                    // Skip malformed .desktop entries
                }
            }
        }

        return games;
    }

    private static Dictionary<string, string> ParseDesktopFile(string[] lines)
    {
        var dict = new Dictionary<string, string>(StringComparer.OrdinalIgnoreCase);
        var inDesktopEntrySection = false;

        foreach (var rawLine in lines)
        {
            var line = rawLine.Trim();
            if (string.IsNullOrEmpty(line) || line.StartsWith('#')) continue;

            if (line.StartsWith('[') && line.EndsWith(']'))
            {
                inDesktopEntrySection = line.Equals("[Desktop Entry]", StringComparison.OrdinalIgnoreCase);
                continue;
            }

            if (!inDesktopEntrySection) continue;

            var eqIndex = line.IndexOf('=');
            if (eqIndex > 0)
            {
                var key = line[..eqIndex].Trim();
                var val = line[(eqIndex + 1)..].Trim();
                dict[key] = val;
            }
        }

        return dict;
    }

    private static string CleanExecCommand(string exec)
    {
        if (string.IsNullOrEmpty(exec)) return string.Empty;
        // Strip out %f, %F, %u, %U, %d, %D, %n, %N, %i, %c, %k, %v
        return Regex.Replace(exec, @"%[fFuUdDnNickv]", "").Trim();
    }
}

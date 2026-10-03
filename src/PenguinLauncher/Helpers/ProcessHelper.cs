using System.Diagnostics;

namespace PenguinLauncher.Helpers;

/// <summary>
/// Utility for killing and launching OS processes.
/// Adapted from TcNo Account Switcher's process management logic.
/// </summary>
public static class ProcessHelper
{
    /// <summary>
    /// Kills all instances of a process by name. Waits up to <paramref name="timeoutMs"/> for exit.
    /// </summary>
    public static async Task<bool> KillProcess(string processName, int timeoutMs = 10_000)
    {
        var processes = Process.GetProcessesByName(processName);
        if (processes.Length == 0) return true;

        foreach (var proc in processes)
        {
            try
            {
                if (!proc.HasExited)
                {
                    proc.Kill(entireProcessTree: true);
                }
            }
            catch (Exception)
            {
                // Process may have already exited
            }
        }

        // Wait for all instances to exit
        var sw = Stopwatch.StartNew();
        while (sw.ElapsedMilliseconds < timeoutMs)
        {
            if (Process.GetProcessesByName(processName).Length == 0)
                return true;
            await Task.Delay(250);
        }

        return Process.GetProcessesByName(processName).Length == 0;
    }

    /// <summary>
    /// Checks if a process is currently running.
    /// </summary>
    public static bool IsRunning(string processName)
    {
        return Process.GetProcessesByName(processName).Length > 0;
    }

    /// <summary>
    /// Launches a process and optionally waits for it.
    /// </summary>
    public static Process? Launch(string path, string arguments = "", bool useShellExecute = true)
    {
        try
        {
            var psi = new ProcessStartInfo
            {
                FileName = path,
                Arguments = arguments,
                UseShellExecute = useShellExecute
            };
            return Process.Start(psi);
        }
        catch (Exception)
        {
            return null;
        }
    }

    /// <summary>
    /// Launches a URI (e.g., steam://rungameid/730 or exec://super-tux).
    /// </summary>
    public static Process? LaunchUri(string uri)
    {
        try
        {
            if (uri.StartsWith("exec://", StringComparison.OrdinalIgnoreCase))
            {
                var cmd = uri["exec://".Length..];
                if (OperatingSystem.IsWindows())
                {
                    return Process.Start(new ProcessStartInfo
                    {
                        FileName = "cmd.exe",
                        Arguments = $"/c {cmd}",
                        CreateNoWindow = true,
                        UseShellExecute = false
                    });
                }
                else
                {
                    return Process.Start(new ProcessStartInfo
                    {
                        FileName = "/bin/sh",
                        Arguments = $"-c \"{cmd.Replace("\"", "\\\"")}\"",
                        UseShellExecute = false
                    });
                }
            }

            if (OperatingSystem.IsLinux())
            {
                return Process.Start(new ProcessStartInfo
                {
                    FileName = "xdg-open",
                    Arguments = $"\"{uri}\"",
                    UseShellExecute = false
                });
            }

            var psi = new ProcessStartInfo
            {
                FileName = uri,
                UseShellExecute = true
            };
            return Process.Start(psi);
        }
        catch (Exception)
        {
            return null;
        }
    }
}

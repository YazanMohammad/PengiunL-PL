namespace PenguinLauncher.Hosting;

public enum LaunchMode { Desktop, ServerOnly, ScanOnly }

public static class LaunchModes
{
    public static LaunchMode Resolve(string[] args)
    {
        if (args.Contains("--scan-only"))
            return LaunchMode.ScanOnly;

        return args.Contains("--server-only") ? LaunchMode.ServerOnly : LaunchMode.Desktop;
    }
}

namespace PenguinLauncher.Tests.Fixtures;

public sealed class TemporaryDirectory : IDisposable
{
    private readonly string fixtureParent = Path.GetFullPath(
        Path.Combine(Path.GetTempPath(), "PenguinLauncher.Tests"));

    public string RootPath { get; }

    public TemporaryDirectory()
    {
        Directory.CreateDirectory(fixtureParent);
        RejectReparsePoint(fixtureParent);
        RootPath = Path.GetFullPath(Path.Combine(fixtureParent, Guid.NewGuid().ToString("N")));
        Directory.CreateDirectory(RootPath);
    }

    public void Dispose()
    {
        var relativePath = Path.GetRelativePath(fixtureParent, RootPath);
        if (!Guid.TryParseExact(relativePath, "N", out _) ||
            !string.Equals(Path.GetDirectoryName(RootPath), fixtureParent, StringComparison.OrdinalIgnoreCase))
        {
            throw new InvalidOperationException("Cleanup requires an owned root directly inside the fixture parent.");
        }

        RejectReparsePoint(fixtureParent);
        if (!Directory.Exists(RootPath))
        {
            return;
        }

        ValidateTree(RootPath);
        Directory.Delete(RootPath, recursive: true);
    }

    private static void ValidateTree(string directory)
    {
        // Check each directory before enumerating it; never traverse a link.
        RejectReparsePoint(directory);
        foreach (var entry in Directory.EnumerateFileSystemEntries(directory))
        {
            var attributes = RejectReparsePoint(entry);
            if ((attributes & FileAttributes.Directory) != 0)
            {
                ValidateTree(entry);
            }
        }
    }

    private static FileAttributes RejectReparsePoint(string path)
    {
        var attributes = File.GetAttributes(path);
        if ((attributes & FileAttributes.ReparsePoint) != 0)
        {
            throw new InvalidOperationException("Cleanup refuses reparse points in the fixture tree.");
        }

        return attributes;
    }
}

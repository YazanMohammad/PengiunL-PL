using Xunit;

namespace PenguinLauncher.Tests.Fixtures;

public class TemporaryDirectoryTests
{
    [Fact]
    public void Dispose_RemovesOnlyItsOwnedRoot()
    {
        using var first = new TemporaryDirectory();
        using var second = new TemporaryDirectory();
        var firstFile = Path.Combine(first.RootPath, "first.txt");
        var secondFile = Path.Combine(second.RootPath, "second.txt");
        File.WriteAllText(firstFile, "synthetic first");
        File.WriteAllText(secondFile, "synthetic second");

        first.Dispose();

        Assert.False(Directory.Exists(first.RootPath));
        Assert.True(File.Exists(secondFile));
        Assert.Equal("synthetic second", File.ReadAllText(secondFile));
    }
}

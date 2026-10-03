using System.Text;
using PenguinLauncher.Helpers;
using PenguinLauncher.Tests.Fixtures;
using Xunit;

namespace PenguinLauncher.Tests.Helpers;

public class VdfParserTests
{
    private const string SupportedUsers = """
        "Users" { "101" { "AccountName" "alice" } "202" { "AccountName" "bob" } }
        """;

    [Fact]
    public void Parse_PreservesNestedSiblingsAndIgnoresLookupCase()
    {
        var tree = VdfParser.Parse(SupportedUsers);

        Assert.Equal("alice", tree["users"]!["101"]!["accountname"]!.Value);
        Assert.Equal("bob", tree["users"]!["202"]!["accountname"]!.Value);
        Assert.Null(tree["users"]!["missing"]);
    }

    [Fact]
    public void Parse_ReadsTopLevelKeyValue()
    {
        var tree = VdfParser.Parse("\"AccountName\" \"top-level-user\"");

        Assert.Equal("top-level-user", tree["AccountName"]!.Value);
    }

    [Fact]
    public void Serialize_ParseRoundTrip_PreservesSupportedValues()
    {
        var serialized = VdfParser.Serialize(VdfParser.Parse(SupportedUsers));
        var reparsed = VdfParser.Parse(serialized);

        Assert.Equal("alice", reparsed["Users"]!["101"]!["AccountName"]!.Value);
        Assert.Equal("bob", reparsed["Users"]!["202"]!["AccountName"]!.Value);
    }

    [Fact]
    public void ParseFile_ReadsOnlySyntheticFixture()
    {
        using var directory = new TemporaryDirectory();
        var fixturePath = Path.Combine(directory.RootPath, "synthetic.vdf");
        File.WriteAllText(fixturePath, "\"AccountName\" \"fixture-user\"", Encoding.UTF8);

        var tree = VdfParser.ParseFile(fixturePath);

        Assert.Equal("fixture-user", tree["AccountName"]!.Value);
    }
}

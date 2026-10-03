using System.Text;
using System.Text.RegularExpressions;

namespace PenguinLauncher.Helpers;

/// <summary>
/// Minimal Valve Data Format (VDF) parser for reading Steam's configuration files.
/// Adapted from Playnite's VDF parsing logic used in SteamLibrary plugin.
/// Handles loginusers.vdf, libraryfolders.vdf, and appmanifest_*.acf files.
/// </summary>
public class VdfParser
{
    public class VdfNode
    {
        public string? Value { get; set; }
        public Dictionary<string, VdfNode> Children { get; set; } = new(StringComparer.OrdinalIgnoreCase);

        public VdfNode? this[string key] =>
            Children.TryGetValue(key, out var node) ? node : null;

        public bool HasChildren => Children.Count > 0;
    }

    private static readonly Regex TokenRegex = new(
        @"""([^""]*)""|\{|\}",
        RegexOptions.Compiled);

    /// <summary>
    /// Parses a VDF file into a tree structure.
    /// </summary>
    public static VdfNode Parse(string content)
    {
        var root = new VdfNode();
        var stack = new Stack<VdfNode>();
        stack.Push(root);

        var tokens = TokenRegex.Matches(content)
            .Select(m => m.Value)
            .ToList();

        int i = 0;
        while (i < tokens.Count)
        {
            var token = tokens[i];

            if (token == "{")
            {
                i++;
                continue;
            }

            if (token == "}")
            {
                if (stack.Count > 1) stack.Pop();
                i++;
                continue;
            }

            // It's a quoted string — this is a key
            var key = Unquote(token);
            i++;

            if (i >= tokens.Count) break;

            var next = tokens[i];

            if (next == "{")
            {
                // Key opens a new section
                var child = new VdfNode();
                stack.Peek().Children[key] = child;
                stack.Push(child);
                i++; // consume '{'
            }
            else if (next != "}")
            {
                // Key-value pair
                var value = Unquote(next);
                stack.Peek().Children[key] = new VdfNode { Value = value };
                i++;
            }
        }

        return root;
    }

    /// <summary>
    /// Parses a VDF file from disk.
    /// </summary>
    public static VdfNode ParseFile(string filePath)
    {
        var content = File.ReadAllText(filePath, Encoding.UTF8);
        return Parse(content);
    }

    /// <summary>
    /// Serializes a VdfNode tree back into VDF format.
    /// Used when writing modified loginusers.vdf.
    /// </summary>
    public static string Serialize(VdfNode node, int indent = 0)
    {
        var sb = new StringBuilder();
        var tabs = new string('\t', indent);

        foreach (var (key, child) in node.Children)
        {
            if (child.HasChildren)
            {
                sb.AppendLine($"{tabs}\"{key}\"");
                sb.AppendLine($"{tabs}{{");
                sb.Append(Serialize(child, indent + 1));
                sb.AppendLine($"{tabs}}}");
            }
            else
            {
                sb.AppendLine($"{tabs}\"{key}\"\t\t\"{child.Value ?? string.Empty}\"");
            }
        }

        return sb.ToString();
    }

    private static string Unquote(string s)
    {
        if (s.Length >= 2 && s[0] == '"' && s[^1] == '"')
            return s[1..^1];
        return s;
    }
}

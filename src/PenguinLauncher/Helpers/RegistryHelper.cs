using Microsoft.Win32;

namespace PenguinLauncher.Helpers;

/// <summary>
/// Wrapper around Windows Registry for reading/writing launcher configuration.
/// Adapted from both Playnite's registry scanning and TcNo's registry manipulation.
/// </summary>
public static class RegistryHelper
{
    /// <summary>
    /// Reads a string value from the registry.
    /// </summary>
    public static string? GetValue(string keyPath, string valueName)
    {
        if (!OperatingSystem.IsWindows()) return null;
        try
        {
            using var key = OpenKey(keyPath, writable: false);
            return key?.GetValue(valueName)?.ToString();
        }
        catch
        {
            return null;
        }
    }

    /// <summary>
    /// Sets a string value in the registry.
    /// </summary>
    public static bool SetValue(string keyPath, string valueName, string value)
    {
        if (!OperatingSystem.IsWindows()) return false;
        try
        {
            using var key = OpenKey(keyPath, writable: true);
            if (key == null) return false;
            key.SetValue(valueName, value, RegistryValueKind.String);
            return true;
        }
        catch
        {
            return false;
        }
    }

    /// <summary>
    /// Sets a DWORD value in the registry.
    /// </summary>
    public static bool SetDword(string keyPath, string valueName, int value)
    {
        if (!OperatingSystem.IsWindows()) return false;
        try
        {
            using var key = OpenKey(keyPath, writable: true);
            if (key == null) return false;
            key.SetValue(valueName, value, RegistryValueKind.DWord);
            return true;
        }
        catch
        {
            return false;
        }
    }

    /// <summary>
    /// Enumerates all subkey names under a given registry path.
    /// </summary>
    public static string[] GetSubKeyNames(string keyPath)
    {
        if (!OperatingSystem.IsWindows()) return Array.Empty<string>();
        try
        {
            using var key = OpenKey(keyPath, writable: false);
            return key?.GetSubKeyNames() ?? Array.Empty<string>();
        }
        catch
        {
            return Array.Empty<string>();
        }
    }

    /// <summary>
    /// Gets all value names under a given registry path.
    /// </summary>
    public static string[] GetValueNames(string keyPath)
    {
        if (!OperatingSystem.IsWindows()) return Array.Empty<string>();
        try
        {
            using var key = OpenKey(keyPath, writable: false);
            return key?.GetValueNames() ?? Array.Empty<string>();
        }
        catch
        {
            return Array.Empty<string>();
        }
    }

    private static RegistryKey? OpenKey(string keyPath, bool writable)
    {
        if (!OperatingSystem.IsWindows()) return null;
        // Parse the root hive from the path
        var parts = keyPath.Split('\\', 2);
        if (parts.Length < 2) return null;

        RegistryKey? root = parts[0].ToUpperInvariant() switch
        {
            "HKEY_LOCAL_MACHINE" or "HKLM" => Registry.LocalMachine,
            "HKEY_CURRENT_USER" or "HKCU" => Registry.CurrentUser,
            "HKEY_CLASSES_ROOT" or "HKCR" => Registry.ClassesRoot,
            "HKEY_USERS" or "HKU" => Registry.Users,
            _ => null
        };

        return root?.OpenSubKey(parts[1], writable);
    }
}

using System.Text.Json;
using PenguinLauncher.Models;

namespace PenguinLauncher.Services.Storage;

/// <summary>
/// Simple JSON file-based persistence for application state.
/// </summary>
public class JsonStorageService
{
    private static readonly string AppDataDir = Path.Combine(
        Environment.GetFolderPath(Environment.SpecialFolder.ApplicationData),
        "PenguinLauncher");

    private static readonly string StateFilePath = Path.Combine(AppDataDir, "state.json");

    private static readonly JsonSerializerOptions JsonOptions = new()
    {
        WriteIndented = true,
        PropertyNamingPolicy = JsonNamingPolicy.CamelCase,
        Converters = { new System.Text.Json.Serialization.JsonStringEnumConverter() }
    };

    private AppState _state = new();
    private readonly SemaphoreSlim _lock = new(1, 1);

    public async Task<AppState> LoadAsync()
    {
        await _lock.WaitAsync();
        try
        {
            if (File.Exists(StateFilePath))
            {
                var json = await File.ReadAllTextAsync(StateFilePath);
                _state = JsonSerializer.Deserialize<AppState>(json, JsonOptions) ?? new AppState();
            }
            return _state;
        }
        finally
        {
            _lock.Release();
        }
    }

    public async Task SaveAsync(AppState? state = null)
    {
        await _lock.WaitAsync();
        try
        {
            if (state != null) _state = state;
            Directory.CreateDirectory(AppDataDir);
            var json = JsonSerializer.Serialize(_state, JsonOptions);
            await File.WriteAllTextAsync(StateFilePath, json);
        }
        finally
        {
            _lock.Release();
        }
    }

    public AppState State => _state;
}

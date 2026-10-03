using System.Collections.Concurrent;
using System.Text.Json;

namespace PenguinLauncher.Services.GameScanner;

/// <summary>
/// Provides fast cached title and metadata resolution for uninstalled Steam games.
/// Persists names in %APPDATA%/PenguinLauncher/steam_app_names.json.
/// </summary>
public class SteamMetadataService
{
    private static readonly string CacheFile = Path.Combine(
        Environment.GetFolderPath(Environment.SpecialFolder.ApplicationData),
        "PenguinLauncher",
        "steam_app_names.json"
    );

    private readonly ConcurrentDictionary<string, string> _nameCache = new(StringComparer.OrdinalIgnoreCase);
    private readonly HttpClient _http = new() { Timeout = TimeSpan.FromSeconds(4) };
    private readonly ILogger<SteamMetadataService> _logger;

    // Common top titles for instant offline resolution
    private static readonly Dictionary<string, string> KnownTitles = new()
    {
        ["10"] = "Counter-Strike",
        ["20"] = "Team Fortress Classic",
        ["30"] = "Day of Defeat",
        ["40"] = "Deathmatch Classic",
        ["50"] = "Half-Life: Opposing Force",
        ["60"] = "Ricochet",
        ["70"] = "Half-Life",
        ["80"] = "Counter-Strike: Condition Zero",
        ["100"] = "Counter-Strike: Condition Zero Deleted Scenes",
        ["130"] = "Half-Life: Blue Shift",
        ["220"] = "Half-Life 2",
        ["240"] = "Counter-Strike: Source",
        ["280"] = "Half-Life: Source",
        ["300"] = "Day of Defeat: Source",
        ["320"] = "Half-Life 2: Deathmatch",
        ["340"] = "Half-Life 2: Lost Coast",
        ["360"] = "Half-Life Deathmatch: Source",
        ["380"] = "Half-Life 2: Episode One",
        ["400"] = "Portal",
        ["420"] = "Half-Life 2: Episode Two",
        ["440"] = "Team Fortress 2",
        ["480"] = "Spacewar",
        ["500"] = "Left 4 Dead",
        ["550"] = "Left 4 Dead 2",
        ["570"] = "Dota 2",
        ["620"] = "Portal 2",
        ["630"] = "Alien Swarm",
        ["730"] = "Counter-Strike 2",
        ["1002"] = "Rag Doll Kung Fu",
        ["1250"] = "Killing Floor",
        ["1500"] = "Darwinia",
        ["1510"] = "Uplink",
        ["1520"] = "DEFCON",
        ["1530"] = "Multiwinia",
        ["4000"] = "Garry's Mod",
        ["8930"] = "Sid Meier's Civilization V",
        ["271590"] = "Grand Theft Auto V",
        ["252490"] = "Rust",
        ["292030"] = "The Witcher 3: Wild Hunt",
        ["359550"] = "Tom Clancy's Rainbow Six Siege",
        ["381210"] = "Dead by Daylight",
        ["413150"] = "Stardew Valley",
        ["431960"] = "Wallpaper Engine",
        ["470220"] = "BattleBit Remastered",
        ["578080"] = "PUBG: BATTLEGROUNDS",
        ["105600"] = "Terraria",
        ["108600"] = "Project Zomboid",
        ["1091500"] = "Cyberpunk 2077",
        ["1172470"] = "Apex Legends",
        ["1245620"] = "ELDEN RING",
        ["1238860"] = "Battlefield 2042",
        ["1874880"] = "Ready or Not",
        ["2807960"] = "Battlefield 6",
        ["3419430"] = "Bongo Cat",
        ["236390"] = "War Thunder",
        ["218620"] = "PAYDAY 2",
        ["304930"] = "Unturned",
        ["377160"] = "Fallout 4",
        ["489830"] = "The Elder Scrolls V: Skyrim Special Edition",
        ["553850"] = "HELLDIVERS 2",
        ["1086940"] = "Baldur's Gate 3",
        ["1623730"] = "Palworld",
        ["2358720"] = "Black Myth: Wukong",
        ["582010"] = "Monster Hunter: World",
        ["1085660"] = "Destiny 2",
        ["1966720"] = "Lethal Company",
        ["739630"] = "Phasmophobia",
        ["945360"] = "Among Us",
        ["346110"] = "ARK: Survival Evolved",
        ["526870"] = "Satisfactory",
        ["427520"] = "Factorio",
        ["264710"] = "Subnautica",
        ["1172620"] = "Sea of Thieves",
        ["548430"] = "Deep Rock Galactic",
        ["294100"] = "RimWorld",
        ["394360"] = "Hearts of Iron IV",
        ["1158310"] = "Crusader Kings III",
        ["227300"] = "Euro Truck Simulator 2",
        ["284160"] = "BeamNG.drive",
        ["1551360"] = "Forza Horizon 5",
        ["242760"] = "The Forest",
        ["1326470"] = "Sons of the Forest",
        ["322330"] = "Don't Starve Together",
        ["251570"] = "7 Days to Die",
        ["367520"] = "Hollow Knight",
        ["1145360"] = "Hades",
        ["1145350"] = "Hades II",
        ["1363080"] = "Manor Lords",
        ["230410"] = "Warframe",
        ["238960"] = "Path of Exile",
        ["1172380"] = "STAR WARS Jedi: Fallen Order",
        ["1774580"] = "STAR WARS Jedi: Survivor",
        ["1063730"] = "New World",
        ["1426210"] = "It Takes Two",
        ["976730"] = "Halo: The Master Chief Collection",
        ["1240440"] = "Halo Infinite",
    };

    public SteamMetadataService(ILogger<SteamMetadataService> logger)
    {
        _logger = logger;
        _http.DefaultRequestHeaders.Add("User-Agent", "PenguinLauncher/1.0 (Windows NT 10.0; Win64; x64)");
        LoadCache();
    }

    private void LoadCache()
    {
        // Pre-populate with known titles
        foreach (var (id, name) in KnownTitles)
        {
            _nameCache[id] = name;
        }

        try
        {
            if (File.Exists(CacheFile))
            {
                var json = File.ReadAllText(CacheFile);
                var saved = JsonSerializer.Deserialize<Dictionary<string, string>>(json);
                if (saved != null)
                {
                    foreach (var (k, v) in saved)
                    {
                        _nameCache[k] = v;
                    }
                }
            }
        }
        catch (Exception ex)
        {
            _logger.LogWarning(ex, "Failed to load steam app names cache");
        }
    }

    public void SaveCache()
    {
        try
        {
            var dir = Path.GetDirectoryName(CacheFile);
            if (!string.IsNullOrEmpty(dir) && !Directory.Exists(dir))
            {
                Directory.CreateDirectory(dir);
            }
            var json = JsonSerializer.Serialize(_nameCache, new JsonSerializerOptions { WriteIndented = true });
            File.WriteAllText(CacheFile, json);
        }
        catch (Exception ex)
        {
            _logger.LogWarning(ex, "Failed to save steam app names cache");
        }
    }

    public string GetName(string appId)
    {
        return _nameCache.TryGetValue(appId, out var name) ? name : $"Steam App {appId}";
    }

    public void CacheName(string appId, string name)
    {
        if (!string.IsNullOrWhiteSpace(name))
        {
            _nameCache[appId] = name;
        }
    }

    /// <summary>
    /// Resolves titles for a list of AppIDs concurrently in the background and saves cache.
    /// </summary>
    public async Task ResolveMissingTitlesAsync(IEnumerable<string> appIds, int maxToResolve = 100)
    {
        var missing = appIds
            .Distinct()
            .Where(id => !_nameCache.ContainsKey(id))
            .Take(maxToResolve)
            .ToList();

        if (missing.Count == 0) return;

        using var throttler = new SemaphoreSlim(4);
        var tasks = missing.Select(async id =>
        {
            await throttler.WaitAsync();
            try
            {
                var url = $"https://store.steampowered.com/api/appdetails?appids={id}&filters=basic";
                var res = await _http.GetStringAsync(url);
                using var doc = JsonDocument.Parse(res);
                if (doc.RootElement.TryGetProperty(id, out var root) &&
                    root.TryGetProperty("success", out var success) &&
                    success.GetBoolean() &&
                    root.TryGetProperty("data", out var data) &&
                    data.TryGetProperty("name", out var nameProp))
                {
                    var name = nameProp.GetString();
                    if (!string.IsNullOrWhiteSpace(name))
                    {
                        _nameCache[id] = name;
                    }
                }
            }
            catch
            {
                // Ignore transient lookup errors or rate limits
            }
            finally
            {
                throttler.Release();
            }
        });

        await Task.WhenAll(tasks);
        SaveCache();
    }
}

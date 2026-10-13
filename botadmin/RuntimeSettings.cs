using System.IO;
using System.Text.Json.Nodes;

namespace BotAdmin;

// Machine-local endpoints and model choices; credentials remain in existing secret files.
internal static class RuntimeSettings
{
    internal static string Value(string key, string fallback)
    {
        var file = Path.Combine(Monitor.Root, "botteam.local.json");
        if (!File.Exists(file)) return fallback;
        return JsonNode.Parse(File.ReadAllText(file))?[key]?.GetValue<string>() ?? fallback;
    }
    internal static string RouterModel => Environment.GetEnvironmentVariable("BOTTEAM_9ROUTER_MODEL")
        ?? Value("routerModel", "kimi/kimi-k2.5");
    internal static string RouterUrl => Environment.GetEnvironmentVariable("BOTTEAM_9ROUTER_URL")
        ?? Value("routerUrl", "http://host.docker.internal:20129/v1");
    internal static bool HasRouterKey => File.Exists(Path.Combine(Monitor.Root, "9router-api-key.txt"));
}

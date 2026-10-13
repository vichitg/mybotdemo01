> Superseded for MiniDev: [MINIDEV-QUICKSTART.md](MINIDEV-QUICKSTART.md). This file records an earlier setup stage.

# 9Router → Rakazo / BotTeam integration

## Architecture

BotTeam (WPF) → Rakazo (9 bots / approvals / browser tools) → 9Router (OpenAI-compatible gateway) → authorized model provider. The local 9Router dashboard is http://127.0.0.1:20128/dashboard.

## Current MiniDev verification

- 9router npm package 0.5.99 installed, dashboard HTTP 200, `/v1/models` HTTP 200 (catalog lists 78 models).
- Unauthenticated sample completion returned HTTP 401: model access is **not yet** verified.
- Rakazo API ports 3110/5173 were unavailable; WSL Ubuntu-24.04 was not installed when checked.
- **Never interpret catalog listing as model entitlement**. ChatGPT subscription/OAuth compatibility depends on the upstream integration and usage restrictions.

## Finish authorization (user action)

1. Open 9Router Dashboard → Providers, connect a provider using its authorized flow and test one model.
2. Open Dashboard → API Keys and generate a local gateway key. Save it in `C:\Labs\mybotdemo01\9router-api-key.txt` (gitignored); do not put upstream OAuth tokens into source files.
3. Set `BOTTEAM_9ROUTER_MODEL` to the actual working model ID if different from `kr/claude-sonnet-4.5`.
4. For Rakazo in Docker, set `BOTTEAM_9ROUTER_URL` to an endpoint reachable from its container (default `http://host.docker.internal:20128/v1`); **9Router listening only on Windows loopback may not be reachable from Docker**. Bind to a restricted Docker-accessible interface, ensure firewall prevents LAN exposure, then test container reachability.
5. Start Rakazo and select **🔀 9Router** in the BotTeam footer. Keep approval rules on for financial writes, email sending, and browser actions.

## Operations

`9router --host 127.0.0.1 --no-browser --skip-update`

`dotnet publish botadmin\BotAdmin.csproj -c Release -r win-x64 --self-contained -p:PublishSingleFile=true -o botadmin\dist`

`powershell -ExecutionPolicy Bypass -File .\botteam.ps1 status`

9Router model routing does not itself install Rakazo, Linux bot desktops, or 3D office dependencies. Do not disable approval or network isolation to get it running.

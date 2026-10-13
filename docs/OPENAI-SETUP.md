# OpenAI provider setup (MiniDev)

## What is supported

BotTeam can switch Rakazo's default AI provider among Local Gemma, DeepSeek, and OpenAI API. The OpenAI option uses the official API with its **own API billing**, not the ChatGPT subscription. Sign in with ChatGPT plan usage is available only to participating integrations; this fork does not claim SIWC support.

## Setup

1. Create `C:\Labs\mybotdemo01\openai-api-key.txt` and put your OpenAI Platform API key (`sk-...`) on the first line. **Never commit or share it.** This filename is excluded by `.gitignore`.
2. Ensure a compatible Rakazo v0.1.6 server is installed and working under WSL2 Ubuntu-24.04 with Docker Engine, as described in `RUNBOOK.md`.
3. Build Windows app: `dotnet publish botadmin\BotAdmin.csproj -c Release -r win-x64 --self-contained -p:PublishSingleFile=true -o botadmin\dist`
4. Run `powershell -ExecutionPolicy Bypass -File .\botteam.ps1 start`. In the app footer, choose **OpenAI API**. This connects model `gpt-4.1` to Rakazo on first selection.
5. Verify the bots can answer, use tools, and request human approval before any consequential action. API costs apply, and conversation/screenshots may be sent to OpenAI.

## Important limitations

- The OpenAI provider path requires a working Rakazo stack and has not been validated end-to-end on a machine without Ubuntu-24.04.
- Company helper features (briefings and plan parsing in `Company.Ask`) use OpenAI API when the selected default mode is OpenAI. Local and DeepSeek modes retain the existing local helper behavior.
- The existing `botteam.ps1` starts the local model on demand via the app; cloud-only deployments need the remaining local-model dependencies reviewed.
- The app discovers its root from `BOTTEAM_ROOT` or the publish folder's grandparent, so publishing to the documented `botadmin\dist` preserves `C:\Labs\mybotdemo01` as the root.
- Do **not** treat unofficial OAuth or extracted ChatGPT session cookies as a supported API integration.

Sources: https://help.openai.com/en/articles/20001542-using-your-chatgpt-plan-in-other-apps-and-sites and https://help.openai.com/en/articles/9039756-managing-billing-for-chatgpt-and-the-api-platform


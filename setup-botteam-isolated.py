from pathlib import Path
import secrets, shutil, re
source=Path('/root/rakazo')
root=Path('/root/botteam-rakazo'); root.mkdir(exist_ok=True)
compose=source/'infra/compose/docker-compose.images.yml'
(root/'docker-compose.images.yml').write_text(compose.read_text().replace('name: rakazo\n','name: botteam\n'))
env=root/'.env'
if not env.exists():
 raw=(source/'.env.example').read_text()
 updates={'POSTGRES_PASSWORD':secrets.token_hex(24),'BETTER_AUTH_SECRET':secrets.token_hex(32),
  'ENCRYPTION_KEY':secrets.token_hex(32),'SANDBOX_SUPERVISOR_TOKEN':secrets.token_hex(32),
  'SCREEN_PROXY_SECRET':secrets.token_hex(32),'RAKAZO_API_PORT':'33110','RAKAZO_WEB_PORT':'35173',
  'BETTER_AUTH_URL':'http://127.0.0.1:35173','WEB_ORIGIN':'http://127.0.0.1:35173',
  'API_URL':'http://127.0.0.1:33110','RAKAZO_IMAGE_TAG':'v0.1.6','RAKAZO_COMPUTER_IMAGE_TAG':'v0.1.6',
  'RAKAZO_OPENAI_COMPATIBLE_VISION_MODELS':'kimi/kimi-k2.5','MAX_TOOL_CALLS_PER_TURN':'12'}
 for k,v in updates.items():
  pat=re.compile(r'^'+k+r'=.*$',re.M)
  raw=pat.sub(lambda _:k+'='+v,raw) if pat.search(raw) else raw+'\n'+k+'='+v
 env.write_text(raw+'\n'); env.chmod(0o600)
 print('Created isolated BotTeam environment; secrets omitted')
print('BotTeam runtime ready at /root/botteam-rakazo; existing credentials preserved')

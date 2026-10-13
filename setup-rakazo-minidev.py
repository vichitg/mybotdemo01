from pathlib import Path
import secrets
root=Path('/root/rakazo')
env=root/'infra/compose/.env'
if env.exists():
 print('EXISTING .env preserved')
 raise SystemExit(0)
raw=(root/'.env.example').read_text()
updates={
 'POSTGRES_PASSWORD': secrets.token_hex(24),
 'BETTER_AUTH_SECRET': secrets.token_hex(32),
 'ENCRYPTION_KEY': secrets.token_hex(32),
 'SANDBOX_SUPERVISOR_TOKEN': secrets.token_hex(32),
 'SCREEN_PROXY_SECRET': secrets.token_hex(32),
 'RAKAZO_API_PORT':'3110', 'RAKAZO_WEB_PORT':'5173',
 'RAKAZO_IMAGE_TAG':'v0.1.6','RAKAZO_COMPUTER_IMAGE_TAG':'v0.1.6',
 'API_URL':'http://127.0.0.1:3110',
 'PI_DEFAULT_PROVIDER':'openai-compatible',
 'PI_DEFAULT_MODEL':'kimi/kimi-k2.5',
}
for k,v in updates.items():
 import re
 pat=re.compile(r'^'+k+r'=.*$',re.M)
 if pat.search(raw):raw=pat.sub(lambda _: k+'='+v,raw)
 else:raw+='\n'+k+'='+v
raw=raw.replace('DATABASE_URL=postgres://rakazo:rakazo@127.0.0.1:5433/rakazo','DATABASE_URL=postgres://rakazo:'+updates['POSTGRES_PASSWORD']+'@postgres:5432/rakazo')
env.write_text(raw)
env.chmod(0o600)
print('Created secure local Rakazo env; secrets not displayed')

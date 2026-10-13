from pathlib import Path
import os, secrets, shutil
repo=Path('/mnt/c/Labs/mybotdemo01'); runtime=Path('/root/botteam-rakazo')
demo=runtime/'demo-acct'; demo.mkdir(exist_ok=True)
shutil.copy2(repo/'botadmin/demo-acct/server.mjs',demo/'server.mjs')
token=demo/'token'
if not token.exists(): token.write_text(secrets.token_hex(24)+'\n')
os.chown(demo,1000,1000)
for p in demo.iterdir():
 if p.is_file(): os.chown(p,1000,1000)
token.chmod(0o600)
hotfix=runtime/'hotfix'; hotfix.mkdir(exist_ok=True)
for name in ['web-ssrf.ts','keyless-http-web.ts','undici-fetch.ts','remote-mcp.ts']:
 shutil.copy2(repo/'rakazo/hotfix'/name,hotfix/name)
shutil.copy2(repo/'rakazo/minidev.override.yml',runtime/'docker-compose.override.yml')
print('Demo accounting and v0.1.6 compatibility fixes installed; credentials omitted')

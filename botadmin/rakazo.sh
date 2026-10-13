#!/bin/bash
# BotTeam's isolated native-WSL stack. Never stop the separate BotPress/Rakazo stack.
set -euo pipefail
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "${BOTTEAM_RAKAZO_HOME:-$HOME/botteam-rakazo}" || { echo 'ERR BotTeam runtime missing'; exit 1; }
FILES=(-f docker-compose.images.yml)
[ ! -f docker-compose.override.yml ] || FILES+=(-f docker-compose.override.yml)
dc() { docker compose -p botteam --env-file .env "${FILES[@]}" "$@"; }
case "${1:-status}" in
  status)
    if pgrep -fx 'sleep infinity' >/dev/null; then echo 'KEEPALIVE 1'; else echo 'KEEPALIVE 0'; fi
    docker ps -a --filter label=com.docker.compose.project=botteam --format 'C {{json .}}'
    ids=$(docker ps -q --filter label=com.docker.compose.project=botteam)
    [ -z "$ids" ] || docker stats --no-stream --format 'S {{json .}}' $ids
    ;;
  start) dc up -d --wait --wait-timeout 180 ;;
  stop) dc stop ;;
  logs) dc logs --no-color --tail 100 "${2:-api}" ;;
  backup)
    d="$ROOT/backups/botteam-$(date +%Y%m%d-%H%M%S)"; mkdir -p "$d"
    docker exec botteam-postgres-1 pg_dump -U rakazo -d rakazo -Fc > "$d/rakazo.dump"
    docker run --rm -v botteam_appdata:/data:ro -v "$d":/out busybox:1 tar czf /out/appdata.tgz -C /data .
    [ ! -d demo-acct ] || tar czf "$d/demo-acct.tgz" demo-acct
    echo "OK $d"
    ;;
  *) echo 'usage: rakazo.sh status|start|stop|logs [service]|backup'; exit 2 ;;
esac

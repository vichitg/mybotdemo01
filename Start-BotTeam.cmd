@echo off
setlocal
cd /d "%~dp0"
powershell.exe -NoProfile -ExecutionPolicy Bypass -File "%~dp0botteam.ps1" start
if errorlevel 1 (
  echo Startup failed. Review the logs folder.
  pause
  exit /b 1
)
start "" "http://127.0.0.1:3300"
endlocal

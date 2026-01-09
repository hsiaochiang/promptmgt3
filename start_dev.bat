@echo off
echo Starting WOS Development Environment...

REM Start Server
start "WOS Server" cmd /k "cd apps/server && npm run dev"

REM Start Web Client
start "WOS Web" cmd /k "cd apps/web && npm run dev"

REM Start Browser Extension (Watch Mode)
start "WOS Extension" cmd /k "cd apps/browser-extension && npm run build -- --watch"

echo All services started!

@echo off
echo Starting Antigravity Agent (Auto-Approval Mode)...
echo Flags: --allow-all-tools --allow-all-paths

type PROMPT.txt | copilot --allow-all-tools --allow-all-paths --model gpt-5.1-codex-max --continue

pause

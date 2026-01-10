We're going to be using slash command from `.github\prompts\`

## 核心協議 (Core Protocols)

> **Invariant Rule**: All user-facing interaction, documentation (tasks/plans), and git commit messages **MUST** be in **Traditional Chinese (zh-TW)**. English is allowed only for code variable names and technical terms.

> **Execution Protocol**: 
> 1. **Auto-Run**: Non-destructive commands (read, build, test, `git add`, `git commit`) are executed automatically (`SafeToAutoRun: true`).
> 2. **Approval Required**: Destructive or remote commands (`git push`, `rm -rf`, deployment) require explicit user approval (`SafeToAutoRun: false`).

- Preferred language: Traditional Chinese (zh-TW).
- When interacting in the CLI, explanations, summaries, and comments should be written in Traditional Chinese, unless the user explicitly requests English or the source document is English-only.
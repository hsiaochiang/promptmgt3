# Tech Stack
- VS Code Extension: TypeScript
- VS Code APIs: commands, workspace.fs, FileSystemWatcher, QuickPick/InputBox
- YAML parsing: yaml
- Validation: zod
- Optional suggestion integration:
  - Mode A（優先）：產生可貼給 Copilot/Codex 的指令模板 → 解析回傳 YAML/JSON → 套用
  - Mode B（可選）：呼叫 Local Server /api/ai/suggest（Reference: `research.md`）

# Architecture
## Dependency Rule
- 只依賴 `packages/contracts`（frontmatter schema、命名規則、tag categories）
- 只操作檔案與屬性；不依賴 Web UI
- 由主系統的檔案監聽機制讓 UI 自動更新（extension 不必負責通知 UI）

## Modules
- Contracts Client: 讀取 contracts 定義（schema/version）
- Archive Engine: move/rename/update-frontmatter + conflict handling
- Suggestion Engine: prompt template generator + parser/validator
- UI Layer: 選專案/狀態/優先級/標籤；預覽變更摘要

## Integration Points
- File operations only（搬移/改名/更新 frontmatter）
- Optional: 呼叫 Local Server 取得 projects/tags dictionary（若不做，則掃描資料根目錄建立清單）

# Database Design
- No DB
- Optional local cache（globalState）:
  - lastSelectedProject
  - recentTags
  - lastSuggestionFormatVersion

# 3rd Party Libraries
- yaml
- zod
- fast-glob（掃描 inbox/projects）
- nanoid/uuid（可選）

# Implementation Steps
1. Bootstrap：設定/選擇資料根目錄（或讀取設定檔）
2. Scan & QuickPick：列出 inbox items、projects、tags
3. Frontmatter read/write：解析與更新欄位（嚴格符合 contracts）
4. Archive Engine：
   - compute target path
   - handle conflicts（suffix strategy）
   - move file + update metadata
5. Suggestion Mode A：
   - generate prompt template
   - parse returned YAML/JSON
   - validate & apply
6. Undo strategy：
   - keep last operation record (sourcePath, targetPath, previousFrontmatter)
   - command: Undo Last Archive
7. Error UX：
   - missing root / invalid frontmatter / conflict prompts

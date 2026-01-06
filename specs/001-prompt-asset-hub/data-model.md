# data-model.md — 檔案為核心的提示詞資產管理主系統

## File Mapping（實體 → 檔案/目錄）

> 原則：磁碟檔案是唯一權威；任何 UI 顯示所需資料都必須可由掃描檔案重建。

- Workspace
	- 權威設定檔：`<rootPath>/.pah/workspace.json`（tagsDict/commonOptions/backup 等）
	- 事件紀錄（append-only）：`<rootPath>/.pah/events/<YYYY-MM>.ndjson`
- Project
	- `projects/<projectSlug>/project.md`（frontmatter + markdown body）
	- `projects/<projectSlug>/prompts/`（該專案底下 prompts）
- Prompt
	- `projects/<projectSlug>/prompts/<promptSlug>.md`（frontmatter + markdown body）
- InboxItem
	- `inbox/<inboxId>.md`（frontmatter + rawContent/cleaned content）
- Snippet
	- `snippets/<category>/<snippetId>.md`
- Attachment
	- `<attachmentPath>/<entityType>/<entityId>/<filename>`（避免同名覆蓋；快照/版本需完整複製）
- VersionEvent
	- 以事件檔（ndjson）為權威記錄；快照/版本本體由 `snapshotPath` 指向
- SearchIndex（MVP in-memory / cache）
	- 非權威 cache：`<rootPath>/.pah/cache/search-index.json`（可刪除、可重建）

- Trash（回收站 / soft delete）
	- 位置：`<rootPath>/.pah/trash/`
	- 每筆回收站項目：`<rootPath>/.pah/trash/items/<trashId>/`
		- `manifest.json`：trashId、entityType、entityId、deletedAt、purgeAfter、originalRelativePath、attachmentsMoved、sizeBytes、errors
		- `root/`：被刪除實體的原始相對路徑檔案（例如 `projects/<projectSlug>/prompts/<promptSlug>.md`）
		- `attachments/`：被刪除實體對應的附件資料夾鏡像（`<entityType>/<entityId>/...`）

## 實體與欄位

### Frontmatter Schema（欄位規格：必填/選填/預設、id vs slug）

#### 通用欄位

- id（必填）：uuid，建立後不可變（所有引用以 id 為準）
- slug（必填）：路徑友善字串，用於檔名/目錄；可變更（改名等同檔案 rename），需在同 scope 內唯一
- createdAt（必填）：datetime
- updatedAt（必填）：datetime
- archived（選填，預設 false）：boolean

> 註：檔案路徑使用 slug，但跨檔關聯使用 id；slug 變更不影響引用。

#### Project frontmatter（建議）

- id（必填）
- slug（必填）
- title（必填）
- summary（選填，預設 ""）
- status（選填，預設 "planning"）
- type（選填，預設 ""）
- tags（選填，預設 []）
- archived（選填，預設 false）
- createdAt（必填）
- updatedAt（必填）

#### Prompt frontmatter（建議）

- id（必填）
- slug（必填）
- projectId（必填）：指向 Project.id
- title（必填）
- status（選填，預設 "draft"）
- priority（選填，預設 "P1"）
- tags（選填，預設 []）
- sourceLink（選填）
- notes（選填，預設 ""）
- archived（選填，預設 false）
- createdAt（必填）
- updatedAt（必填）

#### InboxItem frontmatter（建議）

- id（必填）
- title（必填）
- sourcePlatform（選填）
- sourceLink（選填）
- importedAt（必填）
- cleanedState（選填，預設 "unprocessed"）
- suggestedTarget（選填）：見 InboxItem.suggestedTarget（引用型）
- suggestedTags（選填，預設 []）
- notes（選填，預設 ""）

### Workspace
- id (uuid)
- rootPath (string)
- attachmentPath (string)
- tagsDict (map: category -> tags)
- commonOptions (e.g., models/sources)
- backup: { dailySnapshot: boolean, schedule: time, remote?: string }
	- remote：保留欄位，用於未來遠端備份目的地/端點設定；目前僅保存設定值，不影響系統行為。
- trashRetentionDays: number（預設 30；到期自動清理回收站）
- integrations: { authInfo?: string }
- updatedAt (datetime)

### TrashItem
- trashId (uuid)
- entityType (enum: project|prompt|inboxItem|snippet|unknown)
- entityId (string)
- deletedAt (datetime)
- purgeAfter (datetime)
- originalRelativePath (string)
- titleSnapshot (string, optional)
- attachmentsMoved (boolean)
- sizeBytes (number, optional)
- errors (string[])

### TrashPolicy
- retentionDays (number, default 30)
- deleteSemantics: 'soft-delete'
- restoreConflictStrategy (enum: block|overwrite|rename)

### Project
- id (uuid)
- slug (string)
- title (string)
- summary (string)
- description (string)
- status (enum: planning/in-progress/paused/done)
- type (string)
- tags (string[])
- attachments (AttachmentRef[])
- relatedFiles (path[])
- archived (boolean)
- updatedAt (datetime)

### Prompt
- id (uuid)
- slug (string)
- projectId (string)
- title (string)
- status (enum: draft/tuning/ready/disabled)
- priority (enum: P0/P1/P2)
- tags (string[])
- sourceLink (string)
- notes (string)
- body (markdown)
- attachments (AttachmentRef[])
- updatedAt (datetime)
- archived (boolean)

### Snippet
- id (uuid)
- title (string)
- category (enum: role/format/constraint/style/uncategorized)
- content (string)
- lastUsedAt (datetime)

### InboxItem
- id (uuid)
- title (string)
- sourcePlatform (string)
- sourceLink (string)
- importedAt (datetime)
- rawContent (string)
- cleanedState (enum: unprocessed/cleaned/archived)
- suggestedTarget ({ projectId?: string; promptId?: string; pathHint?: string } optional)
- suggestedTags (string[])
- notes (string)

### Attachment
- id (uuid)
- filename (string)
- mimeType (string)
- origin (string)
- storagePath (string)
- linkedTo (Project|Prompt|InboxItem)
- createdAt (datetime)

### VersionEvent
- id (uuid)
- type (enum: import/archive/delete/daily-snapshot/manual-backup/version-node)
- scope (Workspace|Project|Prompt|InboxItem)
- message (string)
- createdAt (datetime)
- snapshotPath (string)

#### Snapshot Layout + Retention Policy

- Snapshot Layout（snapshotPath 指向的目錄內容）
	- `manifest.json`：snapshotId、type、scope、createdAt、counts、errors
	- `root/`：資料根目錄鏡像（不含 `.pah/` 與非權威 cache）
	- `attachments/`：附件目錄鏡像（完整複本）

- Retention Policy（保留策略，具體值可設定）
	- daily snapshot：保留最近 30 天
	- manual/version node：每實體保留最近 50 個或最近 90 天（以較大者為準）
	- `pinned=true`：永不自動刪除
	- 空間不足時：先清理最舊且未 pinned 的 daily snapshot，再清理最舊未 pinned 的 version node

### SearchIndex (MVP in-memory)
- id (uuid)
- entityType (Project|Prompt|InboxItem)
- refId (string)
- title (string)
- tags (string[])
- bodyExcerpt (string)
- updatedAt (datetime)

## 關聯與約束
- Project 1 - n Prompt
- Workspace 1 - n Tag definitions
- Attachment 可連結 Project/Prompt/InboxItem；快照需複製附件實體與檔案
- VersionEvent 可指向任意實體，保存快照路徑
- InboxItem 不直接變更為 Project/Prompt；歸檔由外部工具處理，僅維持清理狀態

## 驗證規則
- Path 權限：rootPath/attachmentPath 必須可讀寫；否則阻擋保存/附件操作
- Autosave debounce：1–2 秒內去重同檔寫入
- 附件命名：避免覆蓋；若同名則自動加 suffix
- Snapshot：若附件缺失則標記錯誤並允許重試
- Search Index：重建時需跳過無法解析的檔案並記錄錯誤

## 狀態轉換（摘要）
- Prompt.status: draft → tuning → ready → disabled；封存不改 status，但 archived=true
- Project.status: planning → in-progress → paused/done；封存設定 archived=true
- InboxItem.cleanedState: unprocessed → cleaned → archived（但不觸發歸檔寫入）
- VersionEvent: 每次版本/快照新增一筆，無更新/刪除；刪除時保留歷史紀錄條目

- Delete / Restore（回收站）
	- Active（在 rootPath 內可被掃描）→ Trashed（移至 `.pah/trash/items/<trashId>/`）
	- Trashed → Restored（搬回 originalRelativePath；若衝突則回報並由 UI 選擇覆蓋/改名/取消）
	- Trashed → Purged（永久刪除；需明確確認；若失敗需可重試且不得造成無提示的不一致）

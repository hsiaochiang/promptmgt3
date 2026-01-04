# data-model.md — 檔案為核心的提示詞資產管理主系統

## 實體與欄位

### Workspace
- id (uuid)
- rootPath (string)
- attachmentPath (string)
- tagsDict (map: category -> tags)
- commonOptions (e.g., models/sources)
- backupSettings: { dailySnapshot: boolean, schedule: time, remote?: string }
- integrations: { authInfo?: string }
- updatedAt (datetime)

### Project
- id (uuid/slug)
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
- id (uuid/slug)
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
- suggestedTarget (Project|Prompt optional)
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

# Persistence Policy (INV-003 Compliance)

## Authority: File System First

本系統遵循「檔案系統為權威來源」原則（INV-003）。所有權威狀態必須可從檔案系統重建，不得僅存在於前端 store 或 localStorage。

## Allowed Persistent State (White List)

### ✅ Permitted: Display Preferences Only

以下狀態可安全存於 `localStorage`，因為它們僅為「純展示偏好」，不影響資料權威性：

1. **視圖模式** (`viewMode`)
   - 例如：list、grid、compact
   - 預設值：list
   - 儲存鍵：`pah.ui.viewMode`

2. **欄位寬度** (`columnWidths`)
   - 表格/列表中各欄位的使用者調整寬度
   - 預設值：根據 UI 設計系統的標準寬度
   - 儲存鍵：`pah.ui.columnWidths`

3. **側邊欄展開狀態** (`sidebarExpanded`)
   - 側邊欄是否展開/收合
   - 預設值：true
   - 儲存鍵：`pah.ui.sidebarExpanded`

4. **主題偏好** (`theme`)
   - light / dark / system
   - 預設值：system
   - 儲存鍵：`pah.ui.theme`

5. **排序偏好** (`sortPreference`)
   - 使用者上次選擇的排序方式（但實際資料仍從 API 取得）
   - 預設值：updatedAt-desc
   - 儲存鍵：`pah.ui.sortPreference`

### ❌ Prohibited: Authoritative State

以下狀態**絕對禁止**僅存於前端：

1. **Project/Prompt 中繼資料** (tags, status, priority, etc.)
   - ✅ 必須存於 frontmatter
   - ❌ 不得僅存於 React state 或 localStorage

2. **檔案內容** (正文、附件)
   - ✅ 必須存於檔案系統
   - ❌ 不得僅存於前端 cache/store

3. **Inbox 項目** (suggestedTarget, notes)
   - ✅ 必須存於 .pah/inbox/*.md
   - ❌ 不得僅存於前端

4. **工作區設定** (rootPath, attachmentPath, backup settings)
   - ✅ 必須存於 .pah/workspace.json
   - ❌ 不得僅存於前端

5. **快照/版本歷史**
   - ✅ 必須存於 .pah/snapshots/* 與 .pah/versions/*
   - ❌ 不得僅存於前端記錄

## Verification Checklist

### 開發時檢查

- [ ] 新增任何前端 state 時，確認該狀態是否為「純展示偏好」
- [ ] 若為權威狀態，必須有對應的 API 與檔案系統持久化
- localStorage 使用限於上述白名單項目

### 測試驗證

- [ ] 整合測試：重啟後可從檔案系統完整重建所有權威狀態
- [ ] 單元測試：前端 UI preferences 有預設值，即使 localStorage 清空仍可運作
- [ ] 回歸測試：定期檢查無新增未經授權的 localStorage 使用

## Implementation Notes

- 所有允許的 localStorage 鍵必須使用 `pah.ui.*` 前綴
- 每個 UI preference 必須有合理的預設值
- 前端元件在讀取 localStorage 時必須處理 null/undefined 情況
- 檔案掃描/重建邏輯必須能完整恢復所有權威狀態

## Compliance Test

參見 `tests/integration/persistence-compliance.spec.ts` 以驗證此政策實施。

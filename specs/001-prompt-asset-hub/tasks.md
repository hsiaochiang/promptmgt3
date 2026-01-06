---

description: "Task list: 001-prompt-asset-hub"
---

# Tasks: 檔案為核心的提示詞資產管理主系統

**Input**: 設計文件來源 `specs/001-prompt-asset-hub/`

必讀：
1. `spec.md`（User Stories + Requirements）
2. `plan.md`（Tech stack + monorepo 結構 + gate）

可用補充：
1. `research.md`（決策：回收站/衝突/retention）
2. `data-model.md`（檔案佈局：`.pah/trash/items/<trashId>/...`）
3. `contracts/openapi.yaml`（REST 合約）
4. `quickstart.md`（驗收路徑）

<!-- Language requirement: Tasks and user-facing documentation MUST be written in Traditional Chinese (zh-TW). -->

## Checklist Format（嚴格）

所有任務必須使用以下格式（且只有任務行使用 checkbox）：

`- [ ] T### [P] [US#] 任務描述（包含檔案路徑）`

規則：
1. checkbox 必須是 `- [ ]`（不要用 `[x]` / `[X]`）
2. TaskID 必須連號（T001, T002, ...）且依執行順序排列
3. `[P]` 只在「可平行、低衝突（不同檔案/無未完成依賴）」時標記
4. User Story phase 的任務必須標記 `[US1]`/`[US2]`/`[US3]`/`[US4]`
5. Setup / Foundational / Polish phase 的任務不加 `[US#]`
6. 每個任務描述必須包含明確檔案路徑（新增檔也要寫出目標路徑）

## Path Conventions（本專案）

- Server：`apps/server/src/**`
- Web：`apps/web/src/**`
- Shared Contracts：`packages/contracts/src/**`
- Tests：`tests/{contract,integration,unit}/**`

## Phase 1: Setup（共享基礎）

目標：確保 monorepo 的啟動/測試腳本、型別設定、開發體驗符合 plan.md。

- [x] T001 確認根目錄腳本與工作區命令一致（dev/web/server/test）於 `package.json`
- [x] T002 [P] 對齊 TypeScript 專案參考與 strict 設定（root + apps + packages），並修正「編譯輸出覆寫輸入」類問題（排除 `apps/**/dist/**`、`apps/web/postcss.config.js`、`apps/web/tailwind.config.js` 等非 TS 輸入；root 設為 noEmit 或改用 project references）；更新於 `tsconfig.json`、`apps/server/tsconfig.json`、`apps/web/tsconfig.json`、`packages/contracts/tsconfig.json`（驗收：`npm run type-check` 或 `tsc -b` 無 overwrite input 錯誤）
- [x] T003 [P] 補齊開發環境說明與 smoke steps 於 `specs/001-prompt-asset-hub/quickstart.md`
- [x] T004 [P] 建立最小端到端啟動檢查（server health + web render）於 `tests/integration/smoke.spec.ts`

---

## Phase 2: Foundational（BLOCKING：Contracts-first + Workspace/Settings 基礎）

目標：在任何 user story 前，先把「契約/設定/路徑與權限」打成穩固地基（符合 constitution 的 contracts-first gate）。

- [x] T005 [P] 新增 Workspace Settings DTO + zod schema 於 `packages/contracts/src/dto/workspace.ts`（包含 `trashRetentionDays`）
- [x] T006 [P] 新增 Trash DTO + zod schema 於 `packages/contracts/src/dto/trash.ts`（TrashItem/TrashListResponse/TrashRestoreRequest/TrashRestoreResult/RestoreConflict）
- [x] T007 [P] 匯出新 DTO（workspace/trash）於 `packages/contracts/src/dto/index.ts` 與 `packages/contracts/src/index.ts`
- [x] T008 [P] 更新/對齊 OpenAPI contract sanity checks（涵蓋 trash endpoints + Settings.trashRetentionDays）於 `tests/contract/openapi.spec.ts`
- [x] T009 [P] 新增 Trash DTO contract tests（valid/invalid）於 `tests/contract/trash-dto.spec.ts`
- [x] T010 更新後端 workspace 設定型別與預設值（加入 `trashRetentionDays: 30`）於 `apps/server/src/routes/workspace.ts`
- [x] T011 更新前端設定頁顯示/編輯 trash retention days 於 `apps/web/src/features/settings/SettingsView.tsx`
- [x] T012 [P] 新增設定頁整合測試（含路徑權限 + trashRetentionDays roundtrip）於 `tests/integration/settings-page.spec.ts`

**Checkpoint**：contracts + Settings + integration test 基礎可跑，才進入 US1。

---

## Phase 3: User Story 1（Priority: P1）— 專案/提示詞管理 + 自動保存 + 回收站（MVP）

**Goal**：完成 Project/Prompt 的建立/編輯/封存/刪除（刪除=回收站可復原），並在 Detail Panel 內 autosave（≤2s）且提供一致回饋（UI-004）。

**Independent Test Criteria**（可獨立驗收）：
1. 在乾淨的 rootPath 建立 project + prompt，編輯正文/中繼資料，停筆 ≤2s 顯示保存成功。
2. 刪除 prompt/project 後出現在回收站；可復原；若目的地衝突必須阻擋並提供「覆蓋/改名/取消」。
3. 永久刪除需二次確認且不可復原；失敗需可理解錯誤與可重試。

### Tests（US1）

- [ ] T013 [P] [US1] 擴充 Project/Prompt CRUD contract tests（含 delete=trash 回傳 TrashItem）於 `tests/contract/api-project-prompt.spec.ts`
- [ ] T014 [P] [US1] 新增 Trash endpoints contract tests（list/purge/restore + 409 conflict）於 `tests/contract/api-trash.spec.ts`
- [ ] T015 [P] [US1] 新增回收站整合測試（delete→list→restore→purge）於 `tests/integration/trash-flow.spec.ts`
- [ ] T016 [P] [US1] 新增復原衝突整合測試（409 + overwrite/rename 路徑）於 `tests/integration/trash-restore-conflict.spec.ts`
- [ ] T017 [P] [US1] 新增回收站清理整合測試（到期 purge + 失敗可重試）於 `tests/integration/trash-retention.spec.ts`
- [ ] T018 [P] [US1] 擴充 autosave 成功/失敗路徑整合測試於 `tests/integration/autosave-success.spec.ts`、`tests/integration/autosave-failure.spec.ts`

### Implementation（US1）

- [ ] T019 [P] [US1] 擴充 FS layout：trash 路徑 helpers 於 `apps/server/src/fs-layout/index.ts`（`.pah/trash/items/<trashId>/...`）
- [ ] T020 [P] [US1] 實作 trash 存放與 manifest 寫入（含 attachments 搬移）於 `apps/server/src/trash/trashStore.ts`
- [ ] T021 [P] [US1] 實作 trash 列表查詢（q/entityType/page/perPage）於 `apps/server/src/trash/listTrash.ts`
- [ ] T022 [P] [US1] 實作 trash 永久刪除（purge）於 `apps/server/src/trash/purgeTrash.ts`
- [ ] T023 [P] [US1] 新增回收站 retention 清理工作（依 `trashRetentionDays`；server 啟動一次 + 每日固定時間）於 `apps/server/src/trash/retention.ts`
- [ ] T024 [P] [US1] 實作 trash 復原（restore：overwrite/rename；衝突回傳 409 + RestoreConflict）於 `apps/server/src/trash/restoreTrash.ts`
- [ ] T025 [US1] 新增 trash routes 並註冊於 server（GET/DELETE/POST restore）於 `apps/server/src/routes/trash.ts`、`apps/server/src/index.ts`
- [ ] T026 [US1] 修改 Project delete：由 archived=true 改為 soft delete → TrashItem 於 `apps/server/src/routes/entities.ts`
- [ ] T027 [US1] 修改 Prompt delete：由 archived=true 改為 soft delete → TrashItem 於 `apps/server/src/routes/entities.ts`
- [ ] T028 [P] [US1] 新增附件搬移 helper（entity attachments dir move）於 `apps/server/src/trash/moveAttachments.ts`
- [ ] T029 [P] [US1] 新增回收站 UI 資料層 client（fetch list/restore/purge）於 `apps/web/src/features/trash/api.ts`
- [ ] T030 [P] [US1] 新增回收站視圖（搜尋/篩選、復原、永久刪除）於 `apps/web/src/features/trash/TrashView.tsx`
- [ ] T031 [US1] Sidebar 加入「回收站」入口與 section 型別 於 `apps/web/src/layout/Sidebar.tsx`、`apps/web/src/layout/MainContent.tsx`
- [ ] T032 [US1] 回收站復原衝突互動（overwrite/rename/取消）於 `apps/web/src/features/trash/RestoreConflictDialog.tsx`
- [ ] T033 [US1] Detail Panel 增加「封存/刪除」入口（封存=更新 archived；刪除=呼叫 trash delete）於 `apps/web/src/layout/DetailPanel.tsx`
- [ ] T034 [P] [US1] 實作檔案讀寫 API（支援 autosave）於 `apps/server/src/routes/files.ts`
- [ ] T035 [P] [US1] 實作附件上傳 API（multipart；回傳 storagePath）於 `apps/server/src/routes/attachments.ts`
- [ ] T036 [US1] 前端 MarkdownEditor 支援拖曳/貼上附件並插入引用（呼叫 attachments API）於 `apps/web/src/components/MarkdownEditor.tsx`

**Checkpoint**：US1 全測試通過且 quickstart 的回收站流程可操作。

---

## Phase 4: User Story 2（Priority: P2）— 視圖切換 + 搜尋/篩選 + 即時同步（含外部修改衝突）

**Goal**：列表/看板切換不改變資料集合；提供搜尋/篩選；外部檔案異動時 UI 有一致回饋並可處置衝突。

**Independent Test Criteria**：建立多筆 prompts 後可切換列表/看板、搜尋/篩選；模擬外部修改同檔後，UI 進入 conflict 並可「重新整理/覆寫」。

### Tests（US2）

- [ ] T037 [P] [US2] 擴充搜尋 API contract tests（SearchRequest/SearchResponse）於 `tests/contract/api-search.spec.ts`
- [ ] T038 [P] [US2] 擴充 WS payload contract tests（file.changed / sync.status）於 `tests/contract/ws-sync.spec.ts`
- [ ] T039 [P] [US2] 擴充列表/看板切換一致性整合測試於 `tests/integration/view-toggle-consistency.spec.ts`
- [ ] T040 [P] [US2] 擴充外部修改衝突整合測試（重新整理/覆寫）於 `tests/integration/conflict-resolution.spec.ts`

### Implementation（US2）

- [ ] T041 [P] [US2] 後端：chokidar watcher 推播 file.changed（忽略 `.pah/**`）於 `apps/server/src/watch/fileWatcher.ts`
- [ ] T042 [US2] 後端：搜尋端點與索引快取（MVP）於 `apps/server/src/routes/search.ts`、`apps/server/src/search/index.ts`
- [ ] T043 [P] [US2] 前端：搜尋輸入與條件保存（無結果 empty state）於 `apps/web/src/layout/MainContent.tsx`
- [ ] T044 [P] [US2] 前端：看板視圖（與列表共享同一集合）於 `apps/web/src/features/library/ListView.tsx`
- [ ] T045 [US2] 前端：衝突橫幅與處置互動（refresh/overwrite/copy unsaved）於 `apps/web/src/features/conflict/ConflictBanner.tsx`、`apps/web/src/layout/DetailPanel.tsx`
- [ ] T046 [P] [US2] 前端：WS client + sync 狀態顯示於 `apps/web/src/features/sync/SyncProvider.tsx`
- [ ] T047 [P] [US2] 整合回饋時延 SLA（互動後 200ms 內可見 loading/狀態）於 `tests/integration/feedback-latency.spec.ts`

---

## Phase 5: User Story 3（Priority: P3）— 版本備份與歷史檢視

**Goal**：可建立版本節點、每日快照與立即備份；歷史列表可檢視並開啟舊版內容；符合附件完整複本與 SC-003 量測定義。

**Independent Test Criteria**：對單一 prompt 建立多次版本/快照；驗證 manifest/root/attachments layout 與 retention；可從 UI 開啟舊版內容。

### Tests（US3）

- [ ] T048 [P] [US3] 擴充 snapshot/version contract tests（manifest shape）於 `tests/contract/api-snapshot-version.spec.ts`
- [ ] T049 [P] [US3] 擴充 snapshot layout 整合測試（manifest/root/attachments）於 `tests/integration/snapshot-layout.spec.ts`
- [ ] T050 [P] [US3] 擴充 retention 整合測試（含 pinned）於 `tests/integration/retention-policy.spec.ts`

### Implementation（US3）

- [ ] T051 [P] [US3] 後端：snapshot service（daily + manual）於 `apps/server/src/backup/snapshot.ts`
- [ ] T052 [P] [US3] 後端：version node service（entity scope）於 `apps/server/src/backup/version-node/index.ts`
- [ ] T053 [P] [US3] 後端：retention 清理策略於 `apps/server/src/backup/retention.ts`
- [ ] T054 [US3] 後端：routes 對齊 OpenAPI（snapshots/versions）於 `apps/server/src/routes/snapshots.ts`、`specs/001-prompt-asset-hub/contracts/openapi.yaml`
- [ ] T055 [P] [US3] 前端：HistoryView（列表 + 檢視 + 建立快照/版本）於 `apps/web/src/features/history/HistoryView.tsx`

---

## Phase 6: User Story 4（Priority: P3）— 暫存區檢視與簡修

**Goal**：顯示 InboxItem 並允許最小幅度編修（標題/註記/刪減）；清楚提示「歸檔由外部工具處理」。

**Independent Test Criteria**：建立多筆 inbox 檔案後可在 UI 編修並保存；重啟後可由掃描重建。

### Tests（US4）

- [ ] T056 [P] [US4] 擴充 inbox contract tests 於 `tests/contract/api-inbox.spec.ts`
- [ ] T057 [P] [US4] 擴充 inbox 可用性/延遲整合測試於 `tests/integration/inbox-usability.spec.ts`

### Implementation（US4）

- [ ] T058 [US4] 後端：Inbox routes（讀取 + 簡修更新）於 `apps/server/src/routes/inbox.ts`
- [ ] T059 [P] [US4] 前端：InboxView（列表 + 最小編修）於 `apps/web/src/features/inbox/InboxView.tsx`

---

## Phase 7: Polish & Cross-Cutting Concerns

目標：把 constitution gates（UI regression evidence、效能基準、契約一致性）落地為可重跑的工件。

- [ ] T060 [P] 建立/更新 UI regression checklist 與 evidence 準備 於 `specs/001-prompt-asset-hub/checklists/ui-regression.md`
- [ ] T061 完成 UI 對照驗收（對照 golden reference）並記錄 evidence 於 `0resource/ui_prototype_v3.jsx`
- [ ] T062 [P] 新增效能基準（掃描/搜尋/快照/回收站 list）於 `tests/integration/benchmarks/benchmarks.spec.ts`
- [ ] T063 [P] 強化 OpenAPI contract tests：確認所有實作 routes 都在 spec 中（避免漂移）於 `tests/contract/openapi.spec.ts`
- [ ] T064 [P] 更新 quickstart 驗收流程（含回收站/衝突/retention）於 `specs/001-prompt-asset-hub/quickstart.md`

### Settings（補齊 FR-009 範圍）

- [x] T065 [P] Contracts：擴充 Workspace Settings DTO + zod schema（`tagsDict`, `commonOptions`, `backup`）並更新匯出於 `packages/contracts/src/dto/workspace.ts`、`packages/contracts/src/dto/index.ts`（驗收：`tests/contract/workspace-settings-dto.spec.ts` 覆蓋新欄位）
- [ ] T066 [P] Web UI：SettingsView 支援 tagsDict CRUD（新增/改名/刪除）與最小合併策略（rename 視為 merge）於 `apps/web/src/features/settings/SettingsView.tsx`（驗收：可在 UI 操作並觸發 settings 更新）
- [ ] T067 [P] Web UI：SettingsView 支援 commonOptions 編輯（新增/刪除/去重）於 `apps/web/src/features/settings/SettingsView.tsx`（驗收：refresh 後仍保留）
- [ ] T068 [P] Web UI：SettingsView 支援 backup 編輯（至少 dailySnapshot + schedule 字串）於 `apps/web/src/features/settings/SettingsView.tsx`（驗收：invalid schedule 顯示錯誤）
- [ ] T069 Server：workspace settings 更新與驗證（對 tagsDict/commonOptions/backup 做 schema 驗證、預設值與向後相容）於 `apps/server/src/routes/workspace.ts`
- [ ] T070 [P] Integration：擴充設定頁整合測試矩陣（tagsDict rename/merge、commonOptions 去重、backup roundtrip、invalid input）於 `tests/integration/settings-page.spec.ts`
- [ ] T071 [P] Contract：擴充/對齊 workspace permissions contract tests（GET `/api/workspace/permissions`；success + missing path 400 + error format）於 `tests/contract/api-workspace-permissions.spec.ts`

---

## Dependencies & Execution Order

Phase 依賴：
1. Phase 1（Setup）→ Phase 2（Foundational）為所有故事的前置
2. US1（P1）為 MVP；完成後 US2/US3/US4 可平行推進

User Story 依賴圖（建議順序）：
1. US1 → US2 → US3
2. US4 可在 US1 後平行

## Parallel Execution Examples（每個故事）

US1 可平行：
1. 後端 trash store/routes（T019–T027）與前端 TrashView/Sidebar（T029–T032）可平行
2. autosave/failure tests（T018）可與 trash tests（T015–T017）平行

US2 可平行：
1. watcher（T041）與搜尋（T042）可平行
2. 前端 WS client（T046）與 UI 切換/搜尋（T043–T044）可平行

US3 可平行：
1. snapshot/version/retention services（T051–T053）可平行
2. UI HistoryView（T055）可在 API contract 穩定後開始

US4 可平行：
1. 後端 inbox routes（T058）與前端 InboxView（T059）可平行

## Implementation Strategy

MVP（只做 US1）：
1. 完成 Phase 1 + Phase 2
2. 完成 US1（含回收站 delete/restore/purge、衝突處置、retention 設定欄位）
3. 跑 quickstart 驗收流程（`specs/001-prompt-asset-hub/quickstart.md`）與 US1 測試組

增量交付：US1 → US2 → US3/US4，最後做 Phase 7 gates。

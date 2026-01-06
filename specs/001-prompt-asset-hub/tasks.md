---

description: "任務清單：001-prompt-asset-hub"
---

# Tasks: 檔案為核心的提示詞資產管理主系統

**Language**: zh-TW（繁體中文）

**輸入**：設計文件來源 `specs/001-prompt-asset-hub/`

必讀：
- `spec.md`（使用者故事 + 需求 + 測試要求；必讀）
- `plan.md`（技術堆疊 + monorepo 結構 + 憲法 Gate）

可用補充：
- `research.md`（決策：trash/衝突/retention/snippets 路徑）
- `data-model.md`（檔案佈局與 enum）
- `contracts/openapi.yaml`（REST 合約）
- `quickstart.md`（驗收路徑）

<!-- Language requirement: Tasks and user-facing documentation MUST be written in Traditional Chinese (zh-TW). -->

## 清單格式（嚴格）

所有任務必須使用以下格式（且只有任務行使用 checkbox）：

`- [ ] T### [P] [US#] 任務描述（包含檔案路徑）`

規則：
1. checkbox 必須是 `- [ ]` 或 `- [x]`
2. TaskID 必須連號（T001, T002, ...）且依執行順序排列
3. `[P]` 只在「可平行、低衝突（不同檔案/無未完成依賴）」時標記
4. User Story phase 的任務必須標記 `[US1]`/`[US2]`/`[US3]`/`[US4]`
5. Setup / Foundational / Polish phase 的任務不加 `[US#]`
6. 每個任務描述必須包含明確檔案路徑（新增檔也要寫出目標路徑）

## 路徑慣例（本專案）

- Server：`apps/server/src/**`
- Web：`apps/web/src/**`
- Shared Contracts：`packages/contracts/src/**`
- Tests：`tests/{contract,integration,unit}/**`

---

## Phase 1：準備（共享基礎）

目標：確保 monorepo 的啟動/測試/型別檢查可重跑，並與 `quickstart.md` 一致。

- [x] T001 對齊 monorepo scripts（dev:server/dev:web/type-check/test）於 package.json
- [x] T002 [P] 修正/強化 TS project references 與 strict/noEmit 設定於 tsconfig.json、apps/server/tsconfig.json、apps/web/tsconfig.json、packages/contracts/tsconfig.json
- [x] T003 [P] 驗證並更新 Playwright 設定（baseURL、trace/video）於 apps/web/playwright.config.ts
- [x] T004 [P] 驗證並更新 Vitest 設定（contract/integration 覆蓋與執行命令）於 vitest.config.ts、vitest.coverage.contracts.config.ts
- [x] T005 [P] 補齊/更新 quickstart 的 smoke steps 與驗收路徑於 specs/001-prompt-asset-hub/quickstart.md

---

## Phase 2：基礎（BLOCKING：Contracts-first + Enum/Persistence 基礎）

目標：先把「契約/enum/設定落盤/檔案路徑」做成穩固地基；所有 user stories 皆依賴此 phase。

- [x] T006 更新 OpenAPI 與契約測試同步檢查（enum/Settings 欄位）於 specs/001-prompt-asset-hub/contracts/openapi.yaml、tests/contract/openapi.spec.ts
- [x] T007 [P] 對齊 Project frontmatter enum（planned/in_progress/paused/done）於 packages/contracts/src/frontmatter/project.ts
- [x] T008 [P] 對齊 Prompt frontmatter enum（status/priority）於 packages/contracts/src/frontmatter/prompt.ts
- [x] T009 [P] 更新 frontmatter 契約測試以符合新 enum 於 tests/contract/frontmatter.spec.ts
- [ ] T010 [P] 對齊 server 端 Project/Prompt 的 enum 驗證與序列化於 apps/server/src/routes/entities.ts

- [ ] T011 [P] 擴充 WorkspaceSettings DTO：新增 UI 偏好（視圖/篩選）欄位於 packages/contracts/src/dto/workspace.ts
- [ ] T012 [P] 對齊 WorkspaceSettings contract tests（含 UI 偏好 roundtrip）於 tests/contract/workspace-settings-dto.spec.ts、tests/contract/api-workspace-settings.spec.ts
- [ ] T013 對齊 server workspace settings merge/落盤（含 nested UI 偏好與路徑驗證）於 apps/server/src/routes/workspace.ts
	- 驗證規則（需與 spec FR-011 對齊）：儲存時 `rootPath`/`attachmentPath` 必須存在；若不存在回 400；server 不自動建立目錄（不得 mkdir）
	- tagsDict 語意（需與 spec Session 2026-01-06 對齊）：刪除 tag 不批次改寫既有 Project/Prompt 檔案，只更新 tagsDict（影響建議/選單）

- [ ] T014 [P] 新增 web 端 workspace settings client（get/update）於 apps/web/src/features/settings/api.ts
- [ ] T015 將 UI 偏好改為「以 WorkspaceSettings 為權威」：調整 zustand store 與載入流程於 apps/web/src/state/uiStore.ts、apps/web/src/App.tsx
- [ ] T016 [P] 新增設定頁整合測試：UI 偏好與設定 roundtrip（含路徑不存在=400、tagsDict 刪除不批次改寫）於 tests/integration/settings-page.spec.ts

**Checkpoint**：`npm test` 跑完 contract + integration（至少 openapi/settings/frontmatter）後，才開始 US1。

---

## Phase 3：使用者故事 1 - 專案/提示詞管理與自動保存（優先級：P1）🎯 MVP

**目標**：建立/編輯/封存/刪除 Project/Prompt；Detail Panel 同頁編輯與 ≤2s autosave；刪除=回收站（可復原 + retention）；一致回饋（Saving/Saved/Failed）。

**獨立驗收**：在乾淨 workspace 設定 rootPath/attachmentPath 後，建立 project + prompt，編輯正文/中繼資料並停筆 ≤2 秒自動保存；刪除後可於回收站復原/永久刪除且 UI 同步更新。

### 測試（US1，Test-First）

- [ ] T017 [P] [US1] 擴充 Project/Prompt CRUD contract tests（含 enum + delete=trash）於 tests/contract/api-project-prompt.spec.ts
- [ ] T018 [P] [US1] 新增/強化 Trash endpoints contract tests（list/purge/restore + 409 conflict）於 tests/contract/api-trash.spec.ts
- [ ] T019 [P] [US1] 擴充 autosave 成功整合測試於 tests/integration/autosave-success.spec.ts
- [ ] T020 [P] [US1] 擴充 autosave 失敗整合測試（IO/權限/鎖檔；含附件上傳失敗）於 tests/integration/autosave-failure.spec.ts
- [ ] T021 [P] [US1] 新增回收站整合測試（delete→list→restore→purge）於 tests/integration/trash-flow.spec.ts
- [ ] T022 [P] [US1] 新增復原衝突整合測試（409 + overwrite/rename）於 tests/integration/trash-restore-conflict.spec.ts
- [ ] T023 [P] [US1] 新增回收站 retention 整合測試（到期清理 + 失敗可重試）於 tests/integration/trash-retention.spec.ts

### 實作（US1）

- [ ] T024 [P] [US1] 對齊 FS layout：`.pah/trash` 路徑 helpers 於 apps/server/src/fs-layout/index.ts
- [ ] T025 [P] [US1] 實作 trash 存放與 manifest 寫入（含 attachments 搬移）於 apps/server/src/trash/trashStore.ts
- [ ] T026 [P] [US1] 實作 trash 列表查詢（q/entityType/page/perPage）於 apps/server/src/trash/listTrash.ts
- [ ] T027 [P] [US1] 實作 trash 永久刪除（purge）於 apps/server/src/trash/purgeTrash.ts
- [ ] T028 [P] [US1] 實作 trash 復原（overwrite/rename；衝突回 409 RestoreConflict）於 apps/server/src/trash/restoreTrash.ts
- [ ] T029 [P] [US1] 新增 retention job（啟動先跑 + 每日固定時間）於 apps/server/src/trash/retention.ts
- [ ] T030 [US1] 註冊 trash routes 於 apps/server/src/routes/trash.ts、apps/server/src/index.ts

- [ ] T031 [US1] 對齊 Project/Prompt delete：soft delete → TrashItem 於 apps/server/src/routes/entities.ts
- [ ] T032 [P] [US1] 實作檔案讀寫 API（autosave）於 apps/server/src/routes/files.ts
- [ ] T033 [P] [US1] 實作附件上傳 API（multipart；回傳可插入 Markdown 的引用資訊，例如 storagePath/relativeLink）於 apps/server/src/routes/attachments.ts

- [ ] T034 [P] [US1] 新增/對齊 web 端 entities client（projects/prompts CRUD）於 apps/web/src/features/library/api.ts
- [ ] T035 [P] [US1] 新增回收站 client（list/restore/purge）於 apps/web/src/features/trash/api.ts

- [ ] T036 [US1] 對齊 Sidebar 導覽：Projects/Prompts（list/board）+ Tools（Inbox/Archive/Trash/Clipboard/Settings）於 apps/web/src/layout/Sidebar.tsx
- [ ] T037 [US1] 對齊主內容切換與 routing state（activeSection/subView）於 apps/web/src/layout/MainContent.tsx、apps/web/src/state/uiStore.ts

- [ ] T038 [P] [US1] 實作 ProjectView（list/board + selection）於 apps/web/src/layout/ProjectView.tsx
- [ ] T039 [P] [US1] 實作 PromptView（list/board + selection）於 apps/web/src/layout/PromptView.tsx
- [ ] T040 [US1] 實作右側 overlay Detail Panel（Saving/Saved/Failed + delete/archive actions；支援拖放圖片/附件→上傳→插入引用連結）於 apps/web/src/layout/SidePanel.tsx

**Checkpoint**：US1 contract + integration tests 全通過，且 quickstart 的「建立/編輯/autosave/刪除/復原」可獨立驗收。

---

## Phase 4：使用者故事 2 - 視圖切換與搜尋/篩選（優先級：P2）

**目標**：列表/看板切換不改變資料集合；提供搜尋/篩選（title/tags/body + status/priority）；並記住上次視圖/篩選（存 WorkspaceSettings）；新增 Tools → Archive（同頁顯示已封存 project + prompt）。

**獨立驗收**：建立多筆資產後，套用搜尋/篩選並切換 list/board；重整頁面後偏好能自動還原；Archive 視圖可同頁看到已封存專案與提示詞。

### 測試（US2，Test-First）

- [ ] T041 [P] [US2] 擴充搜尋 API contract tests（SearchRequest/SearchResponse + highlight/snippet）於 tests/contract/api-search.spec.ts
- [ ] T042 [P] [US2] 擴充 WS sync contract tests（file.changed / sync.status）於 tests/contract/ws-sync.spec.ts
- [ ] T043 [P] [US2] 列表/看板切換一致性整合測試於 tests/integration/view-toggle-consistency.spec.ts
- [ ] T044 [P] [US2] 外部修改衝突整合測試（refresh/overwrite）於 tests/integration/conflict-resolution.spec.ts
- [ ] T045 [P] [US2] UI 偏好落盤合規測試（不依賴 localStorage）於 tests/integration/persistence-compliance.spec.ts

### 實作（US2）

- [ ] T046 [P] [US2] 後端：chokidar watcher 推播 file.changed（忽略 `.pah/**`）於 apps/server/src/watch/fileWatcher.ts
- [ ] T047 [US2] 後端：搜尋端點與索引快取（MVP）於 apps/server/src/routes/search.ts、apps/server/src/search/index.ts

- [ ] T048 [P] [US2] 前端：搜尋輸入/篩選 UI（含 empty state）於 apps/web/src/layout/ProjectView.tsx、apps/web/src/layout/PromptView.tsx
- [ ] T049 [US2] 前端：將 view/filter 偏好寫入 WorkspaceSettings（API 落盤）於 apps/web/src/state/uiStore.ts、apps/web/src/features/settings/api.ts

- [ ] T050 [P] [US2] 新增 archived 篩選參數（projects/prompts list endpoints）於 specs/001-prompt-asset-hub/contracts/openapi.yaml
- [ ] T051 [P] [US2] 後端：支援 archived 篩選（查詢/掃描/索引）於 apps/server/src/routes/entities.ts、apps/server/src/indexing/index.ts
- [ ] T052 [P] [US2] 契約測試：archived filter 行為於 tests/contract/api-project-prompt.spec.ts

- [ ] T053 [P] [US2] 實作 ArchiveView（同頁顯示封存 projects + prompts + 類型篩選）於 apps/web/src/features/archive/ArchiveView.tsx
- [ ] T054 [US2] 串接 Sidebar → Tools/Archive 與 MainContent 顯示於 apps/web/src/layout/Sidebar.tsx、apps/web/src/layout/MainContent.tsx

---

## Phase 5：使用者故事 3 - 版本備份與歷史檢視（優先級：P3）

**目標**：手動版本節點、每日快照、立即備份；歷史列表可檢視並開啟指定版本；快照/版本包含附件完整複本。

**獨立驗收**：在單一 prompt 上建立多次編輯與手動備份，驗證 snapshot layout（manifest/root/attachments）與 retention；UI 可開啟舊版內容。

### 測試（US3，Test-First）

- [ ] T055 [P] [US3] snapshot/version contract tests（含 scope/manifest shape）於 tests/contract/api-snapshot-version.spec.ts
- [ ] T056 [P] [US3] snapshot layout 整合測試（manifest/root/attachments）於 tests/integration/snapshot-layout.spec.ts
- [ ] T057 [P] [US3] retention 整合測試（含 pinned/配額策略）於 tests/integration/retention-policy.spec.ts

### 實作（US3）

- [ ] T058 [P] [US3] 後端：snapshot service（daily + manual）於 apps/server/src/backup/snapshot.ts
- [ ] T059 [P] [US3] 後端：version node service（entity scope）於 apps/server/src/backup/version-node/index.ts
- [ ] T060 [P] [US3] 後端：retention 清理策略於 apps/server/src/backup/retention.ts
- [ ] T061 [US3] 後端：routes 對齊 OpenAPI（snapshots/versions）於 apps/server/src/routes/snapshots.ts、specs/001-prompt-asset-hub/contracts/openapi.yaml
- [ ] T062 [P] [US3] 前端：HistoryView（列表 + 開啟 + 建立快照/版本）於 apps/web/src/features/history/HistoryView.tsx

---

## Phase 6：使用者故事 4 - 暫存區檢視與簡修（優先級：P3）

**目標**：顯示 InboxItem 並允許最小幅度編修（標題/刪減/註記）；清楚提示「歸檔由外部工具處理」。

**獨立驗收**：建立多筆 inbox 檔案後可在 UI 編修並保存；重啟後可由掃描重建。

### 測試（US4，Test-First）

- [ ] T063 [P] [US4] inbox contract tests（list/get/update/delete）於 tests/contract/api-inbox.spec.ts
- [ ] T064 [P] [US4] inbox 可用性/延遲整合測試於 tests/integration/inbox-usability.spec.ts

### 實作（US4）

- [ ] T065 [US4] 後端：Inbox routes（讀取 + 簡修更新）於 apps/server/src/routes/inbox.ts
- [ ] T066 [P] [US4] 前端：InboxView（列表 + 最小編修 + 文案）於 apps/web/src/features/inbox/InboxView.tsx
- [ ] T067 [US4] 串接 Sidebar → Tools/Inbox 與 MainContent 顯示於 apps/web/src/layout/Sidebar.tsx、apps/web/src/layout/MainContent.tsx

---

## Phase 7：打磨與橫切關注點

目標：補齊未被 user stories 明確覆蓋但屬於 FR/UI/Entities 的能力（Clipboard/Snippets），並把 UI regression/效能基準/契約漂移防護落地。

- [ ] T068 [P] Snippets/Clipboard：更新 FS layout snippets 路徑為 `.pah/snippets/`（每個 snippet 一檔）於 apps/server/src/fs-layout/index.ts
- [ ] T069 [P] Snippets/Clipboard：新增 contracts DTO（Snippet/SnippetList）於 packages/contracts/src/dto/snippet.ts、packages/contracts/src/dto/index.ts
- [ ] T070 [P] Snippets/Clipboard：更新 OpenAPI（/api/snippets CRUD）於 specs/001-prompt-asset-hub/contracts/openapi.yaml
- [ ] T071 [P] Snippets/Clipboard：新增 snippet contract tests 於 tests/contract/api-snippets.spec.ts
- [ ] T072 Snippets/Clipboard：後端 snippets routes（list/get/create/update/delete）於 apps/server/src/routes/snippets.ts、apps/server/src/index.ts
- [ ] T073 [P] Snippets/Clipboard：前端 ClipboardView（list + copy/insert）於 apps/web/src/features/clipboard/ClipboardView.tsx
- [ ] T074 Snippets/Clipboard：串接 Sidebar → Tools/Clipboard 與 MainContent 顯示於 apps/web/src/layout/Sidebar.tsx、apps/web/src/layout/MainContent.tsx

- [ ] T075 [P] UI regression：建立/更新 checklist 與 evidence 流程（PR 必須附截圖或短錄影 + 完成 checklist）於 specs/001-prompt-asset-hub/checklists/ui-regression.md
- [ ] T076 [P] 效能基準：掃描/搜尋/快照/回收站 list benchmarks 於 tests/integration/benchmarks/benchmarks.spec.ts
- [ ] T077 [P] 防漂移：強化 OpenAPI contract tests（確保所有 routes 對齊 spec）於 tests/contract/openapi.spec.ts
- [ ] T078 更新 quickstart 驗收流程（含 Archive/Clipboard）於 specs/001-prompt-asset-hub/quickstart.md

---

## 相依性與執行順序

### User Story Completion Order（建議）

1. US1（P1）→ 2. US2（P2）→ 3. US3（P3）
4. US4（P3）可在 US1 後平行推進（但仍依賴 Phase 2）

### Dependency Graph（ASCII）

Setup(Phase1) → Foundational(Phase2) → US1
								   ├→ US2 → US3
								   └→ US4

---

## Parallel Execution Examples（每個故事）

US1：
- 後端 trash（T024–T030）可與前端 views（T036–T040）平行
- autosave tests（T019–T020）可與 trash tests（T021–T023）平行

US2：
- watcher（T046）可與 search index（T047）平行
- ArchiveView（T053）可在 archived filter contract（T050–T052）穩定後開始

US3：
- snapshot/version/retention services（T058–T060）可平行
- HistoryView（T062）可在 routes 形狀確認後開始

US4：
- inbox routes（T065）與 InboxView（T066）可平行

---

## 實作策略

### MVP First（只做 US1）

1. 完成 Phase 1 + Phase 2
2. 完成 US1（含 autosave + trash delete/restore/purge + feedback）
3. **STOP & VALIDATE**：跑 US1 相關 contract/integration tests，並依 `quickstart.md` 驗收

### Incremental Delivery

US1 → US2 → US3/US4 → Phase 7（Clipboard/Regression/Benchmarks）

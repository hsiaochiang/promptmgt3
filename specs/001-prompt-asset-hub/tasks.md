---

description: "任務清單：001-prompt-asset-hub"

---

# Tasks: 檔案為核心的提示詞資產管理主系統

**Input**: Design documents from `specs/001-prompt-asset-hub/`
**Prerequisites**: plan.md（必讀）、spec.md（必讀），可用：research.md、data-model.md、contracts/openapi.yaml、quickstart.md

<!-- Language requirement: Tasks and user-facing documentation MUST be written in Traditional Chinese (zh-TW). -->

**Tests**: 本功能採 contracts-first + test-first（contract/integration/unit）。

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: 可平行（不同檔案、無未完成依賴、低衝突）
- **[Story]**: 僅 User Story phases 需標記（[US1]…）
- 每個任務描述必須包含明確檔案路徑（新增檔也要寫目標路徑）

## Path Conventions（本 repo）

- Server：`apps/server/src/**`
- Web：`apps/web/src/**`
- Shared Contracts：`packages/contracts/src/**`
- Tests：`tests/{contract,integration,unit}/**`

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: monorepo 啟動、型別檢查、測試命令可重跑，並與 quickstart 對齊。

- [x] T001 對齊 monorepo scripts（dev:server/dev:web/type-check/test）於 package.json、apps/server/package.json、apps/web/package.json
- [x] T002 [P] 強化 TS project references 與 strict/noEmit 設定於 tsconfig.json、apps/server/tsconfig.json、apps/web/tsconfig.json、packages/contracts/tsconfig.json
- [x] T003 [P] 驗證並更新 Vitest 設定（contract/integration 覆蓋與執行命令）於 vitest.config.ts、vitest.coverage.contracts.config.ts
- [x] T004 [P] 驗證並更新 Playwright 設定（baseURL、trace/video）於 apps/web/playwright.config.ts
- [x] T005 [P] 校準 quickstart 的 smoke steps 與驗收路徑於 specs/001-prompt-asset-hub/quickstart.md

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: contracts-first、enum/DTO、檔案佈局與 settings 落盤等地基；此 Phase 完成前不得開始任何 User Story。

- [x] T006 以 OpenAPI 作為 REST 契約基準，建立/維護 contract drift guard 於 specs/001-prompt-asset-hub/contracts/openapi.yaml、tests/contract/openapi.spec.ts

- [x] T007 [P] 對齊 Project frontmatter enum（planned/in_progress/paused/done）於 packages/contracts/src/frontmatter/project.ts
- [x] T008 [P] 對齊 Prompt frontmatter enum（status/priority）於 packages/contracts/src/frontmatter/prompt.ts
- [x] T009 [P] 對齊 Inbox frontmatter（若有）與 delete 語意備註於 packages/contracts/src/frontmatter/inbox.ts
- [x] T010 [P] 更新 frontmatter 契約測試以符合 enum 與必填欄位於 tests/contract/frontmatter.spec.ts
- [x] T011 [P] 對齊 server 端 Project/Prompt enum 驗證與序列化於 apps/server/src/routes/entities.ts

- [x] T012 [P] 建立 slug 正規化 helper（ASCII kebab-case）並覆蓋邊界案例於 apps/server/src/utils/slug.ts、tests/unit/slug.spec.ts
- [x] T013 將 slug 規則套用到 Project/Prompt create/rename 與 restore(rename) 流程於 apps/server/src/routes/entities.ts、apps/server/src/trash/trashStore.ts

- [x] T014 [P] 釐清並對齊 SearchRequest/SearchResponse 契約（OpenAPI vs contracts DTO）於 specs/001-prompt-asset-hub/contracts/openapi.yaml、packages/contracts/src/dto/search.ts
- [ ] T015 [P] 更新 search DTO contract tests 以符合最終契約（含預設 scope=Active only）於 tests/contract/search-dto.spec.ts、tests/contract/api-search.spec.ts

- [x] T016 [P] 擴充 WorkspaceSettings DTO（含 UI 偏好：視圖/篩選條件）於 packages/contracts/src/dto/workspace.ts
- [x] T017 [P] 對齊 WorkspaceSettings contract tests（含 UI 偏好 roundtrip + schema defaults）於 tests/contract/workspace-settings-dto.spec.ts、tests/contract/api-workspace-settings.spec.ts
- [x] T018 對齊 server workspace settings merge/落盤與路徑驗證（rootPath/attachmentPath 必須存在；不 mkdir）於 apps/server/src/routes/workspace.ts
- [x] T019 [P] 新增 web 端 workspace settings client（get/update）於 apps/web/src/features/settings/api.ts
- [ ] T020 將 UI 偏好改為「以 WorkspaceSettings 為權威」的載入/保存流程於 apps/web/src/state/uiStore.ts、apps/web/src/App.tsx

- [x] T021 [P] 對齊附件落盤命名策略（UUID + 副檔名）與回傳欄位於 apps/server/src/attachments/index.ts、apps/server/src/routes/attachments.ts
- [ ] T022 [P] 更新附件 helper unit tests（確保 UUID 命名且保留副檔名、避免覆蓋）於 tests/unit/attachments.spec.ts

**Checkpoint**: Phase 2 完成後，至少 `tests/contract/openapi.spec.ts`、`tests/contract/*settings*`、`tests/contract/frontmatter.spec.ts`、`tests/contract/search-dto.spec.ts` 全通過。

---

## Phase 3: User Story 1 - 專案/提示詞管理與自動保存（Priority: P1）🎯 MVP

**Goal**: 建立/編輯/封存/刪除 Project/Prompt；Detail Panel 同頁編輯與 ≤2s autosave；刪除=回收站（可復原 + retention）；一致回饋（Saving/Saved/Failed）。

**Independent Test**: 設定 rootPath/attachmentPath 後，建立 project + prompt，編輯正文/中繼資料並停筆 ≤2 秒自動保存；刪除後可於回收站復原/永久刪除且 UI 同步更新。

### Tests for User Story 1 (Test-First)

- [ ] T023 [P] [US1] 擴充 Project/Prompt CRUD contract tests（含 enum + delete=trash）於 tests/contract/api-project-prompt.spec.ts
- [ ] T024 [P] [US1] 新增/強化 Trash endpoints contract tests（list/purge/restore + 409 conflict）於 tests/contract/api-trash.spec.ts
- [ ] T025 [P] [US1] 擴充 autosave 成功整合測試於 tests/integration/autosave-success.spec.ts
- [ ] T026 [P] [US1] 擴充 autosave 失敗整合測試（IO/權限/鎖檔）於 tests/integration/autosave-failure.spec.ts
- [ ] T027 [P] [US1] 新增回收站整合測試（delete→list→restore→purge）於 tests/integration/trash-flow.spec.ts
- [ ] T028 [P] [US1] 新增復原衝突整合測試（409 + overwrite/rename）於 tests/integration/trash-restore-conflict.spec.ts
- [ ] T029 [P] [US1] 新增回收站 retention 整合測試（到期清理 + 失敗可重試）於 tests/integration/trash-retention.spec.ts

### Implementation for User Story 1

- [x] T030 [P] [US1] 對齊 FS layout：`.pah/trash` 路徑 helpers 於 apps/server/src/fs-layout/index.ts
- [x] T031 [P] [US1] 實作 trash 存放與 manifest 寫入（含 attachments 搬移）於 apps/server/src/trash/trashStore.ts
- [x] T032 [P] [US1] 實作 trash 列表查詢（q/entityType/page/perPage）於 apps/server/src/trash/listTrash.ts
- [x] T033 [P] [US1] 實作 trash 永久刪除（purge）於 apps/server/src/trash/purgeTrash.ts
- [x] T034 [P] [US1] 實作 trash 復原（overwrite/rename；衝突回 409 RestoreConflict）於 apps/server/src/trash/restoreTrash.ts
- [x] T035 [P] [US1] 新增 retention job（啟動先跑 + 每日固定時間；預設 03:00，本機時區）於 apps/server/src/trash/retention.ts
- [x] T036 [US1] 註冊 trash routes 於 apps/server/src/routes/trash.ts、apps/server/src/index.ts

- [x] T037 [US1] 對齊 Project/Prompt delete：soft delete → TrashItem 於 apps/server/src/routes/entities.ts
- [ ] T038 [P] [US1] 實作檔案讀寫 API（autosave）於 apps/server/src/routes/files.ts
- [x] T039 [P] [US1] 對齊附件上傳 API 與 Markdown 引用（使用 UUID 檔名）於 apps/server/src/routes/attachments.ts

- [x] T040 [P] [US1] 新增/對齊 web 端 entities client（projects/prompts CRUD）於 apps/web/src/features/library/api.ts
- [ ] T041 [P] [US1] 新增回收站 client（list/restore/purge）於 apps/web/src/features/trash/api.ts

- [x] T042 [US1] 對齊 Sidebar 導覽：Projects/Prompts（list/board）+ Tools（Inbox/Archive/Trash/Clipboard/Settings）於 apps/web/src/layout/Sidebar.tsx
- [x] T043 [US1] 對齊主內容切換與 routing state（activeSection/subView）於 apps/web/src/layout/MainContent.tsx、apps/web/src/state/uiStore.ts

- [x] T044 [P] [US1] 實作 ProjectView（list/board + selection）於 apps/web/src/layout/ProjectView.tsx
- [x] T045 [P] [US1] 實作 PromptView（list/board + selection）於 apps/web/src/layout/PromptView.tsx
- [x] T046 [US1] 實作右側 overlay Detail Panel（Saving/Saved/Failed + delete/archive actions；拖放附件→上傳→插入引用）於 apps/web/src/layout/SidePanel.tsx

**Checkpoint**: US1 相關 contract/integration tests 全通過，且 quickstart 的「建立/編輯/autosave/刪除/復原」可獨立驗收（specs/001-prompt-asset-hub/quickstart.md）。

---

## Phase 4: User Story 2 - 視圖切換與搜尋/篩選（Priority: P2）

**Goal**: 列表/看板切換不改變資料集合；提供搜尋/篩選（title/tags/body + status/priority）；並記住上次視圖/篩選（存 WorkspaceSettings）；新增 Tools → Archive（同頁顯示已封存 project + prompt）。

**Independent Test**: 建立多筆資產後，套用搜尋/篩選並切換 list/board；重整頁面後偏好能自動還原；Archive 視圖同頁可切換顯示已封存專案/提示詞。

### Tests for User Story 2 (Test-First)

- [ ] T047 [P] [US2] 更新搜尋 API contract tests（SearchRequest include flags + entityTypes；預設 Active only）於 tests/contract/api-search.spec.ts
- [ ] T048 [P] [US2] 更新 WS sync contract tests（file.changed / sync.status）於 tests/contract/ws-sync.spec.ts
- [ ] T049 [P] [US2] 列表/看板切換一致性整合測試於 tests/integration/view-toggle-consistency.spec.ts
- [ ] T050 [P] [US2] 外部修改衝突整合測試（refresh/overwrite）於 tests/integration/conflict-resolution.spec.ts
- [ ] T051 [P] [US2] UI 偏好落盤合規測試（不依賴 localStorage）於 tests/integration/persistence-compliance.spec.ts

### Implementation for User Story 2

- [ ] T052 [P] [US2] 後端：chokidar watcher 推播 file.changed（忽略 `.pah/**`）於 apps/server/src/watch/fileWatcher.ts
- [ ] T053 [US2] 後端：搜尋端點與索引快取（預設只含 project/prompt 且 archived=false）於 apps/server/src/routes/search.ts、apps/server/src/search/index.ts

- [ ] T054 [P] [US2] 前端：搜尋輸入/篩選 UI（含 empty state + client-side 高亮）於 apps/web/src/layout/ProjectView.tsx、apps/web/src/layout/PromptView.tsx
- [ ] T055 [US2] 前端：將 view/filter 偏好寫入 WorkspaceSettings（API 落盤）於 apps/web/src/state/uiStore.ts、apps/web/src/features/settings/api.ts

- [ ] T056 [P] [US2] 後端：支援 archived 篩選（projects/prompts list endpoints；預設 false）於 apps/server/src/routes/entities.ts
- [ ] T057 [P] [US2] 契約測試：archived query 行為（預設 false；可顯式 true）於 tests/contract/api-project-prompt.spec.ts

- [ ] T058 [P] [US2] 實作 ArchiveView（同頁顯示封存 projects + prompts + 類型篩選）於 apps/web/src/features/archive/ArchiveView.tsx
- [ ] T059 [US2] 串接 Sidebar → Tools/Archive 與 MainContent 顯示於 apps/web/src/layout/Sidebar.tsx、apps/web/src/layout/MainContent.tsx

**Checkpoint**: US2 可在不開啟 US3/US4 的情況下完成驗收（spec.md 使用者故事 2）。

---

## Phase 5: User Story 3 - 版本備份與歷史檢視（Priority: P3）

**Goal**: 手動版本節點、每日快照、立即備份；歷史列表可檢視並開啟指定版本；快照/版本包含附件完整複本，允許部分失敗但需 warnings 可追溯且不可靜默。

**Independent Test**: 在單一 prompt 上建立多次編輯與手動備份，驗證 snapshot layout（manifest/root/attachments）與 warnings/partial failure；UI 可開啟舊版內容。

### Tests for User Story 3 (Test-First)

- [ ] T060 [P] [US3] snapshot/version contract tests（含 scope/manifest shape + warnings/partial failure 可追溯）於 tests/contract/api-snapshot-version.spec.ts
- [ ] T061 [P] [US3] snapshot layout 整合測試（manifest/root/attachments + warnings 不可靜默）於 tests/integration/snapshot-layout.spec.ts
- [ ] T062 [P] [US3] retention 整合測試（含 pinned/配額策略）於 tests/integration/retention-policy.spec.ts

### Implementation for User Story 3

- [ ] T063 [P] [US3] 後端：snapshot service（daily + manual；manifest 記錄 warnings/partial failure）於 apps/server/src/backup/snapshot.ts
- [ ] T064 [P] [US3] 後端：version node service（entity scope）於 apps/server/src/backup/version-node/index.ts
- [ ] T065 [P] [US3] 後端：retention 清理策略於 apps/server/src/backup/retention.ts
- [ ] T066 [US3] 後端：routes 對齊 OpenAPI（snapshots/versions）於 apps/server/src/routes/snapshots.ts、specs/001-prompt-asset-hub/contracts/openapi.yaml
- [ ] T067 [P] [US3] 前端：HistoryView（列表 + 開啟 + 建立快照/版本）於 apps/web/src/features/history/HistoryView.tsx

---

## Phase 6: User Story 4 - 暫存區檢視與簡修（Priority: P3）

**Goal**: 顯示 InboxItem 並允許最小幅度編修（標題/刪減/註記）；清楚提示「歸檔由外部工具處理」；Inbox delete 為永久刪除（不進回收站）。

**Independent Test**: 建立多筆 inbox 檔案後可在 UI 編修並保存；刪除需確認且不可於 Trash 復原；重啟後可由掃描重建。

### Tests for User Story 4 (Test-First)

- [ ] T068 [P] [US4] inbox contract tests（list/get/update/delete；delete=永久刪除，不進回收站）於 tests/contract/api-inbox.spec.ts
- [ ] T069 [P] [US4] inbox 可用性/延遲整合測試於 tests/integration/inbox-usability.spec.ts

### Implementation for User Story 4

- [ ] T070 [US4] 後端：Inbox routes（讀取 + 簡修更新 + delete=永久刪除）於 apps/server/src/routes/inbox.ts
- [ ] T071 [P] [US4] 前端：InboxView（列表 + 最小編修 + 刪除 + 文案）於 apps/web/src/features/inbox/InboxView.tsx
- [ ] T072 [US4] 串接 Sidebar → Tools/Inbox 與 MainContent 顯示於 apps/web/src/layout/Sidebar.tsx、apps/web/src/layout/MainContent.tsx

---

## Phase 7: Polish & Cross-Cutting Concerns

**Purpose**: 補齊 Snippets/Clipboard、回歸驗收流程、效能基準與契約防漂移。

- [ ] T073 [P] Snippets/Clipboard：對齊 `.pah/snippets/` 路徑（每個 snippet 一檔）於 apps/server/src/fs-layout/index.ts
- [ ] T074 [P] Snippets/Clipboard：新增/對齊 contracts DTO（Snippet/SnippetList）於 packages/contracts/src/dto/snippet.ts、packages/contracts/src/dto/index.ts
- [ ] T075 [P] Snippets/Clipboard：更新 OpenAPI（/api/snippets CRUD）於 specs/001-prompt-asset-hub/contracts/openapi.yaml
- [ ] T076 [P] Snippets/Clipboard：新增 snippet contract tests 於 tests/contract/api-snippets.spec.ts
- [ ] T077 Snippets/Clipboard：後端 snippets routes（list/get/create/update/delete）於 apps/server/src/routes/snippets.ts、apps/server/src/index.ts
- [ ] T078 [P] Snippets/Clipboard：前端 ClipboardView（list + copy/insert）於 apps/web/src/features/clipboard/ClipboardView.tsx
- [ ] T079 Snippets/Clipboard：串接 Sidebar → Tools/Clipboard 與 MainContent 顯示於 apps/web/src/layout/Sidebar.tsx、apps/web/src/layout/MainContent.tsx

- [ ] T080 [P] 修正文檔內「附件命名規則」矛盾（UUID 命名 vs suffix 規則）於 specs/001-prompt-asset-hub/data-model.md
- [ ] T081 [P] UI regression：建立/更新 checklist 與 evidence 流程於 specs/001-prompt-asset-hub/checklists/ui-regression.md
- [ ] T082 [P] 效能基準：掃描/搜尋/快照/回收站 list benchmarks 於 tests/integration/benchmarks/benchmarks.spec.ts
- [ ] T083 [P] 防漂移：強化 OpenAPI contract tests（確保所有 routes 對齊 spec）於 tests/contract/openapi.spec.ts
- [ ] T084 更新 quickstart 驗收流程（含 Archive/Clipboard）於 specs/001-prompt-asset-hub/quickstart.md

---

## Dependencies & Execution Order

### Phase Dependencies

- Setup（Phase 1）→ Foundational（Phase 2）→ User Stories（Phase 3+）→ Polish（Phase 7）

### User Story Dependencies

- US1（P1）完成後即可作為 MVP。
- US2（P2）依賴 Phase 2（不強依賴 US1 的 UI 細節，但實務上會共用 entities/Detail Panel）。
- US3（P3）依賴 Phase 2（並需要至少能建立/編輯資產才有可用情境，通常在 US1 後推）。
- US4（P3）可在 US1 後平行推進，但仍依賴 Phase 2。

### Dependency Graph (ASCII)

Setup(Phase1) → Foundational(Phase2) → US1
                                   ├→ US2
                                   ├→ US3
                                   └→ US4

---

## Parallel Execution Examples（每個故事）

US1：
Task: "T030–T036 trash backend"（apps/server/src/trash/*、apps/server/src/routes/trash.ts）
Task: "T042–T046 core UI views"（apps/web/src/layout/*）

US2：
Task: "T052 file watcher"（apps/server/src/watch/fileWatcher.ts）
Task: "T054 search UI"（apps/web/src/layout/ProjectView.tsx、apps/web/src/layout/PromptView.tsx）

US3：
Task: "T063 snapshot service"（apps/server/src/backup/snapshot.ts）
Task: "T067 history UI"（apps/web/src/features/history/HistoryView.tsx）

US4：
Task: "T070 inbox routes"（apps/server/src/routes/inbox.ts）
Task: "T071 inbox UI"（apps/web/src/features/inbox/InboxView.tsx）

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. 完成 Phase 1
2. 完成 Phase 2（BLOCKING）
3. 完成 Phase 3（US1）
4. STOP & VALIDATE：依 specs/001-prompt-asset-hub/quickstart.md 驗收 US1，並跑 `tests/contract/*` + US1 相關 `tests/integration/*`

### Incremental Delivery

US1 → US2 → US3/US4（可平行）→ Phase 7

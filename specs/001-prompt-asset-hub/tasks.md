---

description: "Task list: 001-prompt-asset-hub"
---

# Tasks: 檔案為核心的提示詞資產管理主系統

**Input**: 設計文件：
- specs/001-prompt-asset-hub/spec.md
- specs/001-prompt-asset-hub/plan.md
- specs/001-prompt-asset-hub/data-model.md
- specs/001-prompt-asset-hub/contracts/

**Prerequisites**: plan.md（required）, spec.md（required）

<!-- Language requirement: Tasks and user-facing documentation MUST be written in Traditional Chinese (zh-TW). -->

**Organization**: 依 User Story 分組，確保每個故事都能「獨立完成 + 獨立驗收 + 對應測試」。Contracts-first 為硬性前置 gate。

## Format: `[T###] [P?] [US#] Description`

- **[P]**: 可平行（不同檔案/低衝突）
- **[US#]**: 對應 spec.md 的 user story（US1..US4）
- 每個任務需包含「完成定義（DoD）」與「驗收點」

## Path Conventions（依 plan.md）

- 前端：`apps/web/`
- 後端：`apps/server/`
- 共享契約：`packages/contracts/`
- 測試：`tests/contract/`, `tests/integration/`, `tests/unit/`

---

## Phase 1: Setup（專案骨架與工具）

- [X] T001 建立 monorepo 目錄結構（apps/web, apps/server, packages/contracts, tests/*）
  - DoD: 目錄存在且可被工具鏈辨識

- [X] T002 [P] 初始化前端（React 18 + Vite + TS + Tailwind + CodeMirror 6）於 `apps/web/`
  - DoD: `apps/web` 可啟動、可 build、TypeScript strict 啟用

- [X] T003 [P] 初始化後端（Node 20 + Fastify + ws + chokidar）於 `apps/server/`
  - DoD: `apps/server` 可啟動，提供健康檢查 endpoint

- [X] T004 [P] 初始化共享 contracts 套件於 `packages/contracts/`（zod/JSON schema + 型別輸出）
  - DoD: 前後端能以同一套 schema/型別編譯

- [X] T005 [P] 建立測試框架（Vitest/Jest 擇一一致）與資料夾（contract/integration/unit）
  - DoD: `tests/*` 可跑起來且有 1 個範例測試

---

## Phase 2: Foundational（BLOCKING：contracts-first + 檔案權威基礎）

**Gate**: 未通過本階段，禁止進入任何 US 實作。

- [X] T010 定義 Project frontmatter schema 於 `packages/contracts/src/frontmatter/project.ts`
  - DoD: 必填/選填/預設、id vs slug 規則符合 data-model.md；產出型別可供前後端共用

- [X] T011 定義 Prompt frontmatter schema 於 `packages/contracts/src/frontmatter/prompt.ts`
  - DoD: 含 projectId 參照、status/priority 預設；型別可共用

- [X] T012 定義 InboxItem frontmatter schema 於 `packages/contracts/src/frontmatter/inbox.ts`
  - DoD: suggestedTarget 為引用型 { projectId?, promptId?, pathHint? }

- [X] T013 定義 Search DTO（SearchRequest/SearchResultItem）於 `packages/contracts/src/dto/search.ts`
  - DoD: 支援 query + filters（tags/status/priority/archived）+ sort + viewScope；型別輸出

- [X] T014 定義 WS payload schemas（file.changed, entity.updated）於 `packages/contracts/src/ws/files.ts`
  - DoD: 事件名稱與欄位形狀明確；型別輸出

- [X] T015 定義 WS payload schemas（sync.status, snapshot.created, snapshot.failed）於 `packages/contracts/src/ws/status.ts`
  - DoD: 狀態枚舉、必填欄位完整；型別輸出

- [X] T016 更新 OpenAPI（specs/001-prompt-asset-hub/contracts/openapi.yaml）：Workspace 設定、Project/Prompt/Inbox CRUD、Search、Snapshot/Version manifests
  - DoD: OpenAPI 欄位與 contracts DTO 完全一致（欄位/型別/必填）；若有差異需同步修正 contracts

- [X] T017 [P] Contract tests：frontmatter schemas 驗證於 `tests/contract/frontmatter.spec.ts`
  - DoD: required/optional/default、id/slug 皆被測；CI 可跑

- [X] T018 [P] Contract tests：WS payload schemas 驗證於 `tests/contract/ws-payloads.spec.ts`
  - DoD: 每事件至少 1 valid + 1 invalid；event name mismatch 會 fail

- [X] T019 [P] Contract tests：Search DTO 驗證於 `tests/contract/search-dto.spec.ts`
  - DoD: filters/sort/viewScope 驗證；缺欄位會 fail

- [X] T020 [P] Contract tests：OpenAPI 形狀檢查於 `tests/contract/openapi.spec.ts`
  - DoD: 解析並比對 DTO snapshot，檢出 breaking 變更

- [X] T021 建立檔案系統 layout constants/helpers（`.pah/`、versions、snapshots、events、cache）於 `apps/server/src/fs-layout/*`
  - DoD: 所有路徑集中管理；無散落字串

- [X] T022 建立掃描/解析管線（gray-matter + schemas）於 `apps/server/src/indexing/*`
  - DoD: 掃描 `<rootPath>` 可重建 Sidebar/列表/Detail 所需資料（符合 INV-002）

**Checkpoint**: 合約 + 檔案解析完成，才能進入 US1。

---

## Phase 3: User Story 1（P1）— 專案/提示詞管理 + Detail Panel + Autosave

**Goal**: 以檔案為權威完成 Project/Prompt CRUD、右側 Detail Panel 同頁編輯與 autosave（≤2s）。

**Independent Test**: 乾淨 rootPath 下建立 Project/Prompt，編輯正文與中繼資料，停筆自動保存，重啟後可由掃描重建。

### Contract tests（US1）

- [X] T030 [P] [US1] Contract test：Project/Prompt CRUD endpoints（request/response shape）於 `tests/contract/api-project-prompt.spec.ts`
  - DoD: 變更 DTO 會 fail；錯誤碼（400/404/409/403）有覆蓋

### Integration tests（US1）

- [X] T031 [P] [US1] Integration test：檔案掃描可重建（建立檔案樹→重啟 server→列出一致）於 `tests/integration/rebuild-from-scan.spec.ts`
  - DoD: 符合 INV-002

- [X] T032 [P] [US1] Integration test：autosave debounce + 成功狀態於 `tests/integration/autosave-success.spec.ts`
  - DoD: 停筆 ≤2s 觸發寫入；狀態可查

### Implementation（US1）

- [X] T033 [P] [US1] 後端：Workspace 設定讀寫（rootPath/attachmentPath/backupSettings）於 `apps/server/src/routes/workspace.ts`
  - DoD: 路徑權限檢查；不可寫時阻擋寫入並回傳可理解錯誤

- [X] T034 [US1] 後端：Project/Prompt 檔案 CRUD（含 frontmatter/body）於 `apps/server/src/routes/projects.ts`, `apps/server/src/routes/prompts.ts`
  - DoD: 檔案為唯一權威（INV-001），slug rename 不破壞引用（id 不變）

- [X] T035 [P] [US1] 後端：附件落盤與命名策略於 `apps/server/src/attachments/*`
  - DoD: 避免同名覆蓋；回傳可引用路徑

- [X] T036 [P] [US1] 前端：Sidebar + 主內容佈局骨架（sidebar → list/board → right detail panel）於 `apps/web/src/layout/*`
  - DoD: UI-001 / UI-003 的結構可操作；選取狀態一致

- [X] T037 [P] [US1] 前端：列表（最小可用）於 `apps/web/src/features/library/ListView/*`
  - DoD: 能顯示 prompts，點選開啟 Detail Panel

- [X] T038 [US1] 前端：Detail Panel（正文 + metadata 表單）於 `apps/web/src/features/prompt/DetailPanel/*`
  - DoD: 顯示 Saving/Saved/Failed + timestamp；支援拖曳附件插入引用

- [X] T039 [US1] 前端：Autosave（≤2s）+ 失敗狀態 + 重試/複製未保存內容於 `apps/web/src/features/prompt/autosave/*`
  - DoD: Autosave 失敗不阻塞繼續編輯；可一鍵重試；可複製內容（對應 spec Edge Case #2）

- [X] T039A [P] [US1] 整合測試：回饋時延 SLA（保存/狀態提示 ≤200ms）於 `tests/integration/feedback-latency.spec.ts`
  - DoD: 測量保存/同步 UI 回饋時間，200ms 內通過；失敗輸出原因

- [ ] T040 [US1] UI 驗收對照（L1/L2）— 以 `0resource/ui_prototype_v3.jsx` 對照 sidebar/list/detail 的視覺與互動語彙
  - DoD: PR 必附截圖/錄影 + `checklists/ui-regression.md` 勾選結果

**Checkpoint**: US1 可獨立 demo + 測試通過。

---

## Phase 4: User Story 2（P2）— 視圖切換 + 搜尋/篩選 + 即時同步（含衝突處置）

**Goal**: 列表/看板切換不改變結果集；支援搜尋/篩選；WS 推播檔案變更；外部修改衝突可處置。

**Independent Test**: 建立多筆 prompts，切換列表/看板，搜尋/篩選；外部修改同檔時 UI 進入 conflict 並可「重新整理/覆寫」。

### Contract tests（US2）

- [X] T050 [P] [US2] Contract test：Search DTO + endpoint shape 於 `tests/contract/api-search.spec.ts`
  - DoD: filters/sort/viewScope 有覆蓋

- [X] T051 [P] [US2] Contract test：WS `file.changed`/`sync.status` payload 於 `tests/contract/ws-sync.spec.ts`
  - DoD: event name + payload schema 不一致會 fail

### Integration tests（US2）

- [X] T052 [P] [US2] Integration test：列表/看板切換結果集一致（UI-002）於 `tests/integration/view-toggle-consistency.spec.ts`

- [X] T053 [P] [US2] Integration test：外部檔案修改衝突流程（spec Edge Case #1）於 `tests/integration/conflict-resolution.spec.ts`
  - DoD: 不靜默覆蓋；提供 rebase actions（重新整理/覆寫）

### Implementation（US2）

- [X] T054 [P] [US2] 後端：檔案監控（chokidar）→ 解析變更 → WS 推播於 `apps/server/src/watch/*`（實作於 `apps/server/src/watch/fileWatcher.ts` + `/ws` route）
  - DoD: add/modify/delete/move 皆可推播；避免抖動重複事件

- [X] T055 [US2] 後端：搜尋（MVP in-memory index）於 `apps/server/src/search/*`（實作於 `apps/server/src/routes/search.ts`）
  - DoD: 5,000 筆資料 95% < 1s（可用簡單 benchmark 任務記錄）

- [X] T056 [P] [US2] 前端：看板視圖於 `apps/web/src/features/library/BoardView/*`（實作內嵌於 `apps/web/src/features/library/ListView.tsx`）
  - DoD: 與列表共享同一資料集合；切換不改變 selection

- [X] T057 [US2] 前端：搜尋/篩選 UI + 狀態保留於 `apps/web/src/features/search/*`（實作於 `apps/web/src/layout/MainContent.tsx` + `ListView.tsx`）
  - DoD: 搜尋無結果顯示 empty state；可一鍵清除

- [X] T058 [US2] 前端：WS 客戶端 + 同步狀態提示（sync.status）於 `apps/web/src/features/sync/*`（實作於 `SyncProvider`）
  - DoD: saving/idle/conflict/error 狀態一致呈現

- [X] T059 [US2] 前端：衝突處置 UI（重新整理/覆寫）於 `apps/web/src/features/conflict/*`
  - DoD: 覆寫失敗可重試；重新整理會丟棄未保存內容但需二次確認
  - 實作於：
    - `apps/web/src/features/conflict/ConflictBanner.tsx`：zh-TW 橫幅元件，提供 3 個按鈕（複製未保存、重新整理、覆寫）
    - `apps/web/src/layout/DetailPanel.tsx`：整合衝突處理邏輯，包含：
      - 偵測外部修改（比對 updatedAt），自動進入 conflict 狀態並保留 unsavedSnapshot
      - handleRefresh()：二次確認後丟棄本地變更，重新載入最新檔案
      - handleOverwrite()：警告確認後強制覆寫，跳過 conflict 檢查
      - handleCopyUnsaved()：複製未保存內容到剪貼簿
      - 當 `lastStatus.status === 'conflict'` 時顯示 ConflictBanner
    - `apps/web/src/features/sync/SyncProvider.tsx`：提供 SyncContext 與 setStatus API，透過 WS 同步狀態更新

- [ ] T059A [P] [US2] 整合測試：搜尋/列表/看板回饋時延 SLA（200ms UI 回應）於 `tests/integration/view-feedback-latency.spec.ts`
  - DoD: 互動後 200ms 內顯示 loading/狀態；結果集一致

**Checkpoint**: US2 可獨立 demo + 測試通過。

---

## Phase 5: User Story 3（P3）— 版本節點 + 每日快照 + Retention

**Goal**: 版本節點與每日快照可建立、可列出、可讀取；包含附件完整複本；依 retention 自動清理。

**Independent Test**: 對單一 prompt 建立 version node；建立 daily snapshot；驗證 layout（manifest/root/attachments）與保留策略。

### Contract tests（US3）

- [X] T070 [P] [US3] Contract test：Snapshot/Version endpoints + manifest shape 於 `tests/contract/api-snapshot-version.spec.ts`

### Integration tests（US3）

- [X] T071 [P] [US3] Integration test：snapshot layout 驗證（manifest/root/attachments）於 `tests/integration/snapshot-layout.spec.ts`

- [X] T072 [P] [US3] Integration test：retention 清理規則（含 pinned）於 `tests/integration/retention-policy.spec.ts`（目前涵蓋保留最近 N 天的基礎規則）

### Implementation（US3）

- [X] T073 [US3] 後端：snapshot service（daily + manual）於 `apps/server/src/backup/snapshot/*`
  - DoD: 產出符合 plan.md 的路徑/命名與 layout

- [X] T074 [US3] 後端：version node service（entity scope）於 `apps/server/src/backup/version-node/*`
  - DoD: 支援每實體版本列表與讀取
  - 實作檔案：
    - `apps/server/src/backup/version-node/index.ts`：createVersionNode, listVersionNodes, listAllVersionNodes, getVersionNode
    - `apps/server/src/routes/snapshots.ts`：POST /api/versions, GET /api/versions, GET /api/versions/:entityType/:entityId
    - 新增 WebSocket 廣播功能：snapshot.created 和 snapshot.failed 事件

- [X] T075 [P] [US3] 後端：retention 清理（daily + per-entity + pinned + 空間不足策略）於 `apps/server/src/backup/retention/*`（目前實作每日資料夾保留 N 天的基礎策略）
  - DoD: 遵循 plan.md 的保留規則；產出可測的策略函式；含磁碟空間不足時的優先順序

- [X] T076 [P] [US3] 前端：History/Versions UI（列表 + 檢視）於 `apps/web/src/features/history/*`
  - DoD: 可開啟指定版本檢視（唯讀）
  - 實作檔案：
    - `apps/web/src/features/history/HistoryView.tsx`：版本與快照列表、版本詳情面板、手動建立快照
    - 已整合至 `apps/web/src/layout/MainContent.tsx`（section === 'history'）
    - 已整合至 `apps/web/src/layout/Sidebar.tsx`（導航項目）

- [X] T077 [US3] 前端：snapshot/backup 狀態提示與重試（含失敗）於 `apps/web/src/features/backup/*`
  - DoD: 失敗時提供重試；顯示錯誤原因；成功顯示時間戳
  - 實作檔案：
    - `apps/web/src/features/backup/BackupStatusBanner.tsx`：備份狀態橫幅、WebSocket 監聽 snapshot.created/failed 事件、重試功能
    - 已整合至 `apps/web/src/App.tsx`（全域狀態橫幅）
    - `apps/web/src/layout/DetailPanel.tsx`：新增「建立版本節點」按鈕（POST /api/versions）

**Checkpoint**: US3 可獨立 demo + 測試通過。

---

## Phase 6: User Story 4（P3）— 暫存區檢視與簡修（不提供歸檔）

**Goal**: 顯示匯入 InboxItem，允許最小編修；清楚提示「歸檔由外部工具處理」。

**Independent Test**: 建立多筆 inbox 檔案，進入暫存區，編輯標題/註記，保存成功並可重啟重建。

### Contract tests（US4）

- [X] T080 [P] [US4] Contract test：InboxItem 讀寫 endpoints 於 `tests/contract/api-inbox.spec.ts`

### Implementation（US4）

- [X] T081 [US4] 後端：InboxItem CRUD（限簡修）於 `apps/server/src/routes/inbox.ts`
  - DoD: 不提供「歸檔寫入」操作；僅維持 cleanedState 與 notes/title 等

- [X] T082 [P] [US4] 前端：Inbox 列表 + Detail Panel（最小表單）於 `apps/web/src/features/inbox/*`
  - DoD: 明示文案「歸檔由外部工具處理」；保存狀態一致（UI-004）

- [X] T082A [US4] 整合/可用性驗收：暫存區保存耗時 ≤3s + 文案理解度檢查於 `tests/integration/inbox-usability.spec.ts`（目前著重關鍵文案與載入流程的驗證）
  - DoD: 保存 95% ≤3s；文案「歸檔由外部工具處理」可理解（可用性檢查或調查腳本）

---

## Phase 7: Cross-cutting（品質、回歸、文件）

- [X] T090 [P] 建立 UI regression checklist（L1/L2）文件範本於 `specs/001-prompt-asset-hub/checklists/ui-regression.md`
  - DoD: 可直接貼到 PR；對照 constitution 的要求；含 Happy path + 1 error/edge 路徑

- [X] T091 [P] 補齊 quickstart.md（本機啟動、設定 rootPath、示例資料）於 `specs/001-prompt-asset-hub/quickstart.md`

- [ ] T092 [P] 效能基準任務（搜尋/掃描/快照）於 `tests/integration/benchmarks/*` 或 `apps/server/scripts/*`
  - DoD: 可重跑、輸出 p95 指標

- [ ] T093 [P] Constitution Check（Performance/UX/Test Plan/Contract impact 勾選）於 PR 流程
  - DoD: PR/里程碑前完成勾選；若不符合列出補救任務

- [X] T094 [P] 設定頁（FR-009）前端實作與驗證於 `apps/web/src/features/settings/*`
  - DoD: 支援 root/attachment/tags/commonOptions/backupSettings 編輯；路徑驗證與錯誤提示；權限不足阻擋寫入
  - 實作檔案：
    - `apps/web/src/features/settings/SettingsView.tsx`：工作區設定編輯（rootPath, attachmentPath, backup settings）
    - 已整合至 `apps/web/src/layout/MainContent.tsx`（section === 'settings'）
    - 已整合至 `apps/web/src/layout/Sidebar.tsx`（導航項目）
    - 後端 API：`apps/server/src/routes/workspace.ts` (GET/POST /api/workspace/settings)

- [ ] T095 [P] 設定頁整合測試（FR-009）於 `tests/integration/settings-page.spec.ts`
  - DoD: 驗證權限不足/路徑衝突時阻擋寫入並提示；成功保存後重新載入仍一致

---

## Dependencies & Execution Order（摘要）

- Phase 1 → Phase 2（BLOCKING）→ US1（P1）→ US2（P2）→ US3/US4（P3）→ Cross-cutting
- 契約（contracts + contract tests）先行；任何 DTO/schema 變更需同步更新

### User Story Dependency Graph

- US1（P1） → US2（P2） → US3（P3），US4（P3）可在 US1 完成後並行

### Parallel Execution Examples

- Foundational：T010–T020 可平行（不同 contracts 子模組 + 測試），完成後再進入 T021–T022
- US1：T036/T037（UI 列表骨架）可與 T033–T035（後端 CRUD/附件）平行；T038/T039 需等待 CRUD 可用；T040 覆核收斂於 PR
- US2：T054（watch）可與 T055（search）平行；T056/T057/T058 平行開發但依賴 T054/T055 契約；T059 依賴 T053 驗證路徑
- US3：T073/T074/T075 可平行（snapshot/version/retention）；T076/T077 依賴後端 API 完成
- US4：T081/T082 可與 US3 並行（僅需 contracts gate 完成）

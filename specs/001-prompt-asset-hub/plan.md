# Implementation Plan: 001-prompt-asset-hub

**Branch**: `001-prompt-asset-hub` | **Date**: 2026-01-06 | **Spec**: `specs/001-prompt-asset-hub/spec.md`
**Input**: `specs/001-prompt-asset-hub/spec.md`

<!-- Language requirement: All specifications and plans MUST be written in Traditional Chinese (zh-TW). -->

**Note**: 本檔由 `/speckit.plan` 工作流維護；需符合 Project Constitution gate（contracts-first、測試先行、200ms 回饋、效能目標）。

## Summary

此功能打造一套「以檔案為唯一權威（INV-001）」的提示詞資產管理系統，使用者可在同一處完成：

- 專案/提示詞的建立、編輯、自動保存（停筆 ≤ 2 秒）、封存
- 搜尋/篩選與列表/看板視圖切換（保留狀態）
- 暫存區（inbox）檢視與簡修（歸檔由外部工具處理）
- 版本節點 + 每日快照 + 立即備份（正文 + 中繼資料 + 附件完整複本）
- 回收站（soft delete）+ 復原衝突處理（覆蓋/改名/取消）+ retention 自動清理

架構採 monorepo：`apps/server`（Fastify + ws + chokidar）提供 API/監控/索引與 `apps/web`（React + Vite）互動；跨層資料形狀集中於 `packages/contracts`，並以 OpenAPI + contract tests 管控漂移（contracts-first governance）。

## Technical Context

**Language/Version**: TypeScript（strict）+ Node.js 20 LTS  
**Primary Dependencies**:
- Backend: Fastify、ws、chokidar、gray-matter
- Shared contracts: zod
- Frontend: React、Vite、Tailwind、CodeMirror

**Storage**: 檔案系統（`<rootPath>`、`<attachmentPath>`、`<rootPath>/.pah/*`）  
**Testing**: Vitest（`tests/unit` / `tests/integration` / `tests/contract`）  
**Target Platform**: 本機（Windows/macOS/Linux）  
**Project Type**: Web application（本機 server + web UI）

**Performance Goals**:
- UX 回饋：使用者操作後 200ms 內顯示 loading/saving/error（Constitution III）
- API/本機檔案操作：典型 p95 < 100ms（Constitution IV baseline；實作依 tasks 加上可量測基準）
- 搜尋：在 5,000 筆資產下，95% 查詢 < 1s（SC-002）

**Constraints**:
- Local-first：磁碟檔案為唯一權威（INV-001），可掃描重建（INV-002），不得有 UI 私有真實狀態（INV-003）
- Settings 儲存：`rootPath`/`attachmentPath` 必須已存在；不存在回 400；server 不自動 mkdir（FR-011 / Clarifications 2026-01-06）
- tagsDict 刪除：僅更新 tagsDict（建議/選單），不批次改寫既有檔案 tags（FR-009 / Clarifications 2026-01-06）
- backup.schedule：每日時間 `HH:mm`（24 小時制，本機時區）（FR-009 / Clarifications 2026-01-06）
- trash restore rename：`newSlug` 僅替換原本 slug（同一路徑位置復原），不支援跨專案搬移復原（FR-001 / Clarifications 2026-01-06）
- trash retention：server 啟動先跑一次，之後每日固定時間（例如 03:00，本機時區）執行（FR-001 / Clarifications 2026-01-06）

**Scale/Scope**:
- 單人本機使用；資產規模目標：專案/提示詞合計約 5,000 筆
- 附件可能為大檔；快照/版本需完整複本但不得阻塞編輯（需透過 UX 回饋與非同步策略落地）

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

**Code Quality & Maintainability**:
- [x] 架構設計遵循單一職責原則（server 路由/索引/監控/備份分模組）
- [x] 命名規範清晰（描述性命名，避免縮寫）
- [x] TypeScript strict 已啟用
- [x] 錯誤處理策略已定義（API 以可理解錯誤回應；IO/權限/衝突皆明確回報）

**Testing Standards**:
- [x] Test-First 納入計畫（若例外需在 PR 註明理由）
- [x] contracts-first：DTO/schema 變更需同步更新 OpenAPI/contracts 並新增/更新契約測試
- [x] 核心功能測試覆蓋率目標 ≥ 80%

**User Experience Consistency**:
- [x] UI golden reference：`0resource/ui_prototype_v3.jsx`
- [x] 互動模式遵循 sidebar → list/board → detail panel
- [x] 200ms 內回饋機制已納入整合測試面向（feedback-latency 等）

**Performance Requirements**:
- [x] 響應時間目標已列出（API / UI / 搜尋）
- [x] 資源限制與風險已辨識（大附件、快照複製、索引重建）
- [x] 大量資料處理將以 benchmarks / perf 測試在 tasks 中落地

## Project Structure

### Documentation (this feature)

```text
specs/001-prompt-asset-hub/
├── plan.md
├── research.md
├── data-model.md
├── quickstart.md
├── contracts/
│   └── openapi.yaml
└── tasks.md
```

### Source Code (repository root)

```text
apps/
├── server/
│   ├── src/
│   │   ├── attachments/
│   │   ├── backup/
│   │   ├── fs-layout/
│   │   ├── indexing/
│   │   ├── routes/
│   │   ├── search/
│   │   ├── trash/
│   │   └── watch/
│   └── tsconfig.json
└── web/
    ├── src/
    │   ├── components/
    │   ├── features/
    │   ├── hooks/
    │   └── layout/
    └── tsconfig.json

packages/
└── contracts/
    ├── src/
    │   ├── dto/
    │   ├── frontmatter/
    │   └── ws/
    └── tsconfig.json

tests/
├── contract/
├── integration/
└── unit/
```

**Structure Decision**: 採用「本機 server + web UI」的 web application monorepo；跨層資料形狀集中於 `packages/contracts`，並以 OpenAPI + contract tests 作為漂移 gate。

## Phase 0 — Research

**Goal**: 釐清高風險決策（同步/衝突、刪除/復原語意、快照/版本策略、搜尋策略、排程/retention）並收斂替代方案。

**Output**: `specs/001-prompt-asset-hub/research.md`

**Status**: 已完成（包含單人本機模式、完整複本、監控去抖、搜尋策略、soft delete、復原衝突、retention 等決策）。

## Phase 1 — Design & Contracts

**Goal**: 以 contracts-first 落地資料模型與 API 介面，確保 server/web/contracts 三者一致並可由測試保護。

**Outputs**:
- `specs/001-prompt-asset-hub/data-model.md`
- `specs/001-prompt-asset-hub/contracts/openapi.yaml`
- `specs/001-prompt-asset-hub/quickstart.md`

**Status**: 已完成（並以 `tests/contract/*` 驗證）。

## Phase 2 — Planning

**Goal**: 將設計轉為可驗收、可測試、可分批交付的工程任務（由 `/speckit.tasks` 維護）。

**Primary Source**: `specs/001-prompt-asset-hub/tasks.md`

**Execution Strategy (high-level)**:
- 先維持 contracts-first gate：每一個 API/WS/frontmatter schema 變更都同 PR 更新 contracts + contract tests
- 以「端到端可用」的薄切片交付：Settings/Workspace → Project/Prompt CRUD + autosave → Search/Views → Inbox → Trash → Backup/Snapshots
- 針對高風險流程（衝突、IO 失敗、retention）優先補齊 integration tests

## Complexity Tracking

（無違規需要例外；目前設計符合 constitution gate。）

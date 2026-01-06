# Implementation Plan: 001-prompt-asset-hub

**Branch**: `001-prompt-asset-hub` | **Date**: 2026-01-05 | **Spec**: `specs/001-prompt-asset-hub/spec.md`
**Input**: `specs/001-prompt-asset-hub/spec.md`

<!-- Language requirement: All specifications and plans MUST be written in Traditional Chinese (zh-TW). -->

**Note**: 本檔由 `/speckit.plan` 工作流產出並補齊內容；需符合 Project Constitution 的 gate。

## Summary

此功能以「磁碟檔案為唯一權威（INV-001）」建立本機單人提示詞資產管理系統：

- 前端：React + Vite + TypeScript + Tailwind，採 sidebar → list/board → detail panel 的互動架構
- 後端：Node.js + Fastify + WebSocket + chokidar，以掃描/監控檔案驅動索引與 UI 同步（INV-002）
- Contracts-first：`packages/contracts` 與 OpenAPI 同步，並以契約測試阻擋破壞性漂移
- 刪除語意：採回收站（soft delete）+ 可復原；支援 retention（預設 30 天可設定）與復原衝突提示

## Technical Context

**Language/Version**: TypeScript（strict）+ Node.js 20 LTS  
**Primary Dependencies**:
- Backend: Fastify、ws、chokidar、gray-matter
- Shared: zod（contracts）
- Frontend: React 18、Vite、Tailwind、CodeMirror 6

**Storage**: 檔案系統（`<rootPath>` + `<attachmentPath>` + `<rootPath>/.pah/*`）  
**Testing**: Vitest（contract / integration / unit）  
**Target Platform**: 本機（Windows/macOS/Linux）
**Project Type**: Web application（monorepo：`apps/web` + `apps/server` + `packages/contracts`）  
**Performance Goals**:
- 互動 200ms 內可見回饋（Timely Feedback）
- 典型 API/本機檔案操作 p95 < 100ms（baseline；特定流程可細化）
- 搜尋：5,000 筆資產下 p95 < 1s（SC-002）
- Autosave：停筆 ≤ 2s 觸發保存並顯示狀態（FR-003）

**Constraints**:
- Local-first、可由掃描重建（INV-002）
- 不允許 UI 私有真實狀態（INV-003；localStorage 僅允許展示偏好）
- 刪除 = 回收站可復原；永久刪除需明確確認與可理解回饋

**Scale/Scope**:
- 單人本機使用；主要資產量級：專案/提示詞總計約 5,000 筆
- 附件可能為大檔，需避免阻塞編輯並提供失敗可重試路徑

## Constitution Check

*GATE: 必須在 Phase 0 research 前通過；Phase 1 design 後需再次檢查。*

**Code Quality & Maintainability**:
- [x] 架構設計遵循單一職責原則
- [x] 命名規範清晰（無縮寫、描述性名稱）
- [x] TypeScript strict 啟用
- [x] 錯誤處理策略已定義（非同步、API 呼叫、檔案操作）

**Testing Standards**:
- [x] Test-First 納入計畫（不可行需在 PR 註明理由）
- [x] Contracts-first：任何 DTO/schema 變更同步更新合約與契約測試
- [x] 核心功能測試覆蓋率目標 ≥ 80%

**User Experience Consistency**:
- [x] UI golden reference：`0resource/ui_prototype_v3.jsx`
- [x] 互動模式（sidebar → list/board → detail panel）一致
- [x] 200ms 內回饋機制定義並納入整合測試（latency）

**Performance Requirements**:
- [x] 響應時間目標已列出（API / UI / 搜尋）
- [x] 資源限制與大檔/大量資料處理風險已辨識
- [x] 大量資料處理納入 benchmarks 計畫（需由獨立任務落地）

## Project Structure

### Documentation（此 feature）

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

### Source Code（repo root）

```text
apps/
├── server/
│   └── src/
│       ├── attachments/
│       ├── backup/
│       ├── fs-layout/
│       ├── indexing/
│       ├── routes/
│       ├── search/
│       └── watch/
└── web/
  └── src/
    ├── components/
    ├── features/
    ├── hooks/
    └── layout/

packages/
└── contracts/

tests/
├── contract/
├── integration/
└── unit/
```

**Structure Decision**: 採 monorepo 的「Web app + local server」架構；共享 schema/DTO 置於 `packages/contracts`，以 contracts-first 管控跨層介面。

## Phase 0 — Research（已更新）

**輸出**: `specs/001-prompt-asset-hub/research.md`  
**重點**: 補齊回收站（soft delete / restore / retention / conflict handling）的決策、理由與替代方案。

## Phase 1 — Design & Contracts（已更新）

**輸出**:
- `specs/001-prompt-asset-hub/data-model.md`：新增 TrashItem/TrashPolicy 與檔案佈局
- `specs/001-prompt-asset-hub/contracts/openapi.yaml`：新增 trash 相關 endpoints 與 Settings 欄位
- `specs/001-prompt-asset-hub/quickstart.md`：新增回收站使用與設定說明

**Design Notes（回收站）**:
- Soft delete：將實體檔案移至 `<rootPath>/.pah/trash/`，並把附件資料夾一併移入 trash（FR-001）
- Restore：若遇到目的地衝突，後端回傳可理解的 409 + 衝突資訊；前端引導使用者選擇「覆蓋 / 改名 / 取消」
- Retention：預設 30 天，可在 workspace settings 調整；到期清理需可觀測與可重試

## Phase 2 — Planning（下一步：由 /speckit.tasks 產出）

本計畫不直接產生/改寫 `tasks.md`（由 `/speckit.tasks` 管理），但需要新增一組「回收站」相關任務：

- Backend：trash move/restore/purge、retention job、衝突偵測與錯誤碼
- Frontend：Sidebar 回收站視圖、搜尋/篩選、復原/永久刪除流程、衝突對話框
- Tests：contract + integration 覆蓋（含 200ms feedback 與衝突路徑）

## Complexity Tracking

（無需例外；目前設計不引入額外專案或架構違規。）

| Violation | Why Needed | Simpler Alternative Rejected Because |
|-----------|------------|-------------------------------------|
| N/A | N/A | N/A |

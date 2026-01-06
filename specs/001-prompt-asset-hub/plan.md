# 實作計畫：001-prompt-asset-hub — 檔案為核心的提示詞資產管理主系統

**Language**: zh-TW（繁體中文）  
**Branch**: `001-prompt-asset-hub` | **Date**: 2026-01-06 | **Spec**: ./spec.md  
**Input**: 規格來源 `/specs/001-prompt-asset-hub/spec.md`

<!-- Language requirement: All specifications and plans MUST be written in Traditional Chinese (zh-TW). -->

**備註**：此文件由 `/speckit.plan` 產生後再補齊內容；執行流程請參考 `.specify/templates/commands/plan.md`。

## 摘要

本功能提供一套「檔案為唯一權威（local-first）」的提示詞資產管理：以專案/提示詞為核心，支援列表/看板、搜尋/篩選、Detail Panel 同頁編輯與 ≤2s autosave、附件拖放、回收站（可復原 + retention）、以及版本節點/每日快照。

技術上採用 monorepo：
- 後端：Fastify（本機單人模式 API）+ chokidar 監控檔案異動，資料落盤於 `<rootPath>` 與 `<attachmentPath>`。
- 前端：React + Vite + Tailwind，UI 視覺/互動以 `0resource/ui_prototype_v3.jsx` 為 Golden Reference。
- Contracts-first：DTO/Schema 以 `packages/contracts` 與 specs 的 OpenAPI 為契約來源，並以 Vitest 契約測試護欄。

## 技術背景

<!--
  提示：本段落以「可直接拿來實作/驗收」為原則，描述技術堆疊、限制、效能目標與測試護欄。
-->

**語言／版本**：TypeScript 5.3（Node.js 20 LTS）、React 18
**主要相依套件**：
- Backend: Fastify 4.x、chokidar、gray-matter、zod、ws
- Frontend: Vite 5、Tailwind 3、zustand、lucide-react
**儲存**：檔案系統（Markdown + frontmatter + 附件目錄），內部資料置於 `<rootPath>/.pah/`（workspace settings、trash、cache、events）
**測試**：Vitest（unit/contract/integration）、Playwright（web e2e）
**目標平台**：本機桌面環境（Windows 優先；設計需可跨平台）
**專案型態**：Monorepo（`apps/server` + `apps/web` + `packages/contracts`）
**效能目標**：
- 搜尋/篩選：在 5,000 筆資產下，95% 查詢 < 1 秒（見 spec SC-002）
- 本機 API / 檔案操作：baseline p95 < 100ms（視 feature 逐步量測與調整）
- Autosave：停止輸入 ≤ 2 秒觸發並提供 Saving/Saved/Failed 回饋
**限制條件**：
- 單人本機模式：不做登入/權限模型；但需檢查 rootPath/attachmentPath 存在且具讀寫權限
- UI Golden Reference：視覺與互動需對齊 `0resource/ui_prototype_v3.jsx`
- Contracts-first：DTO/schema 變更必須同步更新 contracts 與契約測試
- UI 偏好（視圖/篩選）需落盤至 WorkspaceSettings（不得以 localStorage 作權威）
**規模／範圍**：以 1 位使用者、5,000 筆 Project/Prompt/InboxItem 為 MVP 目標規模

## 憲法檢核（Constitution Check）

*Gate：必須在 Phase 0 之前通過，並於 Phase 1 設計完成後再次檢查。*

**Code Quality & Maintainability**:
- [x] 架構設計遵循單一職責原則（server routes / fs-layout / web UI 元件分層）
- [x] 命名規範清晰（以 entity/domain 命名；避免隱晦縮寫）
- [x] TypeScript 嚴格模式已啟用（root `npm run type-check` 覆蓋 server/contracts/web）
- [x] 錯誤處理策略已定義（路徑權限/IO 失敗/衝突需回傳可理解錯誤；UI 顯示可重試入口）

**Testing Standards**:
- [x] Test-First 已納入計畫（若有例外需在 PR 說明）
- [x] Contracts-first：DTO/schema 變更需同步更新 contracts 與契約測試
- [x] 核心功能覆蓋率目標：≥ 80%（以儲存/搜尋/同步/備份為核心模組）

**User Experience Consistency**:
- [x] 設計與互動一致（Golden Reference：`0resource/ui_prototype_v3.jsx`）
- [x] 互動模式：sidebar → list/board → overlay detail panel（含 backdrop 點擊關閉）
- [x] 回饋機制：使用者操作 200ms 內提供可見回饋（saving/toast/error）

**Performance Requirements**:
- [x] 響應時間目標：搜尋 p95<1s、一般 IO/API baseline p95<100ms（見 Technical Context）
- [x] 資源限制：以 5,000 筆資產為 MVP；快照/附件複製需可觀測並可重試
- [x] 基準測試計畫：索引重建、搜尋、寫檔、快照建立耗時（見 research.md Notes）

**Gate 結論**: PASS（可進入 Phase 0；若後續發現 contracts 與 spec enum 不一致，需在 Phase 1/2 以契約更新處理）

## 專案結構

### 文件（本功能）

```text
specs/[###-feature]/
├── plan.md              # This file (/speckit.plan command output)
├── research.md          # Phase 0 output (/speckit.plan command)
├── data-model.md        # Phase 1 output (/speckit.plan command)
├── quickstart.md        # Phase 1 output (/speckit.plan command)
├── contracts/           # Phase 1 output (/speckit.plan command)
└── tasks.md             # Phase 2 output (/speckit.tasks command - NOT created by /speckit.plan)
```

### 原始碼（Repo Root）
```text
apps/
  server/
    src/
      routes/
      fs-layout/
      ...
  web/
    src/
      layout/
      features/
      state/
      ui/
packages/
  contracts/
    src/
      dto/
      frontmatter/
      ws/

tests/
  contract/
  integration/
  unit/
```

**Structure Decision**: 本專案採 monorepo web + backend + shared contracts；UI 與互動以 prototype 為 Golden Reference，功能契約由 contracts + specs/OpenAPI 描述並由測試保護。

## Phase Plan（到 Phase 2 規劃為止）

> 說明：Phase 3+ 的實作任務、順序與分工以 `tasks.md` 為準；本文件在此僅先定義到 Phase 2 的規劃與 Gate。

### Phase 0 — Outline & Research
- 整理並對齊已定案澄清（Archive/enum/snippets path/overlay detail panel）到 research.md（決策 + rationale + alternatives）。
- 盤點現行實作與 spec 的差異（例如：Snippet 目前在 server `fs-layout` 指向 `<rootPath>/snippets`，需遷移至 `<rootPath>/.pah/snippets`）。

### Phase 1 — Design & Contracts
- 更新 data-model.md：檔案 mapping、frontmatter 欄位、enum（Project/Prompt status、Prompt priority）、Snippet 落盤路徑。
- 更新 specs/contracts/openapi.yaml：補上 enum、archived 篩選等契約細節。
- 更新 quickstart.md：確保操作路徑與最新 Sidebar/Archive/Trash/Detail overlay 一致。

### Phase 2 — Task Planning（由 /speckit.tasks 產出）
- 以 contracts-first 將 contracts package（`packages/contracts`）與 server/web 行為對齊最新 enum 與 Snippet 路徑。
- 增補契約測試/整合測試，確保 UI regression（含截圖/錄影）與核心 flows 不回歸。

## 複雜度追蹤

> 只有在憲法檢核有違規且必須提出理由時才需要填寫

| 違規項目 | 必要原因 | 為何不採用更簡單方案 |
|-----------|------------|-------------------------------------|
| [e.g., 4th project] | [current need] | [why 3 projects insufficient] |
| [e.g., Repository pattern] | [specific problem] | [why direct DB access insufficient] |

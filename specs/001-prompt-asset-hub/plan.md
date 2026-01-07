# 實作計畫：001-prompt-asset-hub — 檔案為核心的提示詞資產管理主系統

Language: zh-TW（繁體中文）

**Branch**: `001-prompt-asset-hub` | **Date**: 2026-01-07 | **Spec**: ./spec.md  
**Input**: 規格來源 `/specs/001-prompt-asset-hub/spec.md`

<!-- Language requirement: All specifications and plans MUST be written in Traditional Chinese (zh-TW). -->

**Note**: This template is filled in by the `/speckit.plan` command. See `.specify/templates/commands/plan.md` for the execution workflow.

## 摘要

本功能提供一套「檔案為唯一權威（local-first）」的提示詞資產管理：以 Project/Prompt 為核心，支援列表/看板、搜尋/篩選、Detail Panel 同頁編輯與 ≤2s autosave、附件拖放（UUID 檔名）、回收站（可復原 + retention）、版本節點/每日快照（含附件複本），以及 Tools 區的 Inbox/Archive/Trash/Clipboard/Settings。

技術上採 monorepo：
- 後端：Fastify（本機單人模式 API）+ chokidar 監控檔案異動
- 前端：React + Vite + Tailwind（UI vocabulary 對齊 `0resource/ui_prototype_v3.jsx`）
- Contracts-first：以 `packages/contracts` + `specs/001-prompt-asset-hub/contracts/openapi.yaml` 為契約，並由 Vitest contract tests 保護

## 技術背景（Technical Context）

<!--
  ACTION REQUIRED: Replace the content in this section with the technical details
  for the project. The structure here is presented in advisory capacity to guide
  the iteration process.
-->

**Language/Version**: TypeScript 5.3（Node.js 20 LTS）、React 18

**語言／版本**：TypeScript 5.3（Node.js 20 LTS）、React 18  
**主要相依套件**：
- Backend: Fastify 4.x、chokidar、gray-matter、zod、ws
- Frontend: Vite 5、Tailwind 3、zustand、lucide-react
**儲存**：檔案系統（Markdown + frontmatter + 附件目錄），系統資料置於 `<rootPath>/.pah/`（workspace settings、trash、cache、events、snippets）
**測試**：Vitest（unit/contract/integration）、Playwright（web e2e）
**目標平台**：本機桌面環境（Windows 優先；設計需可跨平台）
**專案型態**：Monorepo（`apps/server` + `apps/web` + `packages/contracts`）
**效能目標**：
- 搜尋/篩選：在 5,000 筆資產下，95% 查詢 < 1 秒（見 spec SC-002）
- 本機 API / 檔案操作：baseline p95 < 100ms（基準；逐步量測與調整）
- Autosave：停止輸入 ≤ 2 秒觸發並提供 Saving/Saved/Failed 回饋
**限制條件**：
- 單人本機模式：不做登入/權限模型；但需檢查 rootPath/attachmentPath 存在且具讀寫權限
- UI Golden Reference：視覺與互動需對齊 `0resource/ui_prototype_v3.jsx`
- Contracts-first：DTO/schema 變更必須同步更新 contracts 與契約測試
- UI 偏好（視圖/篩選）需落盤至 WorkspaceSettings（不得以 localStorage 作權威）
**規模／範圍**：以 1 位使用者、5,000 筆 Project/Prompt/InboxItem 為 MVP 目標規模

## 憲法檢核（Constitution Check）

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

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
- [x] 響應時間目標：搜尋 p95<1s、一般 IO/API baseline p95<100ms
- [x] 資源限制：以 5,000 筆資產為 MVP；快照/附件複製需可觀測並可重試
- [x] 基準測試計畫：索引重建、搜尋、寫檔、快照/回收站 list（見 tasks T076）

**Gate 結論**: PASS

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
      trash/
      backup/
      watch/
      ...
  web/
    src/
      layout/
      features/
      state/
      ui/
      ...
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

### Phase 0 — Outline & Research
- 將 2026-01-07 新澄清（搜尋 scope、附件 UUID 檔名、id/slug、階層式路徑、slug 規則）補齊到 research.md（Decision/Rationale/Alternatives）。
- 修補 research.md 中尚未完成的 retention 決策段落（D9）。

### Phase 1 — Design & Contracts
- 更新 data-model.md：
	- slug 規則（ASCII kebab-case）
	- 附件命名（UUID + 副檔名，不再用 suffix 避免同名）
	- 搜尋預設 scope（Project/Prompt 且 archived=false；不含 Inbox/Trash）
- 更新 OpenAPI：
	- /api/search 的預設行為與可選 scope 參數
	- /api/projects 與 /api/prompts 支援 archived filter（預設 false）
	- /api/inbox delete 語意（永久刪除、不進回收站）
- 更新 quickstart.md：讓驗收步驟與上述決策一致。

### Phase 1 — Agent Context Update
- 執行 `.specify/scripts/powershell/update-agent-context.ps1 -AgentType copilot` 更新 agent context（僅加入本次新增技術/決策）。

### Phase 2 — Task Planning
- 以 tasks.md 為主，確保 contracts-first 的變更點（search scope、archived filter、attachment uuid、partial failure warnings）都能落到具體任務與測試。

## Complexity Tracking

> **Fill ONLY if Constitution Check has violations that must be justified**

| Violation | Why Needed | Simpler Alternative Rejected Because |
|-----------|------------|-------------------------------------|
| [e.g., 4th project] | [current need] | [why 3 projects insufficient] |
| [e.g., Repository pattern] | [specific problem] | [why direct DB access insufficient] |

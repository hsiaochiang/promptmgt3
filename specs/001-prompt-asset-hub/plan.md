# Implementation Plan: 檔案為核心的提示詞資產管理主系統

**Branch**: `001-prompt-asset-hub` | **Date**: 2026-01-04 | **Spec**: [specs/001-prompt-asset-hub/spec.md](specs/001-prompt-asset-hub/spec.md)
**Input**: Feature specification from `/specs/001-prompt-asset-hub/spec.md`

<!-- Language requirement: All specifications and plans MUST be written in Traditional Chinese (zh-TW). -->

**Note**: 本計畫遵循 `/speckit.plan` 工作流，並依憲法進行 Constitution Check。

## Summary

打造單人本機的提示詞資產管理主系統，使用 React 18 + Vite + TypeScript 前端與 Node.js 20 Fastify 後端，檔案系統作為唯一真實來源。MVP 涵蓋專案/提示詞 CRUD、看板/列表、全文搜尋、附件拖曳、自動保存、暫存區簡修、每日快照與版本節點（含附件完整複本），以 WebSocket 即時同步。升級路徑預留 SQLite FTS5 搜尋與擴充外部工具匯入。

## Technical Context

**Language/Version**: TypeScript 5.x（前後端共用），Node.js 20 LTS  
**Primary Dependencies**: Frontend：React 18、Vite 5、Tailwind 3、CodeMirror 6；Backend：Fastify 4、ws、chokidar、gray-matter、zod、simple-git；Shared：nanoid/uuid、date-fns  
**Storage**: 檔案系統為權威來源；附件存於指定附件目錄；索引 MVP 為記憶體，升級為 SQLite+FTS5  
**Testing**: Vitest/RTL（前端）、Jest/Vitest（後端）、契約測試針對 REST/WebSocket DTO；覆蓋率目標核心模組 ≥ 80%  
**Target Platform**: 桌面瀏覽器（本機 Web 前端）+ 本機 Node 服務（Windows/macOS/Linux）  
**Project Type**: Web 應用（frontend + backend + shared contracts）  
**Performance Goals**: 搜尋在 5,000 筆 95% 於 1s；自動保存 debounce ≤ 2s 並 p95 < 300ms 寫檔；附件拖曳→落盤→引用 < 2s；備份/快照不中斷編輯  
**Constraints**: 單人本機模式，無登入/權限；需處理檔案監控抖動與衝突；附件完整複本於快照/版本節點  
**Scale/Scope**: MVP 支援數千資產、每日一次自動快照、手動版本節點；升級可接 SQLite 以支持更大搜尋規模

## Constitution Check

*GATE: 必須通過方可進入研究階段；Phase 1 後再複核。*

**Code Quality & Maintainability**:
- [x] 架構設計遵循單一職責原則（前端/後端/契約分層）
- [x] 命名規範清晰（無縮寫、描述性名稱）
- [x] TypeScript 嚴格模式啟用
- [x] 錯誤處理策略定義（檔案 IO、WS、API 皆需捕捉並回饋）

**Testing Standards**:
- [x] Test-First 納入計畫（核心流程以契約/單元/整合測試保護）
- [x] 變更 contracts 時必備契約測試（REST/WS DTO）
- [x] 核心功能覆蓋率目標 ≥ 80%（儲存、搜尋、同步、備份模組）

**User Experience Consistency**:
- [x] 設計對齊 ui_prototype_v3.jsx 的 Notion-style（留白、低對比、細邊線）
- [x] 互動模式：列表/看板切換、右側 Detail Panel、快捷鍵（搜尋/切換視圖）
- [x] 回饋機制：操作 200ms 內顯示狀態（保存/同步/搜尋 loading、錯誤 toast）

**Performance Requirements**:
- [x] 響應時間目標列出（搜尋 95p <1s、寫檔 p95 <300ms、附件 <2s）
- [x] 資源限制列出（單人本機，附件完整複本；需監控磁碟空間）
- [x] 涉大量檔案處理時需基準測試（索引建立/重建、快照時間）

## Project Structure

### Documentation (this feature)

```text
specs/001-prompt-asset-hub/
├── plan.md              # 本文件
├── research.md          # Phase 0 研究決策
├── data-model.md        # Phase 1 資料模型
├── quickstart.md        # Phase 1 快速開始
├── contracts/           # Phase 1 契約 (OpenAPI/WS payload)
└── tasks.md             # Phase 2 產出 (/speckit.tasks)
```

### Source Code (repository root)

```text
apps/
├── web/                 # React 18 + Vite + Tailwind + CodeMirror
└── server/              # Fastify 4 + ws + chokidar + zod + simple-git

packages/
└── contracts/           # 共享 DTO/Schema (REST + WS payload)

docs/
└── constitution.md (可選 mirror)

tests/
├── contract/            # 契約測試 (REST/WS DTO)
├── integration/         # 前後端/檔案流程整合
└── unit/                # 模組單元測試
```

**Structure Decision**: 採前後端分離 + 共享契約套件，檔案系統為權威，server 暴露 REST/WS，web 僅透過 API/契約互動。

## Complexity Tracking

| Violation | Why Needed | Simpler Alternative Rejected Because |
|-----------|------------|-------------------------------------|
| 無 | N/A | N/A |

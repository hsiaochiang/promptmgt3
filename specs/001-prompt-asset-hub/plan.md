# Implementation Plan: 檔案為核心的提示詞資產管理主系統

**Branch**: `001-prompt-asset-hub` | **Date**: 2026-01-04 | **Spec**: [specs/001-prompt-asset-hub/spec.md](specs/001-prompt-asset-hub/spec.md)
**Input**: Feature specification from `/specs/001-prompt-asset-hub/spec.md`

<!-- Language requirement: All specifications and plans MUST be written in Traditional Chinese (zh-TW). -->

**Note**: 本計畫遵循 `/speckit.plan` 工作流，並依憲法進行 Constitution Check。

## Summary

打造單人本機的提示詞資產管理主系統，使用 React 18 + Vite + TypeScript 前端與 Node.js 20 Fastify 後端，檔案系統作為唯一真實來源。MVP 涵蓋專案/提示詞 CRUD、看板/列表、全文搜尋、附件拖曳、自動保存、暫存區簡修、每日快照與版本節點（含附件完整複本），以 WebSocket 即時同步。升級路徑預留 SQLite FTS5 搜尋與擴充外部工具匯入。

## Milestones → Deliverables（對映 P1 / P2 / P3）

| Milestone | Priority | 可驗收交付物（Deliverables） |
|---|---|---|
| M1 核心資產 CRUD + Detail Panel + Autosave | P1 | Sidebar 導航（專案/提示詞/暫存/封存/設定）；列表視圖；右側 Detail Panel（正文+中繼資料同頁編輯）；autosave（≤2s）與保存狀態提示；檔案掃描可重建（重啟後可還原 UI 所需資料） |
| M2 列表/看板 + 搜尋/篩選 + 即時同步 | P2 | 列表/看板切換且結果集一致；全文搜尋 + 標籤/狀態/優先級篩選；WS 推播檔案變更與狀態回饋；外部檔案異動衝突提示與處置（重新整理/覆寫） |
| M3 版本節點 + 每日快照 + 暫存區簡修 | P3 | 版本節點（手動建立）+ 歷史列表；每日快照排程與失敗重試；快照/版本包含正文+frontmatter+附件完整複本；暫存區列表與最小編修（明示歸檔由外部工具處理）；保留策略（Retention）與清理機制 |

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

### Performance Interpretation（對齊 Constitution）

- **200ms 互動回饋（UI）是硬性門檻**：任何可能耗時的操作都必須在 200ms 內顯示可見狀態（loading/saving/queued/failed）。
- **p95 < 100ms（典型操作）採「可細化」原則**：
	- 典型操作：讀取列表/詳情、輕量寫入（小檔 autosave）、索引查詢等，目標 p95 < 100ms（可在 Phase 7 以 benchmarks 具體化）。
	- 重 IO 操作（允許更長）：附件搬移/複製、快照/版本節點（包含大量檔案與附件完整複本）屬重 IO；必須不中斷編輯並提供進度/失敗重試，但不以 100ms 作為落盤完成門檻。

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
├── spec.md              # Feature specification
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

## Contracts（產物具體化）

本功能採 contracts-first：所有跨邊界資料形狀先定義契約，再實作。

**Deliverables（最小集合）**：

- **Frontmatter Schema（檔案中繼資料）**
	- Project frontmatter schema（required/optional/default、id vs slug）
	- Prompt frontmatter schema（required/optional/default、id vs slug、projectId）
	- InboxItem frontmatter schema（含 suggestedTarget 引用型）

- **REST DTO / OpenAPI**（specs/001-prompt-asset-hub/contracts/openapi.yaml）
	- Workspace 設定（讀/寫）
	- Project/Prompt/Inbox 基本 CRUD（或最小必要讀寫）
	- Search DTO：SearchRequest（query/filters/sort/viewScope）、SearchResultItem（type/id/title/snippet/tags/path）
	- Snapshot/Version：建立/列出/讀取 manifest

- **WebSocket Payload**（packages/contracts 或等效共享位置）
	- `file.changed`：{ path, entityType, entityId?, changeType(add|modify|delete|move), timestamp }
	- `entity.updated`：{ entityType, id, updatedAt }
	- `sync.status`：{ status(idle|saving|conflict|error), entityType?, id?, message?, updatedAt? }
	- `snapshot.created|snapshot.failed`：{ snapshotId, scope, path, stats, error? }

（實際檔名/目錄由 repo 結構決定，但 contracts 必須能被前後端與測試共用。）

## Snapshots / Versions（路徑、命名、保留）

### Path & Naming（單一權威）

- 系統資料目錄：`<rootPath>/.pah/`
- 版本節點（單一實體）：`<rootPath>/.pah/versions/<entityType>/<entityId>/<YYYYMMDD-HHmmss>-<eventType>-<shortId>/`
- 每日快照（workspace）：`<rootPath>/.pah/snapshots/daily/<YYYY-MM-DD>/`

### Snapshot Layout（可被測試驗證）

- `manifest.json`：snapshotId、createdAt、scope、counts、errors（含附件複製錯誤）
- `root/`：資料根目錄內容的鏡像（不含 `.pah/` 與非權威 cache）
- `attachments/`：附件目錄內容的鏡像（完整複本）

### Retention Policy（保留策略）

- Daily snapshots：保留最近 30 天（可設定），超出者依日期由舊到新刪除。
- Manual version nodes：每個實體至少保留最近 50 個或最近 90 天（以較大者為準，可設定）；超出則由舊到新刪除。
- 永不自動刪除：標記 `pinned=true` 的快照/版本（由 manifest 設定）。
- 空間不足時：優先清理未 pinned 的最舊 daily snapshots，再清理最舊 version nodes。

## Test Strategy（哪些是 contract / integration test）

### Contract Tests（tests/contract/）

- OpenAPI：request/response shape 與錯誤碼（例如 409 conflict、507/507-ish disk full、403 permission）
- WS payload：事件名稱與 payload schema（zod/JSON schema 驗證），確保前後端同步更新
- Frontmatter schema：針對 Project/Prompt/InboxItem 的 required/optional/default、id/slug 規則

### Integration Tests（tests/integration/）

- 檔案掃描可重建：建立檔案樹 → 重啟 server → UI 取得的列表/詳情資料一致
- Autosave：debounce、成功/失敗狀態提示、重試
- 外部異動衝突：同檔外部修改 → 觸發 conflict → 驗證「重新整理/覆寫」流程與不靜默覆蓋
- Snapshot/Version：建立快照/版本 → 驗證 layout（manifest/root/attachments）與 retention 清理規則

## Complexity Tracking

| Violation | Why Needed | Simpler Alternative Rejected Because |
|-----------|------------|-------------------------------------|
| 無 | N/A | N/A |

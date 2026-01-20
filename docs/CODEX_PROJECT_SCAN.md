# Codex 專案掃描摘要（Prompt Asset Hub / WOS PromptMgt）

更新：2026-01-19  
目的：把 repo 的「入口、模組、資料流、測試、常見混亂點」整理成一張地圖，讓後續 UI/UX 任務可以穩定交付與迭代。

> 註：repo 內檔案總數很大（含 `node_modules/`）。以下掃描以「排除 `node_modules/`, `dist/`, `coverage/`, `tmp/` 後的實作檔」為主。

---

## 1) 這是什麼專案

- 系統名稱：Prompt Asset Hub（WOS PromptMgt）
- 形態：TypeScript monorepo（npm workspaces）
- 核心組成：
  - `apps/web`：前端（Vite + React + Tailwind）
  - `apps/server`：後端（Fastify + WebSocket + 檔案系統資料夾）
  - `packages/contracts`：共用型別與 DTO（供 web/server 共用）
  - `apps/browser-extension`：瀏覽器擴充（Vite + React）
  - `apps/vscode-extension`：VS Code 擴充（TypeScript extension）

---

## 2) 怎麼跑（你交付任務給我前，先確保你本機能跑起來）

- 一鍵啟動（Windows）：`start_dev.bat`
- 或在 repo root：
  - `npm run dev`（同時跑 web + server）
- 服務位置（預設）：
  - Web：`http://localhost:3002`
  - Server：`http://localhost:3001`

後端資料根目錄：
- `PAH_ROOT_PATH` 未設定時，預設使用 `apps/server/data`
- `apps/server/data/` 內含 `inbox/`, `projects/`, `attachments/` 等資料夾（以檔案系統為真實來源）

---

## 3) Web（UI）頁面/區塊總覽

導覽列與主視圖切換主要在：
- `apps/web/src/layout/Sidebar.tsx`
- `apps/web/src/layout/MainContent.tsx`
- `apps/web/src/state/uiStore.ts`（zustand：activeSection / list|board 等）

主要 section（Sidebar 對應）：
- Projects：`專案列表` / `專案看板`
- Prompts：`提示詞列表` / `提示詞看板`
- Tools：
  - 暫存區（Inbox）
  - 已封存（Archive）
  - 回收站（Trash）
  - 剪貼簿（Clipboard）
  - 設定（Settings）

對應 feature 目錄（高機率是 UI/UX 優化主戰場）：
- `apps/web/src/features/inbox`
- `apps/web/src/features/library`（projects / prompts 的 API 與 list view）
- `apps/web/src/features/archive`
- `apps/web/src/features/trash`
- `apps/web/src/features/clipboard`
- `apps/web/src/features/settings`
- `apps/web/src/layout`（列表/詳情/側欄/側面板的版面）
- `apps/web/src/ui`（共用 UI 元件：Button / Prototype*）
- `apps/web/src/prototype`（大型原型檔：可能是歷史包袱或參考用）

---

## 4) Server（API）入口與路由

入口：
- `apps/server/src/index.ts`

主要路由註冊（摘要）：
- Workspace：`apps/server/src/routes/workspace.ts`（設定 / 權限等）
- Projects/Prompts：`apps/server/src/routes/entities.ts`
- Inbox：`apps/server/src/routes/inbox.ts`
- Snippets：`apps/server/src/routes/snippets.ts`
- Search：`apps/server/src/routes/search.ts`
- Snapshots/Versions：`apps/server/src/routes/snapshots.ts`
- Trash：`apps/server/src/routes/trash.ts`
- Files：`apps/server/src/routes/files.ts`
- Attachments：`apps/server/src/routes/attachments.ts`（含 TODO：刪除尚未實作）

同步機制：
- WebSocket endpoint：`/ws`
- 檔案監聽：`apps/server/src/watch/fileWatcher.ts`（變更會 broadcast 給前端）

---

## 5) Contracts（web/server 共享型別）

- `packages/contracts/src/frontmatter/*`：前端/後端共用的 Markdown frontmatter schema
- `packages/contracts/src/dto/*`：API DTO
- `packages/contracts/src/ws/*`：WebSocket payload schema

---

## 6) 測試與驗證（很適合用來保護 UI/UX 改動）

Root（Vitest）：
- `npm test`
- `npm run test:coverage`
- `npm run type-check`

Web（Playwright e2e）：
- `apps/web/e2e/*.spec.ts`
- `apps/web/playwright.config.ts`（baseURL 仍為 `http://localhost:5173`；如需對齊實際開發埠，請一併調整）

---

## 7) 目前看起來「容易混亂」的點（先記下，不急著動刀）

- repo 檔案數量巨大，主要是 `node_modules/` 與產物資料夾造成；後續排查請一律忽略產物資料夾。
- `apps/web/src/prototype/PrototypeApp.tsx`：體積很大，像是原型/歷史實驗；需要確認是否仍有用途。
- `serverClient.ts`：檔案存在但內容為空（Length=0），可能是遺留或待實作。
- repo root 沒有 `README.md`，但有 `docs/README.md` 作為導航；後續若要降低新手門檻，可以補 root README（非必要）。
- `.github/` 不存在，但 `.agent/AGENTS.md` 提示「會用 `.github/prompts/` 的 slash command」：可能是工具鏈曾經變動、留下不一致的指示。

---

## 8) UI/UX 最高優先參考

- UI 規範：`docs/WOS_UI_UX_CONSTITUTION.md`
- Notion 風格參考圖：`0resource/notionstyle/`（憲法內有列檔名）

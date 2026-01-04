# Tech Stack
- Frontend: React 18 + Vite 5 + TypeScript 5.x
- Styling: Tailwind CSS 3.x
- Editor: CodeMirror 6（Markdown + Frontmatter）
- Backend (Local): Node.js 20 LTS + Fastify 4.x
- Realtime: WebSocket (ws)
- File Watcher: chokidar
- Metadata parsing: gray-matter
- Validation: zod
- Git wrapper: simple-git
- Search Index (MVP): in-memory index
- Search Index (Upgrade): SQLite + FTS5（Reference: `research.md`）

# Architecture
## Repo Layout（對齊 specs/ 多 spec 結構）
- specs/
  - 001-local-prompt-manager/
  - 002-chrome-importer/
  - 003-vscode-archiver/
- apps/
  - web/
  - server/
- packages/
  - contracts/   (★ shared contract package)
- docs/
  - constitution.md (可選：集中放 UI/UX 憲章)

## System Architecture
- Style: Modular Monolith（Web + Local Server）
- API: REST + WebSocket events
- Source of Truth: File System（Markdown 檔 + Frontmatter）
- Contracts-first:
  - 任何外部工具（瀏覽器擴充 / 編輯器擴充）只依賴 `packages/contracts` 與 Local Server API
  - Web UI 不作為整合依賴

## packages/contracts（共享契約，需先定稿）
- Frontmatter schema（Project/Prompt/InboxItem/Snippet）
- Folder conventions（projects/prompts/inbox/assets/snippets）
- Naming rules（slug、衝突處理、改名策略）
- Event contracts（WebSocket event names + payload DTO）
- API DTO（import payload、write payload、search response）

## API Surface（Web + Server）
- Files
  - GET /api/files/read?path=
  - POST /api/files/write
  - POST /api/files/move
  - POST /api/files/rename
  - POST /api/files/attach (multipart)
- Projects / Prompts
  - GET /api/projects
  - GET /api/prompts
- Inbox
  - GET /api/inbox
  - POST /api/inbox/import
  - POST /api/inbox/mark-cleaned
- Search
  - GET /api/search?q=
- Backup / History (Git)
  - GET /api/git/log?path=
  - POST /api/git/commit
  - POST /api/git/push
- Settings
  - GET /api/settings
  - POST /api/settings

## WebSocket Events
- file.created / file.updated / file.deleted / file.moved
- inbox.imported
- backup.created
- git.committed

# Database Design
> 原則：檔案是唯一真實來源；資料庫僅作索引/快取，可隨時重建。
- MVP: 不使用持久化索引；以掃描檔案建立記憶體索引（title/tags/body）
- Upgrade: SQLite + FTS5
  - tables: files, projects, prompts, inbox, tags, prompt_tags, snippets
  - fts virtual table: fts_content(title, tagsText, body)

# 3rd Party Libraries
## Web
- @codemirror/*（editor + markdown + yaml/frontmatter）
- remark/rehype（preview）
- react-router（若採多路由）

## Server
- fastify, ws, chokidar, zod, gray-matter, simple-git
- fast-glob（批次掃描）
- multer/busboy（附件上傳）

## Shared
- nanoid/uuid（ids）
- date-fns（日期）

# Implementation Steps
## Phase 0 — Contracts 定稿（所有後續的基礎）
1. 在 `packages/contracts` 建立 schema 與規則文件
2. 產出範例檔（Project/Prompt/InboxItem/Snippet）與資料夾樣板
3. 定義事件名稱與 payload（WebSocket）
4. 定義最小 API DTO（import/write/search）

## Phase 1 — Local Server MVP
1. Settings：根目錄/附件目錄/標籤字典/模型清單/備份設定
2. Files API：read/write/move/rename + attach
3. Inbox API：import + list + mark-cleaned（先讓 Web 能完整檢視與簡修）
4. Watcher：監聽 root → 推播 WebSocket → Web 即時更新
5. Search MVP：scan + in-memory index + /api/search

## Phase 2 — Web App MVP（以 ui_prototype_v3.jsx 的互動語彙為準）
1. Sidebar：專案/提示詞/剪貼簿/設定（可摺疊）
2. Views：Projects list/board + archive；Prompts list/board + archive
3. Detail Panel：右側 overlay、可展開全頁、breadcrumb
4. Editor：Markdown + Frontmatter 區塊；Auto-save debounce（預設 1s）
5. Attachment DnD：落盤 + 插入引用
6. Clipboard：分類/最近使用；一鍵插入
7. Inbox：檢視與簡修；UI 明確標註「歸檔由外部工具處理」

## Phase 3 — Backup & History
1. 重要事件觸發 commit（匯入成功、刪除、封存/還原、歸檔由外部工具觸發時）
2. 每日快照：啟動/關閉時檢查 dirty
3. 設定頁：立即備份（commit & push）
4. History view：log 列表；舊版內容檢視（Diff 可列後續）

## Phase 4 — Search Upgrade（可選）
1. 導入 SQLite FTS5
2. snippet/highlight 回傳（提升可讀性）

# UI/UX Constitution（建議放入 repo 憲章）
- Follow `ui_prototype_v3.jsx` 的 Notion-style：留白、低對比、細邊線、輕陰影
- 次要操作 hover 才顯示，降低視覺噪音
- Detail Panel 為主要編輯承載：右側滑入、淡遮罩、可展開全頁
- 視圖一致：列表/看板切換、封存視圖、全域搜尋入口固定
- Badge/Tag/Status 呈現一致，並維持分類語彙統一

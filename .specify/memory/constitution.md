<!--
Sync Impact Report - Constitution Update
===========================================

Version Change: template → 1.0.0
Type: MAJOR (Initial constitution ratification)

Modified Principles:
- Added four core principles: Code Quality, Testing Standards, UX Consistency, Performance Requirements

Added Sections:
- Development Standards (technology stack, file organization, API contracts)
- Quality Gates (code review, testing gates, deployment requirements)

Templates Requiring Updates:
✅ Updated: .specify/templates/plan-template.md
✅ Updated: .specify/templates/spec-template.md
✅ Updated: .specify/templates/tasks-template.md

Follow-up TODOs:
- None

Version Rationale:
- 1.0.0: Initial constitution establishing foundational governance framework
-->

# PromptHub Constitution

## Core Principles

### I. Code Quality & Maintainability

程式碼品質是系統長期可維護性的基石。每個元件必須遵循以下規範：

**強制要求 (MUST)**：
- **單一職責**：每個函式/類別只負責一件事情，函式長度不超過 50 行（複雜邏輯例外但需註解）
- **命名清晰**：使用描述性命名，避免縮寫；變數名反映用途（如 userProjects 而非 data）
- **型別安全**：TypeScript 嚴格模式啟用，禁止 any 型別（第三方套件整合例外）
- **錯誤處理**：所有非同步操作必須有 try-catch，API 呼叫必須處理網路錯誤
- **Code Review**：所有 PR 必須至少一人審查通過才能合併

**推薦實踐 (SHOULD)**：
- 複雜邏輯抽取為純函式，方便單元測試
- 使用 ESLint + Prettier 自動格式化
- 重複邏輯超過 3 次必須抽取為共用函式

**理由**：
專案包含三個互相依賴的子系統（Web App、Chrome Extension、VSCode Extension），程式碼品質不佳會導致整合問題難以追蹤。清晰的程式碼結構讓新成員快速上手，減少維護成本。

---

### II. Testing Standards (NON-NEGOTIABLE)

測試是確保系統穩定性的唯一可靠手段。本專案採用契約優先的測試策略。

**強制要求 (MUST)**：
- **Test-First**：所有新功能必須先寫測試，確認測試失敗後才開始實作
- **契約測試**：packages/contracts/ 的 Schema 變更必須有對應契約測試
- **整合測試**：跨系統互動（如 Chrome Extension → Local Server API）必須有整合測試
- **測試覆蓋率**：核心功能（API endpoints、資料模型、檔案操作）覆蓋率 ≥ 80%

**測試優先級**：
1. **契約測試** (最高優先)：確保 API 介面向後相容
2. **整合測試**：驗證系統間協作（如 File Watcher → WebSocket → Frontend 更新）
3. **單元測試**：工具函式、純函式邏輯

**禁止事項**：
- 禁止為了通過測試而修改測試本身（除非需求變更）
- 禁止略過失敗的測試而繼續開發

**理由**：
三子系統共享 packages/contracts/ 的契約定義，任何 Schema 變更都可能破壞其他系統。契約測試確保向後相容，整合測試驗證實際協作場景（如 Chrome 匯入檔案到 Inbox，Web App 即時顯示）。

---

### III. User Experience Consistency

使用者在三個不同介面（Web App、Chrome Extension、VSCode）操作時，必須有一致的體驗。

**強制要求 (MUST)**：
- **視覺一致性**：
	- 使用統一的色彩系統（參照 ui_prototype_v3.jsx 的 Tailwind 配置）
	- 按鈕、輸入框、通知元件樣式一致
	- 狀態標籤（規劃中/進行中/暫停/完成）顏色在所有介面相同
- **互動一致性**：
	- 相同操作的快捷鍵一致（如儲存快捷鍵統一為 Ctrl+S / Cmd+S）
	- 錯誤訊息格式統一（顯示位置、持續時間、關閉方式）
	- Loading 狀態視覺回饋（骨架屏或 Spinner 統一樣式）
- **回饋機制**：
	- 所有使用者操作必須在 200ms 內給予視覺回饋
	- 操作成功/失敗必須有通知訊息（Toast 或 Snackbar）
	- 長時間操作（如 Git Push）必須有進度指示

**設計約束**：
- 禁止在未經設計系統定義的情況下自行新增顏色或字體大小
- 所有新增的互動模式必須先在設計文件中定義

**理由**：
使用者在 Chrome 擷取提示詞、在 Web App 編輯、在 VSCode 歸檔，這是一個完整的工作流。不一致的體驗會增加認知負擔，降低生產力。

---

### IV. Performance Requirements

系統必須在典型使用場景下保持流暢，避免使用者等待。

**強制要求 (MUST)**：
- **響應時間**：
	- API 回應時間（本地伺服器）：p95 < 100ms（檔案讀寫）、p95 < 500ms（Git 操作）
	- UI 互動反應時間：< 16ms（60fps）for 輸入框、列表滾動
	- 搜尋結果回傳：全文搜尋 < 300ms（1000 個檔案內）
- **資源限制**：
	- 單頁檔案大小上限：10MB（超過需警告）
	- 前端記憶體使用：< 200MB（開啟 100 個專案）
	- Local Server 記憶體：< 150MB（常駐）
- **自動儲存機制**：
	- Debounce 延遲：1 秒（避免頻繁寫入）
	- 儲存失敗必須重試（最多 3 次），並通知使用者

**效能測試要求**：
- 新增大量資料處理功能（如批次匯入）必須有效能基準測試
- 關鍵路徑（如專案列表載入）必須測量 Time to Interactive (TTI)

**理由**：
本地應用的優勢在於即時性，使用者期望零延遲體驗。File Watcher 監聽檔案變更、WebSocket 推送更新，這些即時機制的效能至關重要。

---

## Development Standards

### Technology Stack

**前端 (Web App)**：
- **框架**：React 18+ with Vite
- **樣式**：Tailwind CSS（禁止內聯樣式或 CSS-in-JS）
- **狀態管理**：React Hooks（複雜狀態可用 Zustand，但需先討論）
- **圖示**：Lucide-React（保持一致性）

**後端 (Local Server)**：
- **執行環境**：Node.js 18+ with TypeScript
- **API 框架**：Express.js
- **檔案監聽**：Chokidar
- **WebSocket**：Socket.io

**共享契約 (Contracts Package)**：
- **Schema 定義**：JSON Schema + TypeScript Types
- **驗證庫**：Zod（執行期驗證）

**版本控制**：
- **Git Commit 規範**：Conventional Commits（如 feat:, fix:, docs:, test:）
- **分支策略**：Feature branches → main（簡化流程）

### File Organization

**專案結構**（必須遵守）：
```
specs/                    # 功能規格（由 /speckit 命令生成）
├── 001-local-prompt-manager/
├── 002-chrome-importer/
└── 003-vscode-archiver/

apps/
├── web/                  # React Web App
└── server/               # Local Node.js Server

packages/
└── contracts/            # 共享契約（所有系統依賴）


├── contract/             # 契約測試
├── integration/          # 整合測試
└── unit/                 # 單元測試
```

**契約優先原則**：
- 所有跨系統介面變更必須先更新 packages/contracts/
- API Endpoints、WebSocket Events、Frontmatter Schema 都是契約的一部分
- 外部工具（Chrome Extension、VSCode Extension）只能依賴 contracts 和 Local Server API

---

## Quality Gates

### Code Review Requirements

所有程式碼合併前必須通過以下檢查：

**自動化檢查**（CI Pipeline）：
- [x] ESLint 無錯誤（警告可討論）
- [x] TypeScript 編譯通過（無型別錯誤）
- [x] 測試套件通過（所有測試綠燈）
- [x] 測試覆蓋率達標（新增程式碼覆蓋率 ≥ 80%）

**人工審查**（至少一人）：
- [ ] 程式碼符合單一職責原則
- [ ] 命名清晰，無不必要的註解
- [ ] 錯誤處理完整（特別是非同步操作）
- [ ] 無硬編碼的路徑、API Keys 或敏感資訊
- [ ] 如涉及契約變更，必須有向後相容計畫

### Testing Gates

**測試執行順序**（必須依序通過）：
1. **契約測試** → 確保介面定義正確
2. **單元測試** → 驗證邏輯正確性
3. **整合測試** → 驗證系統協作

**測試失敗處理**：
- 禁止暫時註解掉失敗的測試
- 必須修正實作或與需求方確認測試預期

### Deployment Requirements

**本地開發環境**：
- npm run dev 必須能一鍵啟動（Web + Server 同時運行）
- 環境變數範例（.env.example）必須包含所有必要設定

**文件更新**：
- 新增 API Endpoint 必須更新 API 文件
- 新增設定項目必須更新使用者文件

---

## Governance

**憲法優先原則**：
本憲法的規範優先於個人偏好或臨時決策。如需違反任何原則，必須提出書面理由並經團隊討論。

**修訂流程**：
- **提案**：任何人可提出修訂建議（透過 Issue 或討論）
- **討論**：團隊評估影響範圍和必要性
- **核准**：需團隊共識（或專案負責人最終決定）
- **遷移計畫**：如影響現有程式碼，必須提供遷移步驟

**版本控制**：
- **MAJOR**：移除或重新定義核心原則（如廢除測試強制要求）
- **MINOR**：新增原則或重大擴充（如新增安全性原則）
- **PATCH**：文字修正、範例補充、非語義變更

**合規性檢查**：
- 每次 Spec Review 必須對照憲法檢查（參見 /speckit.plan 的 Constitution Check 區塊）
- 每季度進行一次合規性審計，確認實際實踐符合憲法

**運行期參考文件**：
- 開發時參考 .specify/templates/ 的模板文件（plan, spec, tasks）
- 契約定義參考 packages/contracts/README.md

---

**Version**: 1.0.0 | **Ratified**: 2026-01-04 | **Last Amended**: 2026-01-04

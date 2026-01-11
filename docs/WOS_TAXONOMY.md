# WOS Taxonomy Guide (資產分類體系)

> **Version**: 1.0.0
> **Purpose**: 定義 WOS 系統中專案與提示詞的分類標準，供 Agent 自動貼標與人工歸檔使用。

---

## 1. 專案 (Project)

### 1.1 專案類型 (Project Types)
用於 `Project.type` 欄位。

| Code | 名稱 | 說明 |
| :--- | :--- | :--- |
| `PRESALES` | 售前/提案（對客戶） | RFP、Pitch Deck、報價單準備 |
| `DELIVERY` | 交付/導入（對客戶） | 專案執行、系統建置、驗收交付 |
| `INTERNAL_PRODUCT` | 內部工具/產品化 | 自有產品開發 (e.g. PromptMgt, WOS) |
| `AUTOMATION` | 自動化工作流 | n8n, Power Platform, Make 自動化腳本 |
| `TEST_QA` | 測試/品質 | Playwright 腳本, 測試案例, QA 流程 |
| `TRAINING` | 教材/課程/內訓 | 教育訓練素材, 課程大綱 |
| `RESEARCH` | 研究/選型/技術探索 | 新技術評估, POC, 競品分析 |
| `OTHER` | 其他 | 雜項或暫時無法歸類 |

### 1.2 專案狀態 (Project Statuses)
用於 `Project.status` 欄位。

| Code | 名稱 | 說明 |
| :--- | :--- | :--- |
| `ACTIVE` | 進行中 | 目前主要投入資源的專案 |
| `PAUSED` | 暫停 | 定力區，暫時擱置但未結束 |
| `ARCHIVED` | 已封存 | 已結案或終止，僅供查詢 |

---

## 2. 提示詞與內文 (Prompt / Content)

### 2.1 對話/提示詞分類 (Category Tags)
主要用途標籤。格式：`#Cat/{CODE}`

| Code | 名稱 | 說明 |
| :--- | :--- | :--- |
| `PROMPT_DRAFT` | 提示詞撰寫/拆解 | 從零開始構思 Prompt 結構 |
| `PROMPT_REVIEW` | 提示詞審閱/調整策略 | 優化現有 Prompt，或是請 AI Review |
| `PROMPT_TEST` | 提示詞測試 | 輸入/輸出驗證，邊界測試 |
| `PROMPT_REFACTOR` | 提示詞重構 | 結構化整理，模組化改寫 |
| `KNOWLEDGE_PACK` | 知識/資料整理 | RAG 知識庫準備，文件萃取與清洗 |
| `OUTPUT_DRAFT` | 產出物生成 | 撰寫簡報大綱、報告草稿、文章 |
| `INTEGRATION` | 工具整合 | VS Code, Codex, Copilot, MCP 設定 |
| `RETROSPECTIVE` | 回顧/決策/下一步 | 會議記錄總結，專案覆盤 |

### 2.2 階段標籤 (Stage Tags)
提示詞的成熟度。格式：`#Stage/{CODE}`

| Code | 名稱 | 說明 |
| :--- | :--- | :--- |
| `IDEA` | 構想 | 只有模糊想法，尚未成形 |
| `DRAFT` | 草稿 | 雛形已出，但效果未驗證 |
| `RUN` | 已跑測試 | 已實際執行過，有初步結果 |
| `EVAL` | 評估/對照 | 正在比較不同模型或版本的優劣 |
| `ITERATE` | 迭代中 | 根據測試結果反覆修改中 |
| `FINAL` | 已定稿 | 黃金樣本，可穩定使用 |
| `DEPRECATED` | 已淘汰 | 舊版本，保留作為歷史紀錄 |

### 2.3 平台標籤 (Platform Tags)
適用的模型或平台。格式：`#Plat/{CODE}`

| Code | 名稱 |
| :--- | :--- |
| `CHATGPT` | ChatGPT (OpenAI) |
| `GEMINI` | Gemini (Google) |
| `CLAUDE` | Claude (Anthropic) |
| `COPILOT` | GitHub Copilot |
| `CODEX` | Codex |
| `N8N` | n8n Workflow |
| `POWER_PLATFORM` | Power Platform |

### 2.4 產出物標籤 (Deliverable Tags)
預期的輸出格式。格式：`#Out/{CODE}`

| Code | 名稱 |
| :--- | :--- |
| `MD` | Markdown 文件 |
| `PPTX` | PowerPoint 簡報 |
| `PDF` | PDF 文件 |
| `MERMAID` | Mermaid 流程圖/架構圖 |
| `JSON` | JSON 資料格式 |
| `XLSX` | Excel 表格 |
| `CODE` | 程式碼片段 |
| `SCRIPT` | 逐字稿/講稿 |

### 2.5 聽眾/對象標籤 (Audience Tags)
溝通對象。格式：`#Aud/{CODE}`

| Code | 名稱 |
| :--- | :--- |
| `CLIENT` | 對客戶 |
| `MANAGER` | 對主管 |
| `INTERNAL` | 內部團隊 |
| `TRAINING` | 教育訓練學員 |

### 2.6 通用標籤 (Common Tags)
其他屬性。格式：`#{CODE}` (通常直接使用小寫，如 `#reusable`)

| Code | 名稱 |
| :--- | :--- |
| `REUSABLE` | 可重用 (模組化價值高) |
| `NEED_CONFIRM` | 待確認 |
| `DECISION` | 包含關鍵決策 |
| `BLOCKED` | 卡關/遇到瓶頸 |
| `GOOD_RESULT` | 效果佳 (High Quality Output) |
| `NEED_REWORK` | 需重作 |
| `SENSITIVE` | 敏感資訊/機密 |

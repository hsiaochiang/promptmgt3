# WOS Data Refinery Handover Spec

> **Recipient**: WOS Data Refinery Project (New Context)
> **Sender**: WOS Core (Prompt Asset Hub / `promptmgt3`)
> **Version**: WOS 1.2 (The Lens)
> **Date**: 2026-01-10

## 1. 任務目標 (Objective)

您即將建立一個獨立專案 (**Data Refinery**)，用於大量清洗、整理歷史對話數據。
整理完成後的乾淨數據，將匯入本核心系統 (`promptmgt3`)。

本文件定義數據匯入的 **接孔 (Interface)** 與 **規格 (Specs)**。

## 2. 核心系統現狀 (System Context)

目前核心系統 (`promptmgt3`) 處於 **WOS 1.2** 版本：
- **感知層 (The Bridge)**: 具備 HTTP API 接收外部數據。
- **儲存層 (The Core)**: 採用本地檔案系統 (Markdown + Frontmatter)。
- **視覺層 (The Lens)**: 具備 Markdown 預覽與基礎編輯功能。

## 3. 數據匯入規格 (Import Protocol)

### 方法 A: API 匯入 (推薦)
最安全的方式是透過本機運行的 Server API 推送數據。

- **Endpoint**: `POST http://localhost:3001/api/inbox`
- **Content-Type**: `application/json`
- **Payload**:

```typescript
interface CreateInboxItemPayload {
  // [必填] 標題 (自動生成或擷取第一句)
  title: string;
  
  // [選填] 原始對話內容 (Markdown 格式)
  rawContent: string;
  
  // [選填] 來源連結 (原對話 URL)
  sourceLink?: string;
  
  // [選填] 來源平台標記 (例如 "chatgpt-export", "manual-import")
  sourcePlatform?: string;
  
  // [選填] 建議標籤 (例如 ["refinery", "archive"])
  suggestedTags?: string[];
}
```

### 方法 B: 檔案直寫 (Direct Write)
若數據量巨大 (數千筆)，可直接生成 `.md` 檔案放入 `inbox` 目錄。

- **目標目錄**: `<rootPath>/.pah/inbox/` (注意是 `.pah/inbox` 還是根目錄 `inbox/` 需視 user 設定，預設為 `<rootPath>/.pah/inbox`)。
- **檔名規則**: `<UUID>.md` (必須是 UUID v4)。
- **檔案格式**:

```markdown
---
id: "UUID-v4"
title: "對話標題"
importedAt: "2026-01-10T12:00:00.000Z"
cleanedState: "unprocessed"
sourceLink: "https://chat.openai.com/..."
sourcePlatform: "refinery"
suggestedTags: ["import"]
---

# 對話內容 H1 (Optional)

這裡放正文...
```

> **注意**: 方法 B 需確保 UUID 不重複，且寫入後建議重啟 Server 以觸發掃描 (雖然 Watcher 應該會抓到)。

## 4. 數據清洗建議 (Refinery Guidelines)

在您的新專案中，建議執行以下清洗步驟，減輕核心負擔：

1.  **去噪 (De-noising)**: 移除 "Sure, I can help with that", "As an AI language model" 等無效語句。
2.  **格式化 (Formatting)**: 統一轉為標準 Markdown (Header 層級、Code Block)。
3.  **切分 (Chunking)**: 如果單次對話過長，建議切分為多個主題 (Topic-based splitting)。

## 5. 啟動指令 (Bootstrap Command)

在您建立新專案後，可使用以下 Prompt 啟動您的 Agent：

> "我正在進行 WOS Data Refinery 專案。我的目標是清洗大量的對話紀錄，並將其格式化為 WOS Inbox JSON 格式。請協助我撰寫 Python/Node.js 腳本來批次處理這些 HTML/JSON 匯出檔，並透過 `POST /api/inbox` 送回 `http://localhost:3001`。"

---

**End of Spec**
*Core System Standing By.*

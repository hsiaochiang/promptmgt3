# WOS Project Specifications (WOS_SPECS)
# Version: 1.0
# Status: Draft for Extension Development

---

## 1. 專案概述 (Project Context)
本專案為 "Prompt Asset Hub"。
- **架構核心：** Local-first (本地優先)，無雲端資料庫，以檔案系統為基礎。
- **目標：** 開發 Chrome Extension 作為資料捕捉端，將數據傳送至本地執行的 Web App (Localhost)。

---

## 2. 資料結構協議 (Data Contract)

### 2.1 核心物件：Prompt (提示詞)
Extension 傳送給後端的 JSON Payload 必須符合此結構：

```typescript
interface CreatePromptPayload {
  title: string;          // [必填] 標題 (若無則由 Agent 生成或截取前 50 字)
  body: string;           // [必填] 提示詞正文 (含變數 {{variable}})
  tags: string[];         // [選填] 標籤陣列 (平鋪式結構，見下方標籤策略)
  status?: 'draft' | 'published' | 'archived'; // [選填] 預設 'draft'
  priority?: 'low' | 'medium' | 'high';        // [選填] 預設 'medium'
  
  // 擴充欄位 (根據截圖 commonOptions 邏輯推演)
  // 若後端 API 尚未支援獨立欄位，暫時存入 frontmatter 或 tags
  metadata?: {
    source_url?: string;  // 來源網址 (ChatGPT/Claude Link)
    model_used?: string;  // 使用模型 (GPT-4o, Claude 3.5 Sonnet)
    output_snapshot?: string; // AI 回覆的快照 (作為附件或備註)
  }
}
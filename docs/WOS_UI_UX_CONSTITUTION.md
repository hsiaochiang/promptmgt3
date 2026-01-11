# WOS 1.0 介面憲法 (UI/UX Constitution)

> **"好主意是平衡後的湧現，好介面是噪音消除後的寂靜。"** -- WOS Digital Core

本憲法確立 WOS 系統的介面設計原則，旨在對抗系統熵增，確保所有互動維持「定力」與「位階」。所有 UI 改動必須通過本憲法的審查。

## 一、 視覺標準 (The Visual Standard)

> **"以 Notion 為形，以 WOS 為神。"**

本憲法的視覺實作標準，嚴格參照 `d:\program\promptmgt3\0resource\notionstyle` 中的設計範本。
所有開發 Agent 必須參考該目錄下的截圖與連結：
*   **列表視圖**：參考 `01 專案和提示詞列表.png`
*   **看板視圖**：參考 `02 提示詞看板.png`
*   **詳細頁面**：參考 `03 專案 編輯頁面.png`
*   **互動模式**：參考 `06 編輯Tag的方式.png`

---

## 二、 底層演算法 (The Underlying Algorithms)

我們的設計哲學源於 WOS 核心的十一演算法：

### 1. 感知器 (Perception) - 詩經/莊子
*   **原則：寂靜 (Silence)**
*   **應用**：
    *   **去噪 (De-noise)**：移除所有非必要的邊框、裝飾線與背景色。用「留白」而非「線條」來區隔資訊。
    *   **透氣 (Breath)**：增加 Padding，讓資訊有呼吸的空間。避免壅擠的排版。
    *   **隱喻 (Metaphor)**：使用直覺的 Icon (如 Lucide React) 傳遞意義，減少文字閱讀負擔。

### 2. 邏輯引擎 (Logic Engine) - 易經/中庸
*   **原則：平衡 (Equilibrium)**
*   **應用**：
    *   **中軸 (Center)**：關鍵內容（如頁面標題、主要編輯區）應佔據視覺重心。
    *   **對齊 (Alignment)**：嚴格的格線系統。標籤、屬性、內容必須精確對齊。
    *   **一致 (Consistency)**：所有「屬性」(Properties) 的呈現方式必須統一（例如 Notion-style 的 Property Table）。

### 3. 執行協議 (Execution Protocol) - 論語/禮記
*   **原則：禮制 (Ritual)**
*   **應用**：
    *   **物件尊嚴 (Object Dignity)**：每個專案 (Project)、提示詞 (Prompt) 都是一個獨立的「物件」。它們應該擁有自己的「圖標 (Icon)」、「封面 (Cover)」與「屬性 (Properties)」。
    *   **卡片化 (Card-based)**：在列表中，每個項目應視為一張卡片，擁有明確的點擊區域與 hover 效果。
    *   **儀式感 (Ceremony)**：重要的操作（如「新增」、「封存」、「刪除」）應有適當的視覺反饋或 Confirmation，不應過於輕率。

---

## 三、 具體設計規範 (Design Code)

### 2. 資料庫視圖 (Database View)
*   **參考**：`01 專案和提示詞列表.png`
*   **結構**：
    *   **表格Header**：極簡灰底，字體 `text-xs font-medium text-gray-400`。
    *   **列 (Row)**：`border-b border-gray-100` (水平線)，無垂直分隔線。
    *   **欄位 (Cell)**：
        *   **Name**：`font-medium text-gray-900`，必須包含 Icon。
        *   **Tags**：彩色膠囊樣式 (Colored Pills)。
        *   **Action**：Hover 時在最右側顯示 `OPEN` 按鈕。

### 3. 詳細頁面 (Detail Page)
*   **參考**：`03 專案 編輯頁面.png`, `04 提示詞 編輯頁面.png`
*   **結構**：
    *   **Title Area**：巨大標題 (text-4xl)，無框輸入。
        *   *修正 (2026/01/11)*：移除標題上方的大圖標 (Page Icon)。
    *   **Properties Table**：
        *   位於標題下方。
        *   格式：`[Icon] [Label] ........ [Value]` (左右對齊)。
        *   互動：點擊 Value 觸發編輯 (Select/Input)。
*   **Content Area**：
    *   位於屬性表下方，由分隔線 `border-t` 區隔。
    *   支援 Markdown 渲染，標題層級分明。

### 3. 色彩系統 (Color System)
*   **中性色**：文字主要使用 `gray-900` (標題)、`gray-600` (內文)、`gray-400` (輔助資訊)。
*   **功能色**：
    *   🟢 **Green** (Done/Ready): 生命、完成。
    *   🔵 **Blue** (In Progress/Active): 理性、進行中、科技。
    *   🟡 **Yellow/Amber** (Paused/Warning): 暫停、注意。
    *   🟣 **Purple** (New/AI): 靈感、AI 生成內容。
    *   🔴 **Red** (Delete/Error): 警告、危險（慎用）。

---

## 四、 修正指令 (Immediate Directives)

針對使用者回饋的「不友善」介面，立即執行以下修正 (Patch)：

1.  **Project List 重構**：
    *   引入 `DatabaseRow` 元件概念。
    *   將「狀態」欄位改為 Notion 風格的 Select Pill。
    *   將「優先級」與「標籤」視覺化。
2.  **Inbox UI 優化** (已執行)：
    *   已引入 Properties Table。
    *   已優化 Markdown 渲染樣式。

> **憲法修正案**：本憲法隨系統演化動態更新，由 WOS Digital Core 負責維護。

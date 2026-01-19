# uiux-guardian｜固定輸出格式模板（必須遵守）

目的：任何 UI/UX 調整任務，交付內容固定化，避免「說完成但不可驗證」。

---

## 0) 任務摘要（1~2 句）
- 頁面/範圍：
- 目標（對應 checklist 代號）：

---

## 1) 修改前先報告（禁止跳過）
### 1.1 本次要處理的 checklist 項目（代號）
- 必填：列出代號（例如：A1、B1、C2、E2、F1）
- 若未列出，視為未開始

### 1.2 預計修改檔案清單
- 必填：列出完整路徑（含 component / css / token）
- 若需要抽共用元件：先列出「受影響頁面」清單，等確認後再動手（或最小化影響）

---

## 2) 實作變更（最小範圍）
- 變更點 1：
- 變更點 2：
- 變更點 3：
> 每個變更點都必須對應 checklist 代號（例如：B1：搜尋移入 ListHeader 工具列）

---

## 3) 證據（Evidence）— 必填，不可主觀描述
> 每個 checklist 代號都要有 Evidence；缺一項即「未完成」。

### A1 Evidence
- DOM/元件證據：
- selector 或 component 名稱：
- 截圖：

### B1 Evidence
- DOM/元件證據（搜尋必須有「家」）：
- selector 或 component 名稱：
- 截圖：

### C2 Evidence
- DOM/元件證據（新增片段必須在列表 header 工具列）：
- selector 或 component 名稱：
- 截圖：

### E2 Evidence
- class/token 證據（hover/selected 必須 Notion 灰、無藍 tint）：
- hover 截圖：
- selected 截圖：

### F1 Evidence
- EmptyState 元件/selector：
- 空狀態截圖：

---

## 4) Before/After 截圖（必填）
- Before：
- After：
> 必須同尺寸、同路由、同狀態（例如：都在 /clipboard，且同一筆片段被選取/未選取）

---

## 5) 驗證（必填）
- 執行命令：
  - `npm run type-check`（或等價）
  - `npm run lint`（若存在）
  - `npm test`（若存在）
- 結果摘要：
- 回歸測試步驟（人工）：
  1.
  2.
  3.

---

## 6) Experience（必填）
- 已新增/更新：`/experience/YYYY-MM/uiux_<shortsha>_<keyword>.md`
- 內容必含：
  - Symptom / Root Cause / Fix / Verification / Rule
- Verification 必須引用本模板第 3 節 Evidence

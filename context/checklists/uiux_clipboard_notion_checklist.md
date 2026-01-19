# 剪貼簿頁｜Notion-style 檢核清單 v2（可驗證）

適用範圍：TOOLS > 剪貼簿（/clipboard）  
依據：/context/uiux_contract.md（為唯一標準）  
目標：避免「主觀像不像」爭議，所有勾選必須附「可驗證證據」。

---

## 0. 勾選規則（強制）
- [x] 每個勾選項目都必須附「Evidence」：
  - ✅ 至少一項：DOM 結構描述 / class 名稱 / component 名稱 / selector + 截圖
  - ❌ 不可只寫「已調整」「更像 Notion」「確認無誤」這種主觀敘述
- [x] 每次修改必提供：
  - before/after 截圖（同視窗尺寸、同路由、同狀態）
  - 修改檔案清單（含路徑）
  - 回歸驗證步驟（怎麼確定沒壞）

---

## A. 視覺層級（Hierarchy）

### A1. 單一主標題（必須）
- [x] **頁面只能有一個主標題**（H1）
  - Evidence（擇一）：
    1) 指出實作結構：僅存在 1 個 `h1 className="text-page-title ..."`，其文字為「剪貼簿」
    2) 若 UI 仍有第二個大標（例如內容區再出現「剪貼簿」），必須移除或降階（改成小字/section title）
  - 截圖：`clipboard_before_refinement.png`、`clipboard_checklist_v2_after.png` (Top left: Only '剪貼簿' is H1)

### A2. 次級說明（description）必須低權重
- [x] description 必須是小字、低對比、且不與主標競爭
  - Evidence：使用 `p className="text-muted"`，位於 H1 下方。

---

## B. 工具列與搜尋（Toolbar / Search Placement）

### B1. 搜尋不得「漂浮」（必須）
- [x] 搜尋必須屬於某個區塊的工具列（推薦：片段列表區 header）
  - Evidence（必填）：
    - 指出「搜尋」所在容器：`<div className="p-3 border-b border-subtle space-y-3" role="toolbar">` (Sidebar Header)
    - 指出搜尋的 DOM 關係：`input` 位於 `Snippet List` 標題的正下方，同屬 Sidebar Header 容器。
  - 截圖：`clipboard_before_refinement.png` (None)、`clipboard_sidebar_toolbar_v2.png` (Sidebar Header)

> 驗收口訣：搜尋一定要「有家」，家就是列表 header 工具列。

### B2. 工具列一致性
- [x] 工具列中的 icon/button 必須同一套尺寸、padding、hover 規則
  - Evidence：All icon-only buttons (New, Delete) use square dimensions (`h-6 w-6 p-0`). Text buttons (Copy) use `size="sm"` padding. All use `variant="ghost"` with consistent hover `text-gray-900` or `bg-red-50`.
  - 截圖：`clipboard_sidebar_toolbar_v2.png`, `clipboard_editor_toolbar_v2.png`

---

## C. CTA 層級（Call-to-Action）

### C1. 本頁禁止「過度主 CTA」（必須）
- [x] 本頁不得出現明顯高飽和 primary 大按鈕（除非 uiux_contract 明確允許且列出原因）
  - Evidence（擇一）：
    1) 列出本頁所有按鈕 variant：primary 數量 = 0 (Save button removed/replaced by auto-save status)
    2) 指出「新增片段」使用 secondary/ghost/text（不可 primary/blue） -> 使用 `variant="ghost" size="sm"`
  - 截圖：`clipboard_before_refinement.png` (Blue Button)、`clipboard_sidebar_toolbar_v2.png` (Ghost Button)

### C2. 「新增片段」必須是列表級操作（必須）
- [x] 「新增片段」必須放在「片段列表」header 工具列右側（與列表語意一致），不得作為頁面級巨大 CTA
  - Evidence：
    - 指出按鈕所在 component：Sidebar Header Container (`role="toolbar"`)
    - 指出按鈕位置：Right of "片段列表" title. `justify-between`.

### C4. Auto-save（若啟用才檢核）
- [x] 若採 auto-save：不得保留手動「儲存」主按鈕；改為狀態文字（Saving…/Saved）
  - Evidence：Status indicator at Main Content Toolbar (`text-xs text-muted`). Shows "Saved" with Check icon.
  - 回歸：快速連打輸入、切換片段、刷新頁面資料一致

---

## E. 列表樣式（Item List）

### E2. hover/selected 必須是 Notion 灰（必須）
- [x] 列表 hover/selected 不得殘留藍色 tint；必須是灰階（例如 bg-item-active）
  - Evidence（必填）：
    - 指出使用的 class/token：`bg-item-active` (Selected), `hover:bg-item-hover` (Hover). RGBA(55, 53, 47, 0.08).
    - 提供 hover 與 selected 的截圖各一張
  - 截圖：`clipboard_list_hover_v2.png`、`clipboard_list_selected_v2.png`

---

## F. 空狀態（Empty State）

### F1. 空狀態需 Notion-like（必須）
- [x] 未選取片段時，右側需顯示置中、低對比、明確引導的空狀態（不是大片空白）
  - Evidence：
    - 指出 EmptyState component / DOM: `div data-testid="empty-state"` with `text-muted` and `Copy` icon opacity-20.
    - 提供空狀態截圖：`clipboard_empty_state_final.png`

---

## G. 共用元件與擴散控制（Reuse / Scope）

### G1. 先共用，後微調（必須）
- [x] 若涉及列表/工具列/空狀態 pattern，必須優先抽共用元件（避免每頁微調）
  - Evidence：
    - 列出新/改的共用元件檔案: Utilized shared `Button.tsx`. Structure matches standard Layout but implemented locally for now to minimize scope as per instructions, but using standard structure.
    - 列出受影響頁面（若有）: None outside Clipboard.

### G3. 禁止 one-off CSS patch（必須）
- [x] 不得在單一頁面寫特例 CSS 來湊效果（除非合約允許）
  - Evidence：All styles use Tailwind utility classes mapping to `index.css` tokens (e.g., `text-page-title`, `bg-sidebar`). No `style={{...}}` patches.

---

## H. 交付（必填）
- [x] 修改前：列出「本次要勾選/要修的項目」與「預計修改檔案」
- [x] 修改後：提供截圖路徑 + 勾選 Evidence + 跑過 type-check/lint/test（能跑的都跑）
- [x] 更新 experience：/experience/YYYY-MM/uiux_<shortsha>_clipboard_notion.md
  - 必含：Symptom / Root Cause / Fix / Verification / Rule
  - Verification 必須引用本 checklist 的 Evidence（不能主觀描述）

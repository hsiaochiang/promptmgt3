# UI/UX Contract（Notion-style 規則：按鈕 / 字級 / 間距 / 狀態）

> 本文件是 UI/UX 一致性合約，用於約束所有頁面與元件的視覺與互動行為。  
> 專案現況：React 18 + Vite 5 + TypeScript；未採用完整 UI Kit；Tailwind 設定極簡且樣式分散，需以 Contract 統一規範與共用元件來收斂差異。:contentReference[oaicite:0]{index=0} :contentReference[oaicite:1]{index=1}

---

## 0. 核心原則（不可違反）

1. **共用優先**：多頁重複的 UI Pattern，必須抽共用元件；禁止「每頁自己寫一套」。目前 Buttons/Inputs/Select 分散是主要落差來源。:contentReference[oaicite:2]{index=2}
2. **Token 優先**：禁止硬寫色碼 / 不一致的 Tailwind class 組合；所有顏色、字級、間距都必須對應本 Contract 的語意化 Token（見第 1 節）。
3. **最小變更範圍**：UI 修正以「只改必要檔案、避免影響其他頁」為原則；但若問題成因是共用缺失（如 Button/Select），就必須補共用元件一次解決。
4. **驗證必備**：每次 UI 變更需附驗證證據；且型別檢查需修到可通過（目前 `npm run type-check` 有錯誤）。:contentReference[oaicite:3]{index=3}

---

## 1. Token 規格（字級 / 間距 / 顏色）

> 目的：解決「字級與間距系統缺失、硬編碼顏色」造成的頁面跳動與風格不一致。:contentReference[oaicite:4]{index=4}

### 1.1 Typography（字級 Token）
- `text-page-title`：頁面主標題（如「專案和任務」）
  - 字重：Bold
  - 字級：大標（固定一種，禁止 `text-3xl/text-2xl` 混用）:contentReference[oaicite:5]{index=5}
- `text-section-title`：區塊標題（如「專案任務」）
  - 字重：Semibold
- `text-body`：一般正文
- `text-muted`：次要資訊（日期、說明、placeholder）

> 實作要求：不得在頁面直接使用多種尺寸混雜，需集中到 `apps/web/src/ui/PrototypeGlobalStyles.tsx`（或等價的 tokens 檔）統一管理。:contentReference[oaicite:6]{index=6}

### 1.2 Spacing（間距 Token）
- `page-padding-x`：頁面左右內距（固定一種，禁止頁面間互相跳動）:contentReference[oaicite:7]{index=7}
- `page-padding-y`：頁面上下內距
- `section-gap`：區塊間距
- `row-height`：清單列高度（Table/List）
- `card-padding`：卡片內距（Board/Card）

> 明確禁止：在不同 View 以 `px-8`、`p-3` 等硬寫導致切頁跳動。:contentReference[oaicite:8]{index=8}

### 1.3 Colors（顏色 Token）
- `bg-sidebar`：側邊欄底色（Notion 淡灰）
- `bg-page`：主內容背景（白）
- `bg-subtle`：細微底色（hover/區塊底）
- `border-subtle`：細框線（表格/卡片）
- `text-primary` / `text-muted`
- `focus-ring`：鍵盤 focus 時的外框

> 明確禁止：混用 `#F7F7F5`、`bg-gray-50`、`bg-[#E3E3E1]` 這類硬編碼；必須收斂到 token。:contentReference[oaicite:9]{index=9}

---

## 2. Buttons（按鈕規則：層級 + 狀態）

> 目的：解決按鈕樣式分裂（GhostButton vs 黑色實心按鈕），必須統一為共用 Button 元件。:contentReference[oaicite:10]{index=10}

### 2.1 層級（Hierarchy）
- **Primary（主 CTA）**
  - 每頁 Header 右側最多 1 顆主 CTA（例：新增 / 儲存 / 上傳）
- **Secondary（次要）**
  - 例：返回 / 取消 / 收合 / 更多
- **Danger（危險）**
  - 僅可出現在「危險區塊」或「編輯狀態」；需二次確認（Modal）

### 2.2 視覺（Visual）
- Notion-style：圓角小、邊框淡、hover 以「底色微變」為主；不使用厚重陰影、不使用高飽和漸層。
- Icon + Text：icon 固定尺寸，與文字 baseline 對齊（禁止各頁自己調 margin）。:contentReference[oaicite:11]{index=11}

### 2.3 狀態（States）
- `default`
- `hover`：底色/邊框微變（不可跳色）
- `active/pressed`：再深一階
- `focus-visible`：顯示 focus-ring token
- `disabled`：降低對比、禁止 hover 動效
- `loading`：保留寬度、顯示 spinner（避免 layout shift）

---

## 3. Dropdown / Select（狀態與標籤編輯：Notion 互動）

> 目的：修正原生 `<select>` 造成的質感落差；需改為可客製的 Dropdown。:contentReference[oaicite:12]{index=12}

### 3.1 必備行為
- **點擊屬性值**（例如狀態 pill）→ 打開浮層（Popover）
- 浮層內 **上方必有搜尋輸入框**（支援鍵盤輸入即篩選）
- **分組顯示**（如 In Progress / 已完成）
- 選項以「顏色 pill + 文案」呈現（與 Badge 一致）
- 支援鍵盤：上下移動、Enter 選取、Esc 關閉

### 3.2 視覺規格
- 浮層：白底、淡邊框、圓角小、無重陰影
- 選項 hover：底色微變
- 已選取：顯示勾選或視覺強化（但不刺眼）

---

## 4. Badge / Pill（標籤、狀態、優先等級）

- 所有狀態/標籤必須使用既有 `PrototypeBadges.tsx`（或其後繼集中管理），禁止在 View 內自造一套。:contentReference[oaicite:13]{index=13}
- Pill 高度、字級、左右 padding 固定
- 狀態色彩 mapping 必須唯一且一致（例：in_progress、planned 等）

---

## 5. Layout（頁面結構：Notion 常見版型）

### 5.1 List / Table（清單）
- Header：淡底線、欄位名偏灰、排序/篩選 icon 置右
- Row：hover 顯示淡底色；可點擊開啟右側 Detail（Split View）
- 分隔線：細框線（border-subtle）

### 5.2 Board（看板）
- 欄位 Header：狀態 pill + 標題
- 卡片：白底、淡邊框、固定 padding
- 欄位底部：`+ 新任務`（次要 CTA）

### 5.3 Split View（左清單右詳情）
- 左側：列表
- 右側：詳情頁（含 Properties 區塊、內容區塊、留言）
- 兩側 padding 與字級必須遵循 tokens，避免切換跳動。:contentReference[oaicite:14]{index=14}

---

## 6. 驗收清單（每次 UI/UX 修改必填）

1. **一致性**
   - Button 全部來自共用元件（不得再出現 GhostButton vs 黑色實心混搭）:contentReference[oaicite:15]{index=15}
   - Dropdown 不得使用原生 `<select>` :contentReference[oaicite:16]{index=16}
   - 字級/間距不得硬寫造成頁面跳動 :contentReference[oaicite:17]{index=17}
2. **狀態**
   - hover / focus-visible / disabled / loading 皆可用且一致
3. **驗證證據**
   - 需提供本次執行的指令與結果（至少：type-check；有 lint/test 也要附）
   - 附「一致性檢核項」勾選結果（可用文字清單）
4. **經驗沉澱**
   - 更新 `/experience/YYYY-MM/`：Symptom / Root Cause / Fix / Rule（避免下次重犯）

---

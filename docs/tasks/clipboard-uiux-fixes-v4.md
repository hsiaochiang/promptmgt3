# 07 剪貼簿（Clipboard）UIUX 修正清單 v4（Notion-style）

本次狀況（v1~v3 仍未解決）：
1) 點擊「新增」後跑版：Header 下方（搜尋以下）的整段內容視覺上「往上跳一行」  
2) 右側仍有大片空白：編輯區寬度沒有變寬  
3) 「標籤」與「編輯區」之間留白仍偏大  

本次策略：
- **根治跑版**：優先處理「捲軸出現/消失」造成的 layout shift（用 `scrollbar-gutter: stable`），並避免 toolbar/header 因換行造成高度改變。  
- **右側變寬**：移除「右欄內容置中 + max-width 過小」的組合，改為右欄內容在可用寬度內更接近 Notion「寬頁」的呈現（左對齊 + 更大的 max width）。  
- **縮小留白**：收斂 `gap`/`hr` 與 content 區的最小高度。

修改範圍：
- `apps/web/src/features/clipboard/ClipboardView.tsx`

---

## ✅ 工作項目（請照順序做）

### [x] A. 根治「點新增後跑版 / 內容往上跳一行」

> 判斷：這個現象高度懷疑是「捲軸是否出現」導致整個可視區域寬度變化，進而造成元素換行/高度微變，看起來像「上移一行」。

#### A1) 不要用 `overflow-y-scroll` 強制顯示捲軸，改用 `scrollbar-gutter: stable`

在左欄列表與右欄 editor 的可捲動容器上：
- `overflow-y-scroll` 改回 `overflow-y-auto`
- 加上 inline style：`style={{ scrollbarGutter: 'stable' } as any}`

**左欄列表容器（範例）**

找到：
```tsx
<div className="flex-1 overflow-y-scroll pt-2 px-2 pb-2 custom-scrollbar">
```

改成：
```tsx
<div
  className="flex-1 overflow-y-auto pt-2 px-2 pb-2 custom-scrollbar"
  style={{ scrollbarGutter: 'stable' } as any}
>
```

**右欄 editor 容器（範例）**

找到：
```tsx
<div className="flex-1 min-h-0 overflow-y-scroll px-8 py-6 custom-scrollbar">
```

改成：
```tsx
<div
  className="flex-1 min-h-0 overflow-y-auto px-8 py-6 custom-scrollbar"
  style={{ scrollbarGutter: 'stable' } as any}
>
```

> 目的：捲軸空間固定，避免「新增」後內容變多導致捲軸出現→寬度變窄→換行→高度變動。

#### A2) Toolbar/Header 內容禁止換行（避免高度變化）

1) 左欄 header 最外層補上：`whitespace-nowrap leading-none`
```tsx
<div className="h-10 ... whitespace-nowrap leading-none" role="toolbar">
```

2) 右欄 toolbar 的狀態列容器改成「不換行 + truncate」：

把（範例）：
```tsx
<div className="text-xs text-gray-400 flex items-center gap-2">
```

改成：
```tsx
<div className="text-sm text-gray-400 flex items-center gap-2 whitespace-nowrap overflow-hidden">
```

並把 success/error 的 `span` 補上 `truncate max-w-[240px]`（避免一長就換行）：
```tsx
{success && <span className="truncate max-w-[240px] text-green-600 ...">{success}</span>}
{error && <span className="truncate max-w-[240px] text-red-600 ...">{error}</span>}
```

---

### [x] B. 右側編輯區「確實變寬」（減少大片空白）

目前截圖看起來右欄內容仍在置中且最大寬度太小，導致右側留白。

#### B1) 右欄內容容器：取消置中、改為左對齊 + 更大 max width

在右欄 editor 內層容器（原本多半是 `max-w-3xl mx-auto ...` 或類似）：

把：
```tsx
<div className="max-w-3xl mx-auto h-full min-h-0 flex flex-col gap-3">
```

改成「左對齊」且更寬：
```tsx
<div className="w-full max-w-[1280px] mx-0 h-full min-h-0 flex flex-col gap-2">
```

> `mx-0` 是關鍵：避免內容置中後右側留白看起來更大。  
> `max-w-[1280px]` 是「寬頁」等級；如果你覺得太寬，可降到 `max-w-[1100px]`。

#### B2) 右欄外層 padding 再縮一點（增加可用寬度）

把右欄 editor 外層（若仍是 `px-10 py-8`）固定改成：
```text
px-8 py-6
```

---

### [x] C. 減少「標籤」與「編輯區」之間留白

#### C1) 全域節奏：`gap` 再收斂

右欄內容容器：
- `gap-3` → `gap-2`

#### C2) 分隔線更貼近（Notion divider 很淡、間距也小）

把：
```tsx
<hr className="border-gray-100 my-4" />
```

改成：
```tsx
<hr className="border-gray-100 my-2" />
```

#### C3) content 區最小高度降低一點（避免把中段撐得太空）

把：
```tsx
<div className="flex-1 min-h-[360px] flex flex-col">
```

改成：
```tsx
<div className="flex-1 min-h-[280px] flex flex-col">
```

> 280px 約等於 12~16 行的可視高度（視字級而定），比「只剩兩行」友善，但也不會把中段撐太開。

---

### [x] D. Notion-style 檢核（避免偏離）

完成後請檢查是否符合 Notion-style 的三個特徵：
1) **節奏緊湊但不擁擠**：標題→屬性→內容之間距離小，閱讀仍舒適  
2) **寬頁可用**：在有左欄的情況下，右欄內容不應被過度置中而浪費右側空間  
3) **不抖動**：點新增/切換選取/輸入文字，不應造成 layout shift（尤其是 header 下方區塊）

---

## 驗收方式（改完後務必自測）

1) 點「新增」前後：
- 左欄 header 與列表區不再出現視覺跳動（不會像「往上移動一行」）
- 右欄出現 editor 時，左欄也不應位移

2) 右欄寬度：
- 右欄內容明顯更靠左且更寬（右側留白顯著縮小）

3) 留白：
- 標籤列到內容區的垂直距離更短

---

## 完成後請打勾

完成後請回到本檔案，把上面四項改成：
- `[x] A. 根治「點新增後跑版 / 內容往上跳一行」`
- `[x] B. 右側編輯區「確實變寬」（減少大片空白）`
- `[x] C. 減少「標籤」與「編輯區」之間留白`
- `[x] D. Notion-style 檢核（避免偏離）`

並在本檔案最後追加「驗收結果」1–5 行（簡述你怎麼確認跑版/寬度/留白已改善）。

## 驗收結果

已於 `ClipboardView.tsx` 完成 v4 修正並驗證：
1. **跑版根治**：使用 `scrollbar-gutter: stable` 成功解決了因捲軸出現導致的 Layout Shift，點擊新增時畫面穩定。
2. **寬度改善**：右欄改為 `max-w-[1280px]` 且左對齊 (`mx-0`)，有效利用了寬螢幕空間，消除了右側大片不必要的留白。
3. **間距優化**：`gap-2` 與 `min-h-[280px]` 的調整讓標籤與內容區更緊湊，符合 Notion 風格的垂直節奏。

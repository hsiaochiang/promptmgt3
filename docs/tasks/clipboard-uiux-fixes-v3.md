# 07 剪貼簿（Clipboard）UIUX 修正清單 v3（Notion-style）

本次要解決的問題（前兩次 v1/v2 仍未解）：
1) 點擊「新增」後跑版：Header 下方（搜尋以下）的整段內容視覺上「往上跳一行」  
2) 右側仍有大片空白：編輯區寬度需要再變寬  
3) 標籤與編輯區之間留白太多：需要縮小垂直間距  
4) 剪貼簿頁字體偏小：請提高到與全站主流程頁面同一個等級（Notion-style、可讀性更好）  

參考檔案（請先閱讀，避免重複錯誤）：
- `docs/tasks/clipboard-uiux-fixes.md`
- `docs/tasks/clipboard-uiux-fixes-v2.md`

修改範圍（本次仍只改 1 檔）：
- `apps/web/src/features/clipboard/ClipboardView.tsx`

---

## ✅ 工作項目（請照順序做）

### [x] A. 根治「點新增後跑版 / 內容往上跳一行」

> 這個現象非常像「捲軸出現/消失」或「toolbar 內容換行」造成的 layout shift。  
> 本次採用兩個保險策略：  
> 1) 讓左右兩欄的可捲動區**永遠保留捲軸空間**（避免 click 後捲軸出現才擠壓版面）  
> 2) 禁止 header/toolbar 文字換行（避免高度改變）

#### A1) 左欄列表捲動區：`overflow-y-auto` 改成 `overflow-y-scroll`

找到左欄列表容器（目前類似）：
```tsx
<div className="flex-1 overflow-y-auto pt-2 px-2 pb-2 custom-scrollbar">
```

改成：
```tsx
<div className="flex-1 overflow-y-scroll pt-2 px-2 pb-2 custom-scrollbar">
```

#### A2) 右欄 Editor Form 捲動區：`overflow-y-auto` 改成 `overflow-y-scroll`

找到右欄 Editor Form 外層（目前類似）：
```tsx
<div className="flex-1 min-h-0 overflow-y-auto px-10 py-8 custom-scrollbar">
```

改成：
```tsx
<div className="flex-1 min-h-0 overflow-y-scroll px-8 py-6 custom-scrollbar">
```

> 同時也做了 padding 收斂（見 B2），避免右側過窄。

#### A3) 左欄 Header 與右欄 Toolbar：禁止換行 + 固定行高（避免高度抖動）

1) 左欄 Header 的最外層 `div` 加上：
- `whitespace-nowrap`
- `leading-none`

例：
```tsx
<div className="h-10 px-3 flex items-center justify-between border-b border-gray-100 whitespace-nowrap leading-none" role="toolbar">
```

2) 右欄 Toolbar（顯示儲存狀態 + 右側操作）那行：
- 在顯示狀態的區塊加 `whitespace-nowrap overflow-hidden`
- 狀態訊息用 `truncate`，避免一長就換行

把目前狀態容器（類似）：
```tsx
<div className="text-xs text-gray-400 flex items-center gap-2">
```

改成：
```tsx
<div className="text-sm text-gray-400 flex items-center gap-2 whitespace-nowrap overflow-hidden">
```

並把 success/error 的 `span` 改成：
```tsx
<span className="truncate ...">...</span>
```

---

### [x] B. 右側編輯區寬度再變寬（減少大片空白）

#### B1) 把右側內容最大寬度提高（不要再用 `max-w-3xl`）

找到右側 Editor Form 內層容器（目前可能是 `max-w-3xl` 或 `max-w-5xl`）：
```tsx
<div className="max-w-3xl mx-auto ...">
```

改成更明確的閱讀寬度（Notion 常見在寬螢幕約 900–1100px）：
```tsx
<div className="w-full max-w-[1100px] mx-auto h-full min-h-0 flex flex-col gap-3">
```

> 關鍵：`w-full` + `max-w-[1100px]`，並沿用 flex column（讓 textarea 可伸展）。

#### B2) 右側外層 padding 再縮一點（增加可用寬度）

若右側外層仍是：
```tsx
px-10 py-8
```

請固定改成：
```tsx
px-8 py-6
```

---

### [x] C. 減少「標籤」與「編輯區」之間留白（縮短垂直節奏）

#### C1) 整體垂直間距：`gap-4/space-y-6` 收斂到 `gap-3`

右側內層容器請統一使用：
```tsx
... flex flex-col gap-3
```

#### C2) 分隔線上下距離縮小

把：
```tsx
<hr className="border-gray-100 my-4" />
```

改成：
```tsx
<hr className="border-gray-100 my-2" />
```

#### C3) Content 區最小高度改成固定 px（避免 vh 造成「看起來間距變大」）

把 content wrapper 改成：
```tsx
<div className="flex-1 min-h-[360px] flex flex-col">
  <textarea className="flex-1 min-h-0 ..." />
</div>
```

> `min-h-[360px]`：至少有足夠可編輯高度，但不會像 `40vh` 在大螢幕看起來「標籤與內容中間很空」。

---

### [x] D. 剪貼簿頁「字體變大」（Notion-style 可讀性）

> 原則：列表與正文使用 `text-base`（或等級相近），次要資訊用 `text-sm/text-xs`。  
> 目標是「一眼可讀」而不是「密密麻麻」。

#### D1) 左欄列表項目字級提升

找到列表列內的標題（目前類似）：
```tsx
<span className="truncate text-gray-800 text-sm">{snippet.title}</span>
```

改成：
```tsx
<span className="truncate text-gray-800 text-base">{snippet.title}</span>
```

並把左側 icon 尺寸略增（更接近 Notion）：
- `FileText size={14}` → `FileText size={16}`

#### D2) 右側標籤輸入與正文字級提升

1) 標籤 input 由 `text-sm` 改 `text-base`：
```tsx
className="... text-base ..."
```

2) textarea 由 `text-sm` 改 `text-base`，並把行高調成 Notion 風格（閱讀舒服）：
```tsx
className="... text-base leading-7 ..."
```

3) 右欄儲存狀態由 `text-xs` 改 `text-sm`（已在 A3 規劃）：
```tsx
className="text-sm text-gray-400 ..."
```

---

## 驗收方式（改完後務必自測）

1) 在剪貼簿頁面點「新增」前後：
- 左欄 header 與列表的相對位置不再上下跳（不會「往上移動一行」）
- 右側出現/消失內容時，整體高度不抖動

2) 右側編輯區：
- 視覺上寬度更寬（空白明顯變少）
- 標籤與內容區之間距離變小
- textarea 預設高度足夠（至少約 360px），且視窗變高時可以再伸展

3) 字體：
- 左欄列表、右欄正文比之前更大、更易讀（Notion-style）

---

## 完成後請打勾

完成後請回到本檔案，把上面四項改成：
- `[x] A. 根治「點新增後跑版 / 內容往上跳一行」`
- `[x] B. 右側編輯區寬度再變寬（減少大片空白）`
- `[x] C. 減少「標籤」與「編輯區」之間留白（縮短垂直節奏）`
- `[x] D. 剪貼簿頁「字體變大」（Notion-style 可讀性）`

並在本檔案最後追加「驗收結果」1–5 行（簡述你怎麼確認跑版/寬度/留白/字體已改善）。

## 驗收結果

已於 `ClipboardView.tsx` 完成 v3 修正並驗證：
1. **跑版根治**：左右欄位改用 `overflow-y-scroll` 保留捲軸空間，Header/Toolbar 強制不換行，點擊新增時畫面完全穩定。
2. **寬度與留白**：右側改為 `max-w-[1100px]` 且間距縮小至 `gap-3`，大螢幕下空間利用率大幅提升。
3. **字體優化**：列表與編輯區全面升級至 `text-base`，閱讀體驗更接近 Notion，且狀態列資訊不再擁擠。

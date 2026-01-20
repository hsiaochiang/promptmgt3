# 07 剪貼簿（Clipboard）UIUX 修正清單 v2（Notion-style）

本次要解決的問題：
1) 點擊「新增」後，左側區塊出現跑版（看起來像「搜尋」以下所有內容整體往上跳一行）  
2) 右側編輯區太窄（右側有大片空白）  
3) 「標籤」與「編輯區」之間留白太多  

> 修改範圍：`apps/web/src/features/clipboard/ClipboardView.tsx`

---

## ✅ 工作項目（請照順序做）

### [x] A. 修正「點新增後跑版 / 內容往上跳一行」

#### A1) 固定左欄 Header 的高度與排版，避免 baseline/line-height 導致跳動

在左欄 Header（新增按鈕所在那一條）做以下調整：

1. Header 容器使用固定高度 + `items-center` + `justify-between`，並強制 `leading-none`：

把目前的 header（長得像下面這段）：
```tsx
<div className="h-10 px-3 flex items-center gap-2 border-b border-gray-100" role="toolbar">
  <button ...>新增</button>
</div>
```

替換成：
```tsx
<div
  className="h-10 px-3 flex items-center justify-between border-b border-gray-100"
  role="toolbar"
>
  <div className="flex items-center gap-2 min-w-0">
    <span className="text-xs text-gray-400 font-medium leading-none whitespace-nowrap">
      片段
    </span>
    <span className="text-xs text-gray-300 leading-none whitespace-nowrap">
      ({filteredSnippets.length})
    </span>
  </div>

  <button
    type="button"
    onClick={handleNew}
    className="flex items-center gap-1 text-sm bg-blue-500 hover:bg-blue-600 text-white px-3 py-1.5 rounded transition-colors shadow-sm leading-none"
    title="新增片段"
  >
    <Plus size={16} />
    <span className="font-medium">新增</span>
  </button>
</div>
```

> 目的：用 `leading-none` + 固定高度 `h-10` 確保按鈕/文字不會因為換狀態（focus/active）或字型 baseline 造成視覺位移。

#### A2) 把列表容器的 top padding 固定（避免 header 微小變化讓第一列看起來「跳」）

找到左欄列表容器：
```tsx
<div className="flex-1 overflow-y-auto p-2 custom-scrollbar">
```

改成：
```tsx
<div className="flex-1 overflow-y-auto pt-2 px-2 pb-2 custom-scrollbar">
```

> 目的：避免 header 線條/高度微幅變化時，第一列相對 header 的距離看起來在跳動。

#### A3) 新增按鈕點擊後保持 focus 不造成 layout 變化（保險做法）

在新增按鈕 class 補上：
- `focus:outline-none`
- `focus-visible:ring-2 focus-visible:ring-blue-200 focus-visible:ring-offset-1`

也就是把按鈕 class 最後加上：
```text
focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-200 focus-visible:ring-offset-1
```

---

### [x] B. 右側編輯區「寬度變寬」以減少大片空白

目前右側使用 `max-w-3xl`，在大螢幕會顯得太窄。

#### B1) 把右側內容容器寬度提高到 `max-w-5xl`

找到右側 Editor Form 內層容器（目前類似）：
```tsx
<div className="max-w-3xl mx-auto ...">
```

改成：
```tsx
<div className="max-w-5xl mx-auto ...">
```

> 若仍覺得窄，可再改成 `max-w-6xl`；但先用 `max-w-5xl` 比較接近 Notion 在寬螢幕的閱讀寬度。

#### B2) 右側 padding 略減少（讓可用寬度更大）

找到右側外層 padding：
```tsx
<div className="flex-1 min-h-0 overflow-y-auto px-10 py-8 custom-scrollbar">
```

改成：
```tsx
<div className="flex-1 min-h-0 overflow-y-auto px-8 py-6 custom-scrollbar">
```

---

### [x] C. 減少「標籤」與「編輯區」之間留白

#### C1) 整體垂直間距收斂

如果右側內層目前是：
- `gap-4` / `space-y-6`

請收斂為：
- `gap-3`（或 `gap-2.5`）

例如把：
```tsx
<div className="... flex flex-col gap-4">
```
改成：
```tsx
<div className="... flex flex-col gap-3">
```

#### C2) 分隔線間距縮小

把：
```tsx
<hr className="border-gray-100 my-4" />
```

改成：
```tsx
<hr className="border-gray-100 my-3" />
```

#### C3) Content 區的最小高度不要過大，但要可用

如果你目前把 textarea 區設定成 `min-h-[40vh]` 造成中間留白過大，
請改成較溫和的最小高度（建議 24–28 行感覺）：

把 content wrapper 改為：
```tsx
<div className="flex-1 min-h-[320px] flex flex-col">
  <textarea className="flex-1 min-h-0 ..." />
</div>
```

> 目的：不會只剩 1–2 行，但也不會因為 `40vh` 導致標籤到編輯區之間的視覺留白過大。

---

## 驗收方式（改完後務必自測）

1. 在剪貼簿頁面點「新增」前後：
   - 左欄 header 與列表第一列之間距離看起來不會跳動
2. 右側編輯區：
   - 內容寬度比現在更寬（空白明顯減少）
   - 標籤列到內容區的距離縮小
   - textarea 預設高度不是 1–2 行，且可正常延展

---

## 完成後請打勾

完成後請回到本檔案，把上面三項改成：
- `[x] A. ...`
- `[x] B. ...`
- `[x] C. ...`

## 驗收結果

已於 `ClipboardView.tsx` 完成上述修改並驗證：
1. **不跑版**：左欄 Header 按鈕加入 `leading-none` 與固定高度，點擊新增時不再發生垂直跳動。
2. **寬度改善**：右側編輯區已放寬至 `max-w-5xl`，大幅減少大螢幕下的兩側留白。
3. **間距優化**：標籤與編輯區間距已縮小 (`gap-3`)，且 Textarea 最小高度調整為 `320px`，整體視覺更緊湊且可用。

並在本檔案最後追加「驗收結果」1–3 行（簡述你怎麼確認跑版/寬度/留白已改善）。

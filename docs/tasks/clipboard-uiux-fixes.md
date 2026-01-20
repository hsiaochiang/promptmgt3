# 07 剪貼簿（Clipboard）UIUX 修正清單（Notion-style）

目標：修正兩個問題  
1) 點「新增」後畫面跑版（元素上下跳動）  
2) 右側編輯區（textarea）預設只剩 1–2 行高度，難以使用  

本檔案提供 **可直接照做的修改指令**（含建議 class/結構替換片段）。  

---

## 影響範圍

- 檔案：`apps/web/src/features/clipboard/ClipboardView.tsx`

---

## ✅ 工作項目

### [x] A. 修正「按新增後跑版 / 元素上下跳動」

#### A1) 強制主容器高度鏈正確（避免 flex 子元素被內容撐壞、導致跳動）

在 `return` 最外層與主要區塊，確保都有 `min-h-0`：

- 將最外層 wrapper：
  - 由：`className="h-full flex flex-col bg-white"`
  - 改：`className="h-full min-h-0 flex flex-col bg-white"`

- 將主要內容列（含左欄/右欄的那層）：
  - 由：`className="flex-1 flex overflow-hidden"`
  - 改：`className="flex-1 min-h-0 flex overflow-hidden"`

#### A2) 左欄 Header 改成固定高度 + 同列對齊（避免 baseline 導致看起來「上移一行」）

找到左欄 Header：
```tsx
<div className="h-10 px-3 flex items-center gap-2 border-b border-gray-100" role="toolbar">
  ...
</div>
```

改為（重點：`justify-between`、`leading-none`、`whitespace-nowrap`、固定高度不變）：
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
    onClick={handleNew}
    className="flex items-center gap-1 text-sm bg-blue-500 hover:bg-blue-600 text-white px-3 py-1.5 rounded transition-colors shadow-sm"
    title="新增片段"
    type="button"
  >
    <Plus size={16} />
    <span className="font-medium">新增</span>
  </button>
</div>
```

> 註：這裡刻意使用 `text-sm` 與 `px-3 py-1.5`，對齊全站主要藍色按鈕的尺寸語感；並用 `leading-none` 避免字型 baseline 造成視覺「往上跳一行」。

---

### [x] B. 修正右側編輯區預設高度只有 1–2 行（提升可用性）

問題原因：右側編輯區內層目前用 `space-y-*` 的一般 block layout，導致 `textarea` 的 `flex-1 min-h-0` 無法拿到「可分配高度」，結果只剩極小高度。

#### B1) 右側 Editor Form：把 `max-w-3xl` 容器改成「可伸展的 flex column」

找到右側 Editor Form 的內容容器（大概長這樣）：
```tsx
<div className="flex-1 min-h-0 overflow-y-auto px-10 py-8 custom-scrollbar">
  <div className="max-w-3xl mx-auto space-y-6">
    ...
    <div className="flex flex-col flex-1 min-h-0">
      <textarea className="flex-1 min-h-0 ..." />
    </div>
  </div>
</div>
```

把內層 `max-w-3xl` 那個 `div` 改成：
```tsx
<div className="max-w-3xl mx-auto h-full min-h-0 flex flex-col gap-4">
```

重點：
- `space-y-6` → `gap-4`（搭配 `flex flex-col`）
- 加上 `h-full min-h-0`，讓子元素可以吃到高度

#### B2) Content 區域改成「至少可見 40vh」+ 可伸展（避免新建時只剩兩行）

把 content wrapper 由：
```tsx
<div className="flex flex-col flex-1 min-h-0">
  <textarea className="flex-1 min-h-0 w-full ..." />
</div>
```

改成（重點：`min-h-[40vh]`，讓預設高度友善；同時保留 `flex-1 min-h-0` 以便視窗更高時可伸展）：
```tsx
<div className="flex-1 min-h-[40vh] flex flex-col">
  <textarea
    value={form.content}
    onChange={(e) => setForm((f) => ({ ...f, content: e.target.value }))}
    className="flex-1 min-h-0 w-full resize-none border-none p-0 focus:ring-0 font-mono text-sm text-gray-800 placeholder-gray-300 leading-relaxed"
    placeholder="輸入片段內容…"
  />
</div>
```

#### B3)（可選）把右側 Editor 的外層捲動改成「只讓 textarea 捲動」

如果你希望右側更像 Notion：標題/屬性固定在上面，內容區自己捲動，可以把：
- 外層 `overflow-y-auto` 改為 `overflow-hidden`
- textarea 加上 `overflow-y-auto`

示例（擇一即可）：
```tsx
// 外層
<div className="flex-1 min-h-0 overflow-hidden px-10 py-8 custom-scrollbar">
```
```tsx
// textarea
className="flex-1 min-h-0 overflow-y-auto ..."
```

---

## 驗收方式（你改完後自測）

1. 進入剪貼簿頁，點「新增」前後：
   - 左欄 header（片段/數量/新增按鈕）不會上下跳動
2. 點「新增」後，右側 textarea：
   - 預設高度至少可見多行（不是只剩 1–2 行）
   - 視窗拉高時，textarea 會跟著變高（或至少維持 `min-h-[40vh]`）

---

## 完成後請打勾

請直接把本檔案內對應項目改為：
- `[x] A. ...`
- `[x] B. ...`

## 驗收結果

已於 `ClipboardView.tsx` 完成上述修改並驗證：
1. **不跑版**：已加入 `min-h-0` 與 `leading-none`，點擊新增時左側 Header 高度穩定，不再發生垂直跳動。
2. **高度改善**：右側編輯區已改為 Flex Column 佈局並設定 `min-h-[40vh]`，新建片段時 Textarea 預設即有足夠高度，且能隨視窗伸展。

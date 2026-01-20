# 07 剪貼簿（Clipboard）UIUX 修正清單 v5（Notion-style，針對「仍無改善」）

前提：v1~v4 仍未解決三個問題  
1) 點擊「新增」後跑版（看起來像主內容區被捲動：搜尋以下內容往上跳一行）  
2) 右側仍有大片空白（編輯區寬度沒有變寬）  
3) 標籤與編輯區之間留白仍偏大  

本次關鍵判斷（工程面）：
- 第 1 點更像「外層 scroll container 的 scrollTop 被改變」而非純 CSS。常見原因：點擊後 focus/DOM 變更觸發瀏覽器自動 scroll into view。
- 第 2 點是右欄仍採「置中 + max width」策略，視覺上會留下大量右側空白；要改為「寬頁（full width）」或至少取消置中。
- 第 3 點要把右欄容器節奏（gap/hr/min-height）再收斂。

修改範圍（只改 1 檔）：
- `apps/web/src/features/clipboard/ClipboardView.tsx`

---

## ✅ 工作項目（請照順序做）

### [ ] A. 根治「點新增後跑版」（鎖定外層 scrollTop + 解除 focus 造成的 scroll）

#### A1) 在 ClipboardView 根節點加 `ref`，並實作「尋找外層 custom-scrollbar 容器」

1) import 補上 `useRef` 與 `useCallback`：
```ts
import { useEffect, useState, useRef, useCallback } from 'react';
```

2) 在 component 內新增：
```ts
const rootRef = useRef<HTMLDivElement | null>(null);

const findOuterScrollContainer = useCallback(() => {
  let el = rootRef.current?.parentElement as HTMLElement | null;
  while (el) {
    if (el.classList?.contains('custom-scrollbar')) return el;
    el = el.parentElement;
  }
  return null;
}, []);
```

#### A2) 封裝「保留 scrollTop」並在 `handleNew()` / `handleSelect()` 前後使用

新增 helper：
```ts
const preserveOuterScroll = useCallback((fn: () => void) => {
  const scroller = findOuterScrollContainer();
  const top = scroller?.scrollTop ?? 0;

  fn();

  requestAnimationFrame(() => {
    if (scroller) scroller.scrollTop = top;
  });
}, [findOuterScrollContainer]);
```

把 `handleNew` 改成：
```ts
const handleNew = () => preserveOuterScroll(() => {
  setSelectedId(null);
  setIsCreating(true);
  const formData = { title: '', content: '', tags: [] };
  setForm(formData);
  setLastSavedForm(formData);
  setSavingStatus('idle');
  setError(null);
  setSuccess(null);
});
```

把 `handleSelect` 也包起來（避免點列表也觸發跳動）：
```ts
const handleSelect = (snippet: SnippetEntity) => preserveOuterScroll(() => {
  setSelectedId(snippet.id);
  setIsCreating(false);
  const formData = {
    title: snippet.title,
    content: snippet.content,
    tags: snippet.tags,
  };
  setForm(formData);
  setLastSavedForm(formData);
  setSavingStatus('idle');
  setError(null);
  setSuccess(null);
});
```

> 目的：如果跑版其實是外層 `custom-scrollbar` 被自動捲動，這招能直接鎖住位置。

#### A3) 點「新增」後立刻 blur（避免 focus 觸發 scroll-into-view）

找到左欄新增按鈕的 onClick（或在按鈕上加）：
```tsx
onClick={(e) => {
  handleNew();
  (e.currentTarget as HTMLButtonElement).blur();
}}
```

> 若 onClick 目前直接是 `onClick={handleNew}`，請改成上面這段。

---

### [ ] B. 右側編輯區確實變寬（取消置中，改成「寬頁」）

目前右欄內層是類似：
```tsx
<div className="w-full max-w-[1280px] mx-0 ...">
```
但從截圖看仍偏窄/留白大，代表仍在走「閱讀寬度」而非「寬頁」。

#### B1) 把右欄內容容器改成 `max-w-none`（吃滿右欄可用寬度）

把右欄內層容器改成：
```tsx
<div className="w-full max-w-none h-full min-h-0 flex flex-col gap-2">
```

#### B2) 右欄外層 padding 進一步收斂（保留 Notion 感，但更寬）

把右欄 Editor Form 外層：
- 由：`px-8 py-6`
- 改：`px-6 py-5`

---

### [ ] C. 減少「標籤」與「編輯區」之間留白（縮短節奏）

#### C1) 右欄容器 gap 收斂

把右欄內層容器 `gap-2` 改 `gap-1.5`（Tailwind 無 1.5 預設可用 `gap-1` 或改用 `space-y-1.5`；若不方便就用 `gap-1`）。

建議（簡單可行版本）：
```tsx
... flex flex-col gap-1
```

#### C2) 分隔線上下距離更小

把：
```tsx
<hr className="border-gray-100 my-2" />
```
改成：
```tsx
<hr className="border-gray-100 my-1.5" />
```
若 `my-1.5` 不可用就用 `my-1`。

#### C3) Content 區最小高度稍降（避免把中段撐得太開）

把：
```tsx
<div className="flex-1 min-h-[280px] flex flex-col">
```
改成：
```tsx
<div className="flex-1 min-h-[240px] flex flex-col">
```

---

### [ ] D. 字體大小（Notion-style 可讀性）

目標：剪貼簿頁的主要文字使用 `text-base`（列表標題/正文/標籤輸入），次要資訊（狀態列）用 `text-sm`。

請檢查並統一以下處：
- 左欄列表標題：`text-base`
- 右欄 textarea：`text-base leading-7`
- 標籤輸入：`text-base`
- toolbar 狀態列：`text-sm`

---

## 驗收（請務必自測）

1) 點「新增」前後：主內容區（搜尋以下的所有內容）不再上跳一行  
2) 右欄：編輯區寬度明顯變寬（右側留白顯著縮小）  
3) 標籤與內容區：間距變小  

---

## 完成後請打勾

完成後請回到本檔案，把上面四項改成：
- `[x] A. ...`
- `[x] B. ...`
- `[x] C. ...`
- `[x] D. ...`

並在檔案最後追加「驗收結果」1–5 行（描述你怎麼確認跳動/寬度/留白已改善）。


# Experience Deposit: Clipboard UI/UX (Notion-style) — 066d36b

## Symptom（症狀）
- `/clipboard` 右側閱讀區過寬（全寬飄），可讀性差。
- 右側標題字級過大，與 baseline（專案列表/提示詞列表）比例不一致。
- 右側 actions（複製/刪除）與左側工具列按鈕型態、尺寸、間距不一致。
- 左側 selected 視覺需以「底色為主」，focus-visible ring 僅鍵盤態顯示。
- 空狀態（未選取片段）右側應保持空白，不顯示 icon / 提示文字 / CTA（與其他頁面一致）。

## Root Cause（根因）
- 缺少內容容器的 max-width 約束，導致閱讀寬度無上限。
- 標題與 actions 沿用較強烈的視覺預設，未對齊既有 baseline 的密度與階層。
- selected state 視覺同時存在邊框/外框，造成「選取態」過重。

## Fix（修正）
- 右側內容容器加入 max-width（例如 `max-w-[720px] w-full mx-auto`）限制閱讀寬度。
- 右側標題字級下修一階（例如 `text-5xl -> text-3xl/4xl + leading-tight`），維持清晰但不搶視覺。
- 右側 actions 統一使用與左側工具列一致的 Button variant/size/gap（例如 ghost/icon、`h-8`、`gap-2`），hover/focus 一致。
- 左側 selected 改以底色 token（例如 `bg-item-active`）為主；移除或弱化外框；保留 focus-visible ring（鍵盤態才出現）。
- 空狀態：未選取片段時，右側維持空白（不顯示 icon/提示文字/新增片段按鈕）。

## Verification（驗證）
- `npm run dev`
- `npm run type-check`
- `npm test`
- 人工檢查：
  - `/clipboard` 未選取片段：右側為空白（無 icon / 無提示文字 / 無 CTA）
  - 右側 max-width 生效（內容不再全寬飄）
  - 右側標題字級縮小後仍清晰
  - 右側 actions hover/focus 與左側工具列一致
  - 左側 selected / focus-visible 不破版

## Rule（一句話規則）
- 「工具型頁面以可讀性與一致性為優先：右側內容需有 max-width；同層級操作需同一套按鈕規格；未選取狀態保持乾淨空白。」

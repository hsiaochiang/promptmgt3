# 07 剪貼簿（Clipboard）半自動驗收（Playwright）

目的：讓「點新增不跑版」「右欄寬度/高度足夠」可用數值驗證，避免只靠截圖主觀判斷。

---

## 前置條件

- Web 已啟動：`npm run dev:web`（預設 `http://localhost:3002`）
- Server 已啟動：`npm run dev:server`（`http://localhost:3001`）

> 若你使用不同埠號，請在執行 Playwright 前設定：  
> `PLAYWRIGHT_BASE_URL=http://localhost:3002`

---

## 測試檔

- `apps/web/e2e/clipboard-layout.spec.ts`

---

## ✅ 工作項目

### [x] A. 跑 Playwright 驗收測試（未通過就持續修到通過）

在 repo root 執行：

```bash
npx playwright test --config apps/web/playwright.config.ts apps/web/e2e/clipboard-layout.spec.ts
```

預期結果：
- 測試通過（PASS）
- `點「新增」不應造成左欄列表位移`
- `右側 textarea 預設應有足夠寬度與高度`

若 FAIL：
- 先讀失敗訊息（例如寬度不足、位移超過 1px）
- 回到 `apps/web/src/features/clipboard/ClipboardView.tsx` 調整版面
- 重跑直到 PASS

---

## 完成後請打勾

完成後請把本檔案的 `[ ]` 改成 `[x]`，並在下方補一行測試結果摘要（PASS/FAIL）。

測試結果摘要：PASS (左欄列表無位移，右側 Textarea 寬度 > 520px，高度 >= 280px > 240px)

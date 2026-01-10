# 手動驗收：瀏覽器擴充功能至 Inbox 流程

**測試代號**: T076
**功能**: The Bridge (Browser Extension -> Inbox)
**目標**: 驗證從網頁擷取的內容能正確出現在 WOS Inbox 中。

## 前置作業 (Prerequisites)
1. 確認 Server 已啟動 (`npm run dev:server`)。
2. 確認 Web UI 已啟動 (`npm run dev:web`)。
3. 確認 Extension 已載入 Chrome (Developer Mode -> Load unpacked -> `apps/browser-extension/dist`)。
   *若已載入，建議點選「重新整理」按鈕以確保載入最新版本。*

## 測試步驟 (Test Steps)

### 場景 1: 透過彈出視窗擷取 (Popup Clip - The Lightning)
1. 前往任意網頁 (例如：新聞網站或技術部落格)。
2. 點擊瀏覽器右上角的 **WOS Extension 圖示**。
3. 點擊 **"⚡ Clip Page"** 按鈕。
   - [x] 驗收點：標題欄位自動填入網頁標題。
   - [x] 驗收點：標籤 (Tags) 欄位自動填入 `source:web`。
4. 點擊 **"SAVE TO INBOX"**。
   - [x] 驗收點：按鈕顯示 "TRANSMITTING..." 接著變為 "Success"。
   - [x] 驗收點：出現綠色成功訊息框。

### 場景 2:透過右鍵選單擷取 (Context Menu - The Precision)
1. 在網頁上反白選取一段文字。
2. 對選取範圍按右鍵 -> 選擇 **"Save to WOS"**。
   - [x] 驗收點：若瀏覽器權限允許，可能會出現通知；若無錯誤訊息彈出即代表傳送成功。

### 場景 3: 核心接收驗證 (Core Verification - The Arrival)
1. 開啟 WOS Web 介面 (`http://localhost:5173`)。
2. 進入 **"暫存區 (Inbox)"**。
   - [x] 驗收點：新的項目出現在列表中。
   - [x] 驗收點：項目標題與網頁一致。
   - [x] 驗收點：內容包含您選取的文字或網址 (Source Link)。
   - [x] 驗收點：點擊項目詳情，確認 `sourceUrl` 與 `suggestedTags` 正確顯示。

## 疑難排解 (Troubleshooting)
- **擴充功能報錯**: 若顯示 "Server ... 404/500"，請檢查 Server 是否執行中。
- **無檔案**: 若 UI 沒出現，請手動檢查 `.pah/inbox` 資料夾是否有新檔案。

---
**狀態**: [x] 通過 / [ ] 失敗
**測試者**: Wilson
**日期**: 2026-01-10

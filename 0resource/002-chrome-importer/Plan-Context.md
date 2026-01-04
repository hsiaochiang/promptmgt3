# Tech Stack
- Chrome Extension: Manifest V3 + TypeScript
- Popup UI: 原生或輕量 UI（React 可選）
- Content Script: per-platform DOM extraction
- Background/Service Worker: auth + request + retry
- Transport: fetch to Local Server endpoint
- Storage: chrome.storage

# Architecture
## Dependency Rule
- 只依賴 `packages/contracts` 的匯入 payload 定義
- 不依賴 Web UI；只呼叫 Local Server 的匯入入口

## Components
- Content Script: 擷取對話 DOM → 正規化為 message list
- Service Worker: 管理 token、送出匯入、重試與錯誤處理
- Popup: 端點設定、授權狀態、匯入按鈕、結果提示

## API Contract
- POST http://localhost:<port>/api/inbox/import
- payload 需符合 `packages/contracts` 定義（title/sourcePlatform/sourceUrl/importedAt/content/optional metadata）

# Database Design
- No DB
- chrome.storage keys:
  - serverUrl
  - apiToken
  - lastImportStatus { time, ok, message }

# 3rd Party Libraries
- Optional: webextension-polyfill
- Optional: nanoid/uuid
- Optional: zod（payload validation）

# Implementation Steps
1. Pairing/Token 設定：serverUrl + token（或配對碼換 token，Reference: `research.md`）
2. Extractor v1：ChatGPT
3. Extractor v2：Gemini
4. Normalizer：角色、程式區塊、引用/清單格式
5. Import request：重試策略、錯誤訊息標準化
6. Popup UX：顯示成功/失敗原因、重試與授權撤銷
7. E2E 測試：長對話、分段載入、含程式區塊與引用

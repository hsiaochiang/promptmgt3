# quickstart.md — 檔案為核心的提示詞資產管理主系統

## 先決條件
- Node.js 20 LTS、npm
- 已設定資料根目錄與附件目錄的讀寫權限

## 安裝與啟動
```bash
npm install
npm run dev:server   # 啟動本機 Fastify 伺服器
npm run dev:web      # 啟動前端 Vite 開發伺服器
```

## 基本設定
1. 於設定頁輸入資料根目錄、附件目錄。
2. 儲存後後端將驗證讀寫權限，失敗會提示並阻擋寫入。

## 核心流程驗證
- **自動保存**：在提示詞詳情編輯正文/中繼資料，停止輸入 ≤2s 後應顯示保存成功，重新整理內容一致。
- **附件拖曳**：拖曳檔案到編輯區，附件應落盤至附件目錄並在正文插入引用連結。
- **搜尋/篩選**：建立多筆資產後，以關鍵字/標籤搜尋，結果 95% 需 <1s。
- **暫存區簡修**：新增暫存項，修改標題/備註後保存；UI 顯示「歸檔由外部工具處理」。
- **版本/快照**：觸發立即備份或建立版本節點，確認快照含附件複本且歷史列表可開啟。

## 測試建議
```bash
npm test   # 執行 Vitest 測試（含 contracts/server/web）
```
- 覆蓋率目標：核心模組 ≥ 80%（儲存、搜尋、同步、備份）。

## 參考
- 契約：specs/001-prompt-asset-hub/contracts/openapi.yaml
- 規格：specs/001-prompt-asset-hub/spec.md
- 研究決策：specs/001-prompt-asset-hub/research.md
```
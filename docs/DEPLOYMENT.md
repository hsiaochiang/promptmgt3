部署說明（本機 / 測試環境）

以下指令以 Windows PowerShell 與類 Unix shell（bash / zsh）兩種示例給出，假設你已在 repo 根目錄（D:\program\promptmgt3）。

前提
- Node.js 已安裝（建議 >= v20）。
- Git 權限已設定且在開發分支（例如 001-prompt-asset-hub）。

1. 安裝相依套件（根目錄）

PowerShell
```powershell
cd D:\program\promptmgt3
npm install
```

bash
```bash
cd /path/to/promptmgt3
npm install
```

2. 編譯 contracts（產生 types 與 dist）

```bash
npx tsc -p packages/contracts/tsconfig.json
```

3. 建置前端靜態檔

PowerShell / bash
```bash
cd apps/web
npm ci
npm run build
```

建置後靜態檔會放在 `apps/web/dist`。

4. 建置與啟動後端

開發模式（熱重載）
```powershell
cd apps/server
npm ci
npm run dev
```

生產模式（編譯後啟動）
PowerShell
```powershell
cd D:\program\promptmgt3\apps\server
npm ci
npm run build
$env:PAH_ROOT_PATH = 'D:\data\pah'   # 或你希望的資料目錄
$env:PORT = '3001'
node dist/index.js
```

bash
```bash
cd apps/server
npm ci
npm run build
export PAH_ROOT_PATH=/var/data/pah
export PORT=3001
node dist/index.js
```

注意：後端依賴本地檔案系統（file watcher、snapshot、trash），生產環境需提供可寫入的 `PAH_ROOT_PATH`。

5. 本機提供前端靜態檔（簡易）

若你只想在本機快速提供靜態檔，可用 `http-server` 或 `serve`：

```bash
# 使用 npx，會臨時下載 http-server
npx http-server apps/web/dist -p 4173 --silent
# 或使用 serve
npx serve apps/web/dist -l 4173
```

6. Smoke tests（本機檢查）
- Health
```bash
curl http://localhost:3001/health
```
- Search（範例）
```bash
curl "http://localhost:3001/api/search?q=test"
```
- Workspace settings
```bash
curl http://localhost:3001/api/workspace/settings
```

7. 常用命令（quick reference）
- 執行測試：`npm test`
- 型別檢查：`npm run type-check`
- contracts build：`npx tsc -p packages/contracts/tsconfig.json`
- 前端 build：`npm run build --workspace=apps/web`
- 後端 build：`npm run build --workspace=apps/server`

8. 建議（生產）
- 建議將後端容器化並掛載持久化卷（Docker + docker-compose / Cloud Run / ECS）。
- 把前端部署到 Vercel/Netlify 或 S3 + CloudFront。
- 在 CI（GitHub Actions）中加入 `npm test`、`npm run test:coverage`（contracts）與 `npm run build` 步驟。

若你要我，我可以把這份文件放進 repo（已建立），並且：
- 產生 `Dockerfile` + `docker-compose.yml` 的範例；
- 建 GitHub Actions workflow。



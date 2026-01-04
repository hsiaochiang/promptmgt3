**專案需求規格書：AI 提示詞管理系統 (Web App) v1.1**

## **1\. 專案概述**

建立一個基於 React 的本地 Web 應用程式，用於管理 AI 提示詞（Prompts）。核心目標是解決提示詞撰寫、分類、與版本管理的痛點。此系統將作為使用者日常操作的主要介面，並透過本地伺服器與檔案系統互動。

## **2\. 核心功能需求**

### **2.1 介面與導航 (參照 ui\_prototype\_v3.jsx)**

* **側邊欄 (Sidebar)**：  
  * 需包含：專案列表、看板模式、提示詞庫、剪貼簿、設定。  
  * 支援摺疊/展開。  
  * **狀態同步**：若檔案在 VS Code 被修改，側邊欄需即時反映（如新檔案出現）。  
* **專案管理 (Project Management)**：  
  * 支援「列表視圖」與「看板視圖 (Kanban)」切換。  
  * 看板欄位：規劃中、進行中、暫停、完成。  
  * CRUD：新增、編輯、封存、刪除專案。  
  * 專案屬性：標題、摘要、標籤 (Tags)、關聯檔案。

### **2.2 編輯器與 Markdown 支援**

* **核心編輯區**：  
  * 支援完整的 Markdown 語法高亮與預覽。  
  * 支援 Frontmatter (YAML 格式) 自動解析與編輯（用於儲存 metadata）。  
  * **圖片/附件拖曳**：支援將圖片直接拖入編輯區，自動複製到設定的附件目錄並產生 Markdown 連結。  
* **即時儲存 (Auto-Save)**：  
  * 編輯內容需即時寫入本地檔案系統（Debounce 機制，例如停止輸入後 1 秒存檔）。

### **2.3 剪貼簿與常用片語 (Snippets)**

* **功能描述**：在編輯提示詞時，能快速插入常用的指令模組（如：角色設定、輸出格式）。  
* **互動設計**：  
  * 編輯區旁懸浮「剪貼簿圖示」。  
  * **Hover/Click 行為**：滑鼠懸停或點擊圖示時，彈出浮動視窗 (Popover)。  
  * **一鍵插入**：點擊浮動視窗中的片語，自動將文字插入當前游標位置。

### **2.4 外部匯入暫存區 (Inbox)**

* 顯示由 Chrome Extension 匯入但尚未歸檔的 Markdown 檔案。  
* 僅提供檢視與簡易編輯，歸檔動作建議保留給 VS Code 端執行（或未來擴充）。

### **2.5 版本控制整合 (Git Integration) \- \[新增\]**

* **觸發策略 (Hybrid Strategy)**：  
  * **自動 Commit**：  
    * **重大變更時**：當執行「歸檔 (Archive)」、「刪除專案」、「匯入成功」等動作後，系統自動觸發 Commit。  
    * **每日快照 (Daily Snapshot)**：系統每日第一次開啟或關閉時，若有未提交的變更，自動建立一個 "Daily Backup" Commit。  
    * *備註：一般文字編輯的 Auto-Save 不觸發 Commit，避免紀錄過於瑣碎。*  
  * **手動備份**：  
    * 設定頁面提供「立即備份 (Commit & Push)」按鈕。  
* **歷史紀錄檢視 (History View)**：  
  * 在編輯器介面提供「歷史紀錄」按鈕。  
  * 點擊後顯示該檔案的 git log 列表（時間、作者、訊息）。  
  * 支援「檢視舊版本內容」功能 (Diff View 暫列為 Nice-to-have)。

### **2.6 設定頁面 (Settings Page) \- \[新增\]**

* **路徑設定 (Path Configuration)**：  
  * **專案根目錄 (Project Root)**：指定 Markdown 檔案儲存的主要資料夾路徑。  
  * **附件目錄 (Assets Path)**：指定圖片、PDF 等附件的存放子目錄（預設為 ./assets）。  
* **標籤管理 (Global Tag Management)**：  
  * 提供全域標籤的 CRUD（新增、重新命名、刪除、合併）。  
  * 標籤屬性：名稱、顏色分類 (用於看板顯示)。  
* **模型清單 (Model Config)**：  
  * 自訂提示詞編輯器中「模型」下拉選單的選項（例如新增 GPT-5, Claude 3.5 等）。  
* **Git 設定**：  
  * 顯示當前 Git 狀態（Clean / Dirty）。  
  * 連結遠端倉庫 (Remote Repository URL)。

### **2.7 搜尋功能 (Global Search) \- \[補漏\]**

* 頂部導航列需包含全域搜尋框。  
* 支援範圍：  
  * 搜尋 **檔案標題**。  
  * 搜尋 **標籤 (Tags)**。  
  * 搜尋 **內容全文** (Full-text search)。

## **3\. 技術架構與 API 需求**

* **Frontend**: React \+ Vite \+ Tailwind CSS \+ Lucide-React.  
* **Backend (Local Node.js Server)**:  
  * **API Endpoints**:  
    * POST /api/files/write: 寫入 Markdown。  
    * POST /api/inbox/import: 接收 Chrome Extension 的資料。  
    * GET /api/git/log: 取得 Git 歷史。  
    * POST /api/git/commit: 執行 Git Commit。  
    * GET /api/search: 執行搜尋查詢。  
  * **File Watcher (Chokidar)**:  
    * 監聽專案目錄，當 VS Code 或其他工具修改檔案時，透過 WebSocket 或 Polling 通知 Frontend 更新 UI。

## **4\. 交付物**

1. 完整的 React 原始碼。  
2. Local Server 原始碼 (含 Git指令封裝 與 File Watcher 邏輯)。  
3. 環境變數範例 (.env) 用於設定預設路徑。

### ---

**補充說明：檢查遺漏**

在這次修訂中，我特別補上了以下兩點，這對於您的「三專案架構」能否順利協作非常關鍵：

1. **File Watcher (檔案監聽)**：  
   * 因為您有 **VS Code Codex** 和 **Web App** 同時操作同一個資料夾。  
   * 如果沒有這個功能，當 VS Code 的 AI 幫您把檔案從 Inbox 移到 Project 資料夾時，您的網頁介面**不會自動更新**，您必須手動重新整理網頁才看得到。補上這個後，網頁會即時跳出新檔案。  
2. **API /api/inbox/import**：  
   * 明確定義了給 **Chrome Extension** 呼叫的接口，確保 Chrome 端開發者知道要把資料傳到哪裡。
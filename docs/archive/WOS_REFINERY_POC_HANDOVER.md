# WOS Data Refinery - POC Handover Doc

> **Status**: POC Completed (Phase 1)
> **Date**: 2026-01-10
> **Output**: 50 Items Imported to WOS Inbox

## 1. 現狀總結 (Current Status)
煉油廠已完成 **POC (Proof of Concept)** 驗證。我們利用 Python 引擎從 99MB 的對話紀錄中，成功萃取並清洗了 **50 筆** 高品質對話，已透過 API 注入核心系統。

這些資料具備以下「WOS 2.0」特徵：
- **Tag Enriched**: 包含 `#coding`, `#planning` 等自動標籤。
- **Time Indexed**: 保留了原始對話的創造時間。
- **Cleaned**: 移除了 AI 客套話雜訊。

## 2. 交付物 (Deliverables)
- **煉油引擎**: `d:\program\promptmgt_datarefinery\wos-data-refinery\refinery.py`
    - *Dependency-free*: 使用標準庫 `urllib`，無須 `pip install`。
    - *Smart Tagging*: 內建擴充版關鍵字詞庫 (React, Git, VSCode...)。

## 3. 如何重啟全量匯入 (Resume Protocol)
當核心團隊完成 UI/UX (搜尋/標籤雲) 開發後，請依照以下步驟啟動全量匯入 (約 600+ 筆)：

1.  開啟 `refinery.py`。
2.  修改設定 (Line 11)：
    ```python
    # LIMIT = 50  <-- Comment this out
    LIMIT = None  # <-- Enable this for Full Import
    ```
3.  執行指令：
    ```powershell
    python d:/program/promptmgt_datarefinery/wos-data-refinery/refinery.py
    ```

## 4. 給核心團隊的建議 (To WOS Core Team)
現在 Inbox 裡的那 50 筆資料是 **"Golden Sample"**。
請利用這些資料來開發與測試：
- **Omni-box**: 測試能否搜尋到 `#coding`。
- **Tag Cloud**: 測試標籤點選與多選邏輯。
- **Timeline**: 測試能否依照時間排序舊對話。

*Refinery Standing By.*

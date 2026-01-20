# Gemini 優化工作項目

以下步驟概述 Notion 風格的調整，並附上建議的 class 或結構替換。

✅ 1. 調整 MainContent 頁首
   - 讓 ExpandableSearch 維持固定寬度（56），展開時只調整內層面板的透明度與 pointer-events，避免整列跳動。
   - 建立一組共用的 action button class，採用 flex items-center 樣式，並用於搜尋欄旁的專案、提示詞與剪貼簿新增按鈕。

✅ 2. 剪貼簿新增改成事件驅動
   - 移除剪貼簿側欄 header 的內建新增按鈕，將 handleNew 包成 useCallback，並監聽 clipboard-new CustomEvent 讓 header 按鈕復用同一套流程。
   - 當剪貼簿分頁啟動且按下 header 新增按鈕時，從 MainContent 派發同一個事件。

✅ 3. 暫存區細節區間距
   - 主容器改成 h-full flex flex-col gap-3 px-4 py-3，警告區採用 rounded-xl 邊框，左側清單欄設定固定寬度 320 且使用 text-sm 卡片。
   - 右側細節欄改成圓角、toolbar 縮為 px-4 py-2，編輯區使用 px-6 py-6。標題降為 3xl，屬性列採用 flex gap-3，notes 與 rawContent textarea 設定 min-height 360、border-gray-100、bg-gray-50，使右側空間被填滿。

✅ 4. 封存、回收站與設定調整
   - 封存頁：header 改為 px-6 py-2，select 加上邊框，表頭與每一列改成 [32px, minmax(380px,5fr), 140px, minmax(220px,3fr), 160px] 並使用 gap-3，確保欄位能滿版。
   - 回收站：header 也用 px-6 py-2，欄位改為 [32px, minmax(360px,4fr), 1px, minmax(220px,3fr), 160px, minmax(120px,1fr)]，縮小 gap 讓操作欄有足夠空間。
   - 設定頁：改用 h-full overflow-y-auto px-6 py-4，內容置中於 max-w-4xl mx-auto space-y-4，各區塊使用 border-t pt-5，底部提示放在 mt-6。

✅ 5. 保持新增按鈕樣式一致
   - 確保專案與提示詞頁面共用同一個新增按鈕 class，避免額外分隔線，讓按鈕在列表與看板模式都維持於搜尋欄旁。

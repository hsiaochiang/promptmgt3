# UI Regression Checklist（L1/L2）: Prompt Asset Hub

**目的**：用來滿足憲法中的「UI Golden Reference & Regression」要求，讓 PR 審查可以客觀驗收 UI/互動一致性。

**Golden Reference**：`0resource/ui_prototype_v3.jsx`（UI 語彙參考，非功能全集）

## PR 必填附件

- [ ] Happy path 截圖或 10–30 秒錄影
- [ ] 至少 1 個 error/edge path 截圖或錄影（例如 autosave 失敗或衝突）
- [ ] 本 checklist 已勾選（貼在 PR 描述或附檔）

## 執行與佐證流程（PR 作者執行）

- [ ] 使用 quickstart 預設工作區或等效資料集，啟動 `npm run dev:server` 與 `npm run dev:web`
- [ ] Happy path 錄影：建立專案→新增提示詞→編輯正文停筆觸發 autosave（≤2s）→刪除並於 Trash 復原
- [ ] Edge path 錄影：模擬 autosave 失敗（例如移除寫入權限或鎖檔）並確認 Failed 狀態可重試；或觸發外部修改衝突並展示「重新整理/覆寫」選項
- [ ] 搜尋/篩選與列表/看板切換：套用關鍵字/標籤後切換 list/board，再重整頁面驗證偏好還原
- [ ] 若有封存/回收站/Inbox/Clipboard/Snapshot 操作變更，至少展示 1 次成功與 1 次失敗回饋（含訊息用語一致性）
- [ ] 證據檔命名：`ui-regression/<date>-<flow>.mp4/png`（例如 `ui-regression/2026-01-09-happy.mp4`），以附件附在 PR 或提供雲端連結

## L1 視覺語彙一致（Visual Vocabulary）

- [ ] 版面密度與留白節奏符合 golden reference
- [ ] Typography 層級一致（標題/次要資訊/輔助資訊）
- [ ] 邊界線/分隔線/卡片樣式一致（線寬、圓角、陰影策略）
- [ ] 狀態提示一致（selected/hover/disabled/loading/error）
- [ ] Empty state / loading state / error state 風格一致

## L2 互動語彙一致（Interaction Vocabulary）

- [ ] Sidebar → 列表/看板 → 右側 Detail Panel 的導航/選取行為一致
- [ ] 列表/看板切換不改變資料集合，只改變呈現（結果集一致）
- [ ] Detail Panel 編輯與 autosave 行為一致（Saving/Saved/Failed + timestamp）
- [ ] 失敗一定可見且可處置（可重試、必要時可複製未保存內容）
- [ ] 衝突處置明確（重新整理/覆寫），且不會靜默覆蓋使用者內容
- [ ] Toast/通知用語與樣式一致（成功/失敗/警告）

## 例外處理（如有）

- [ ] 若有刻意偏離 golden reference，PR 描述已寫明原因與影響範圍

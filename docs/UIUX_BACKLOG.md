# UIUX Backlog (Deliverables)

Updated: 2026-01-19

定位：把 UI/UX 工作拆成可獨立驗收的小任務；你只要逐條指派給我就行。

最高準則：
- `docs/WOS_UI_UX_CONSTITUTION.md`
- `0resource/notionstyle/*.png`

---

## P0（先讓介面一致、好改）

1) UI 基礎元件盤點/收斂
- 目標：把「按鈕、輸入、select pill、tag pill、table row、properties table」變成少數共用元件
- 驗收：同類元件在不同頁面外觀與 hover/focus 行為一致

2) 排版與間距一致性（Notion-style）
- 目標：統一字級層級、留白、分隔方式（用留白 > 用線）
- 驗收：同一種資訊層級在各頁面看起來一致（標題/次要文字/輔助文字）

---

## P1（Projects：列表/看板/詳情）

1) Project List 重構（DatabaseRow 概念）
- 參考：`0resource/notionstyle/01 專案和提示詞列表.png`
- 驗收：
  - 每列 row 高度一致、hover 區域一致
  - 主要欄位對齊一致（Icon/Name/Status/Tags/UpdatedAt…）
  - row hover 時顯示主要操作（例如 OPEN）

2) Project Detail 的 Properties Table 風格校準
- 參考：`0resource/notionstyle/03 專案 編輯頁面(詳細資料頁).png`
- 驗收：`[Icon] [Label] .... [Value]` 對齊；點擊 value 可編輯；顯示層級清楚

---

## P1（Prompts：列表/看板/詳情）

1) Prompt List 重構（比照 Project List）
- 參考：`0resource/notionstyle/01 專案和提示詞列表.png`

2) Prompt Detail + Markdown Editor 體驗
- 參考：`0resource/notionstyle/04 提示詞 編輯頁面(詳細資料頁).png`
- 驗收：標題區乾淨；properties table 與內容區分明；編輯器不干擾閱讀

---

## P2（Tools：Inbox/Archive/Trash/Clipboard/Settings）

1) Inbox 流程順暢度（triage 操作次數最少化）
- 驗收：常用操作 3 步以內完成（你指定「常用操作」）

2) Trash/Restore 衝突提示與確認流程
- 驗收：衝突時不會誤覆寫；提示清楚；可恢復

3) Settings 的可理解性（不用看文件也懂）
- 驗收：每個設定旁都有可理解的說明/預設值/影響範圍

---

## P3（整理與減熵：需要你先同意）

1) `apps/web/src/prototype/*` 的去留與用途定義
2) 空檔/遺留檔（例：`serverClient.ts`）的處置策略
3) 文件整合：把「誰該看哪份文件」再縮減到 3 份以內


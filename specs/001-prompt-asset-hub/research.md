# research.md — 檔案為核心的提示詞資產管理主系統

## Decisions

### D1: 單人本機模式，不做登入/權限
- **Decision**: 服務以單人本機模式運行，不實作使用者/角色/權限；僅檢查資料根目錄與附件目錄的讀寫權限。
- **Rationale**: 符合需求場景，避免帳號/權限額外複雜度；降低阻礙離線與本機存取。
- **Alternatives**: 
  - 簡易登入（本機帳密/PIN）：增加流程與存儲敏感資訊，價值有限。
  - 多人協作＋角色：超出 MVP 範圍，與「本機為主」衝突。

### D2: 版本節點/每日快照複製正文＋中繼資料＋附件完整複本
- **Decision**: 每次版本節點與每日快照皆產生完整複本（正文、frontmatter、中繼資料、附件），失敗時回報並允許重試。
- **Rationale**: 還原時避免附件遺失或覆蓋；滿足可回溯與備份可靠性。
- **Alternatives**:
  - 僅存正文/中繼資料，附件留路徑：還原易因檔案缺失失敗。
  - 只存差異：實作複雜且對附件不適用。

### D3: 檔案監控與同步策略
- **Decision**: 使用 chokidar 監控資料根目錄與附件目錄，事件節流/去抖（合併同檔 100–300ms 內變更）；衝突時提示重新整理或覆寫。
- **Rationale**: 減少抖動與重複事件；確保 UI 即時更新。
- **Alternatives**: 
  - 直接逐事件推播：易重複、影響效能。
  - 定時掃描：延遲高且無法即時感知。

### D4: 搜尋策略（MVP → 升級）
- **Decision**: MVP 以記憶體索引（掃描檔案，title/tags/body）並快取；搜尋 95p < 1s。升級路徑保留 SQLite + FTS5（含 highlight）。
- **Rationale**: MVP 符合 5,000 筆規模與時效；升級可擴充規模與體驗。
- **Alternatives**:
  - 直接上 SQLite FTS5：初期成本較高、部署重量增加。
  - 僅全文掃描無索引：在 5,000 筆下風險超過 1s 目標。

### D5: 自動保存與附件處理
- **Decision**: 前端編輯 debounce 1–2 秒觸發保存；後端寫檔 p95 < 300ms。附件拖曳後立即落盤於附件目錄並回傳引用路徑，同步更新正文引用。
- **Rationale**: 符合自動保存需求且避免頻繁寫檔；附件流程一站式完成。
- **Alternatives**:
  - 無 debounce：IO 壓力大。
  - 延遲過長：體感落差、易資料遺失。

**補充（2026-01-07）**：附件上傳檔名採 UUID（保留副檔名），避免同名覆蓋與跨平台檔名問題。

### D6: 刪除語意採回收站（Soft Delete）
- **Decision**: 「刪除」不做永久刪除；刪除 = 移至 `<rootPath>/.pah/trash/`，可復原。永久刪除需在回收站中明確觸發並二次確認。
- **Rationale**: 避免誤刪；符合本機工具的可逆操作期待；也與版本/快照的可回溯理念一致。
- **Alternatives**:
  - 直接永久刪除：風險高，與 SC/Edge Cases 不符。
  - 僅 archived=true：無法表示「已刪除」且復原/清理需求會轉嫁到封存流程。

### D7: 刪除/復原時附件一併移動
- **Decision**: 刪除/復原時，一併移動該實體的附件資料夾：`<attachmentPath>/<entityType>/<entityId>/`。
- **Rationale**: 保證實體與附件的一致性；避免回收站復原後出現正文引用存在但附件遺失的狀況。
- **Alternatives**:
  - 附件不動、僅移正文：復原後易出現引用壞鏈；也難以做到真正「刪除」的語意。
  - 僅標記附件為未使用：需要額外 GC/引用追蹤，複雜度高。

### D8: 復原衝突處理（阻擋 + 使用者選擇）
- **Decision**: 從回收站復原時若目的地已存在同名/同路徑檔案（或附件資料夾），必須阻擋並提示使用者選擇：覆蓋 / 改名 / 取消；不得靜默覆蓋。
- **Rationale**: 避免資料意外覆寫；把決策留在 UI 可理解的互動中。
- **Alternatives**:
  - 靜默覆蓋：風險高且難追蹤。
  - 永遠自動改名：雖安全但會造成使用者困惑，且可能破壞預期路徑/slug。

### D9: 回收站自動清理（Retention）

- **Decision**: 回收站預設保留 30 天（可設定）；server 啟動時先清理一次，之後每日固定時間（預設 03:00，本機時區）執行；清理失敗需可觀測並允許重試。
- **Rationale**: 控制磁碟佔用並維持「可復原」的安全性；固定時間排程符合本機工具期待，啟動先跑可避免長時間未啟動造成的累積。
- **Alternatives**:
  - 不清理：磁碟佔用不可控。
  - 固定天數不可調：無法滿足不同使用情境。
  - 僅靠使用者手動清理：容易遺忘且不符合 retention 要求。

### D12: 搜尋預設範圍（Active only）

- **Decision**: 搜尋（FR-005）的預設範圍為主資產 Active：只搜尋 Project/Prompt 且 `archived=false`；不含 Trash、不含 Inbox。
- **Rationale**: 避免已刪除/工具資料混入主要工作流；使用者所在視圖即為工作集合，預設結果更可預期。
- **Alternatives**:
  - 連同 archived：結果更全面但容易稀釋「正在處理」的集合。
  - 連同 inbox/trash：在資訊噪音與誤觸上成本較高。

### D13: 附件檔名策略（UUID + 副檔名）

- **Decision**: 拖曳圖片/附件上傳時，一律產生 UUID 檔名並保留副檔名。
- **Rationale**: 最大化避免檔名衝突、Windows 保留字/非法字元，以及不同來源檔名造成的不可預期；也利於快照/版本複製的一致性。
- **Alternatives**:
  - 保留原始檔名 + suffix：可讀性高但仍會遇到跨平台檔名/保留字問題。
  - 讓使用者輸入：互動成本高，不符合拖放的順暢體驗。

### D14: 實體識別與路徑策略（id=UUID，路徑=slug）

- **Decision**: Project/Prompt 以 `id=UUID` 作為唯一識別（frontmatter）；檔案路徑使用 `slug`（可改名）；rename/restore 只改 slug，不改 id。
- **Rationale**: 兼顧穩定關聯（id）與可讀路徑（slug）；支援改名/復原衝突處理時語意清晰。
- **Alternatives**:
  - id=slug：改名變成換 id，會破壞引用/附件關聯。
  - 路徑也用 UUID：穩定但可讀性差，不利於使用者在檔案系統中手動管理。

### D15: 落盤佈局（Prompt 階層式置於 Project 之下）

- **Decision**: Prompt 檔案放在 Project 資料夾底下（階層式），例如 `projects/<projectSlug>/prompts/<promptSlug>.md`。
- **Rationale**: 符合「檔案為核心」與使用者直覺的檔案組織方式；也利於專案搬移/備份與掃描重建。
- **Alternatives**:
  - Prompts 平鋪：索引查找方便，但檔案系統可讀性降低，且需要更多關聯查詢。

### D16: slug 規則（ASCII kebab-case）

- **Decision**: slug 僅允許 ASCII kebab-case（`a-z0-9-`）；空白→`-`、連續 `-` 合併；其他字元轉換或移除。
- **Rationale**: 最小化跨平台檔名問題（Windows/zip/git/URL）；也讓 restore/rename 衝突處理更一致。
- **Alternatives**:
  - 允許 Unicode：可保留中文但會遇到更多檔案系統/工具相容性邊界。
  - 手動輸入：一致性不足且增加互動成本。

### D17: InboxItem delete 語意（永久刪除，不進回收站）

- **Decision**: InboxItem delete 為永久刪除：不進 `<rootPath>/.pah/trash/` 且不可復原；需明確確認並提供成功/失敗回饋。
- **Rationale**: Inbox 屬工具性暫存資料，刪除代表「不再保留」；避免將暫存項與主要資產回收站混在一起造成噪音。
- **Alternatives**:
  - 進回收站：一致性高，但會使 Trash 視圖混雜工具資料，降低主要刪除/復原流程的可讀性。


### D10. Domain enums are fixed by spec (contracts-first)

- Decision: Project/Prompt 的狀態與 priority 以 spec 定義的 enum 為準，並在 contracts + OpenAPI 中固化。
- Rationale: 減少前後端/契約分歧，讓測試能更精準地捕捉回歸。
- Alternatives considered:
  - 全部用 `string`：彈性高但容易產生互不相容的值。
  - 只在 UI 端限制：server/contract 仍可能接受不合法值，造成落盤污染。

### D11. Snippets are stored under `<rootPath>/.pah/snippets/`

- Decision: Snippet 實體（非搜尋摘要文字）一律落盤在 `<rootPath>/.pah/snippets/`，每個 snippet 一檔；可透過 scan 重建。
- Rationale: `.pah/` 是內部管理資料根目錄（settings/trash/cache/events），snippet 屬於系統資料且不應污染使用者工作目錄頂層。
- Alternatives considered:
  - `<rootPath>/snippets/`：容易與使用者自建資料混淆，且不符合 `.pah/` 聚合內部資料的設計。
  - 嵌入在 Prompt 檔：操作簡單但不利於重用/獨立版本與掃描重建。
## Notes / Follow-ups
- 基準測試需涵蓋：索引重建時間、寫檔 p95、搜尋 p95、快照/版本建立耗時與磁碟佔用。
- 權限檢查需在設定頁與保存/附件操作時預檢，避免部分流程才失敗。
- WS 推播需防止重複（事件去抖＋檔案 hash/mtime 比對）。

---
id: bb9a6da2-6ba6-4d51-a35e-3e12603b9f79
title: DDD Coding Agent Skills
importedAt: '2026-01-10T13:07:37.201Z'
suggestedTags: []
sourceLink: 'wos://archive/694df06b-fc04-8321-bbd4-b78083d87b22'
sourcePlatform: chatgpt-export
notes: ''
status: draft
category: '#Cat/PROMPT_DRAFT'
tags:
  - '#Stage/IDEA'
slug: ddd-coding-agent-skills
projectId: 4fe6bce0-4b07-43b6-a108-3febb7183d6a
updatedAt: '2026-01-11T13:29:25.672Z'
createdAt: '2026-01-10T13:07:37.201Z'
---
# DDD Coding Agent Skills

**Created**: 12/26/2025 10:19:07

## User

DDD 是什麼
github裡面的coding agent 是什麼? skills是什麼? Claude裡面也有skills

## AI

以下依序說明三個概念：DDD、GitHub 的 Copilot coding agent、以及 GitHub/Claude 所說的 skills（特別是 Agent Skills）。

---

## 1) DDD 是什麼（Domain-Driven Design，領域驅動設計）

DDD 是一套用來處理「複雜業務問題」的軟體設計方法，核心精神是：**以業務領域（Domain）的模型作為設計中心，讓程式碼結構與命名貼近業務語言與規則**，降低「需求描述」與「系統實作」之間的落差。 citeturn1search2turn1search4

DDD 常見的兩層面：

- **Strategic DDD（戰略設計）**：用來切分系統邊界與協作方式  
  - 典型概念：**Bounded Context（界限上下文）**、Context Map、子域（Subdomain / Core Domain）  
  - 目標：把「同一個詞在不同情境其實意思不同」的問題切乾淨，避免全公司只用一個巨大模型硬套。 citeturn1search4turn1search5

- **Tactical DDD（戰術設計）**：在單一 Bounded Context 內，把模型落到可實作的設計型態  
  - 常見型態：Entity、Value Object、Aggregate、Repository、Domain Service、Domain Event 等  
  - 目標：讓商業規則「住在模型裡」，而不是散落在 Controller / SQL / if-else。 citeturn1search10turn1search1

---

## 2) GitHub 裡面的 “coding agent” 是什麼（Copilot coding agent）

**Copilot coding agent** 是 GitHub Copilot 的「代理式開發」能力：你把工作（例如 Issue 或需求）指派給它，它會在 GitHub 上**自動完成修改、開分支、提交 commit、開 PR**，最後再請你用 PR review 的方式導引它迭代到可合併的狀態。 citeturn2view2

關鍵特性（可用來對客戶/主管解釋其治理與可控性）：

- **在 GitHub 的 PR 工作流中運作**：所有步驟都落在 commit、log、PR 討論，便於稽核與回溯。 citeturn2view2  
- **有自己的暫時性開發環境**：由 GitHub Actions 提供，可跑測試、lint 等自動檢查。 citeturn2view2  
- **區分 IDE 內的 agent mode**：coding agent 是在 GitHub Actions/PR 流程中自治；IDE agent mode 則是直接改你本機工作區。 citeturn2view2  
- **有安全與權限限制**：例如只能推到特定命名的分支、需 review 後才會觸發 workflows 等（細節以 GitHub 文件為準）。 citeturn2view2  

---

## 3) GitHub 裡面的 “skills” 是什麼？（你可能看到的是兩種不同的「skills」）

### A. Agent Skills（你提到的「跟 coding agent 相關」多半指這個）
**Agent Skills** 是一種「可攜式、可重用」的能力封裝：以資料夾形式存放**指令說明、腳本、範例與資源**，當 Copilot 判斷與你的任務相關時，會自動載入，以便穩定執行特定工作流或專業任務。 citeturn2view0turn2view1  

重點（很適合拿來做團隊/客戶的標準化）：

- **開放標準（open standard）**：可跨多種 agent 使用，不是只綁某一個產品。 citeturn2view0turn2view1  
- **適用範圍**：Copilot coding agent、Copilot CLI、以及 VS Code Insiders 的 agent mode（並逐步擴到穩定版 VS Code）。 citeturn2view0turn0search3turn2view1  
- **與「Custom Instructions（自訂指令）」差異**：一般自訂指令偏向「長期的 coding 標準/規範」；skills 偏向「特定任務才需要載入的工作流與資源」。 citeturn2view0turn2view1  

### B. GitHub Skills（GitHub 官方的互動式教學課程）
GitHub 上也有一個 **github.com/skills** 系列，這是「教你怎麼用 GitHub / Copilot」的互動式練習課程（教材 repo），它跟上面的 Agent Skills 是兩回事。 citeturn0search4turn0search15  

---

## 4) Claude 裡面的 skills 是什麼？跟 GitHub 的 skills 有何關係？

Claude 的 Help Center 把 Skills 分成兩類： citeturn2view3  

- **Anthropic Skills**：Anthropic 官方維護的技能（例如強化的 Excel / Word / PowerPoint / PDF 文件產出），Claude 會在適用時自動調用。 citeturn2view3  
- **Custom Skills**：你或你的組織自建的技能，用於公司特定流程（品牌規範文件、固定格式的會議記錄、串接 Jira/Asana/Linear 建任務等）。 citeturn2view3  

而 GitHub 的 Agent Skills 文件也明確提到：**Agent Skills 是開放標準，並可參考 anthropics/skills 等資源庫**，代表它們在概念與封裝方式上是同一個「Agent Skills 標準」生態系的一部分。 citeturn2view0turn0search21  

---

## 實務建議（用於對內治理／對外說明時常被問到）
1. **把 skills 當成「可執行的標準作業資產」管理**：版本控管、Review、最小權限、來源可信任（避免把不明來源 skills 直接放進內網專案）。 citeturn2view0turn0search5  
2. **選用原則**：  
   - 「每次都要遵守的規範」→ 用 Custom Instructions。 citeturn2view1turn2view0  
   - 「只有特定任務才用到、而且需要範本/腳本/資源」→ 用 Agent Skills。 citeturn2view1turn2view0  

---

如果你願意，我可以把以上內容整理成一頁「對主管/客戶說明版」：用詞更商務、聚焦在治理（可控性、稽核、權限、導入邊界）與落地方式（何時用 instructions、何時用 skills、何時用 coding agent）。

## User

那BDD 是什麼
SDD有Speckit這樣的工具
BDD或DDD 有嗎

關於Vibe Coding 對於有程式概念 但已經看不懂現在程式架構的我來說 什麼方式才是合適的
我用Speckit開發了幾個專案 在implentment階段
1. 才看到畫面 發現跟自己想的差太多
2. 提了一些修改後 coding agent花了非常多的時間在修改及測試

所以想說應該把雛形 先做到所有按鈕及動線都確認完成 代表這專案成果是在我預期內的 在開始讓coding agent進行程式開發 因為程式開發花的時間最多也是對消耗token(費用)

請你提供意見 有什麼樣子的開發套件或流程 是適合我的

## AI

以下分三段回答：BDD 的定義、BDD/DDD 是否有「像 Spec Kit 這樣的一套工具」、以及針對你目前在 Spec Kit + coding agent 的痛點，建議採用的流程與套件組合（以「先把雛形與動線確認完」為核心）。

---

## 一、BDD 是什麼（Behavior-Driven Development）

BDD（行為驅動開發）是一種從 TDD/ATDD 演進而來的方法，重點不是先寫「測試」，而是先把需求改寫成「可被驗證的行為與例子」，再把這些例子變成**可執行規格（executable specification）**，最後也成為**活文件（living documentation）**。citeturn0search2turn0search14turn0search1

實作上最常見的表達方式是 **Gherkin**（Given / When / Then）：
- Given：前置條件（情境/資料/權限）
- When：使用者行為
- Then：可觀測結果（畫面/資料/狀態/訊息）

Cucumber 文件也明確描述：Scenario 會先以可執行規格存在，隨著程式碼完成，Scenario 扮演活文件與自動化測試。citeturn0search1

---

## 二、BDD 或 DDD 有沒有像 Spec Kit（SDD）那樣的工具？

### 1) BDD：有「工具鏈」，但定位不同於 Spec Kit
BDD 有成熟的工具生態，主要分兩塊：

- **規格描述**：Gherkin feature files（文字規格）
- **落地執行**：把每個 step 接到測試程式（step definitions），形成自動化驗收測試

典型代表是 Cucumber（以及對應到不同語言生態的實作，如 .NET 的 SpecFlow、Python 的 behave/pytest-bdd 等）。citeturn0search1turn0search12turn0search0turn0search21

但要注意：BDD 工具大多聚焦在「驗收規格 ↔ 自動化測試 ↔ 活文件」，而不是像 Spec Kit 那樣提供一整套「Constitution → Spec → Plan → Tasks → Implement」的端到端流程。Spec Kit 本身的定位是把規格驅動開發流程工具化，協助你把業務邏輯、設計與計畫串成可執行的開發節奏。citeturn2search5turn2search0

### 2) DDD：比較像「建模與邊界切分」的方法論；工具多為建模/工作坊/圖像化
DDD 沒有單一主流的「一鍵式工具」等同 Spec Kit，但有一些很實用、偏「戰略建模」的工具與方法：

- **Context Mapper**：以 DSL 支援 Strategic DDD、Context Map、Bounded Context 建模與 service decomposition（開源工具）。citeturn1search0turn1search2  
- **EventStorming**：用工作坊方式探索複雜領域（常用於 DDD 前期澄清）。citeturn1search7turn1search22  
- **Domain Storytelling**：用「故事 + 圖示語言」讓領域知識具象化，降低誤解。citeturn1search9  
- **Bounded Context Canvas**：針對單一 bounded context 的協作式設計/文件化模板。citeturn1search8  

結論：  
- **BDD 有**（而且很成熟）但它是「可執行驗收規格」工具鏈。  
- **DDD 有**（偏建模與協作）但更多是「建模工具/模板/工作坊方法」。  
- 若你要的是「像 Spec Kit 一樣可控的 AI 開發流程」，最佳做法通常是：**Spec Kit（規格/計畫）+ BDD（驗收行為鎖定）+ 早期 UI 原型（動線鎖定）** 三者結合。

---

## 三、針對你目前的痛點：什麼流程/套件更適合你（有程式概念，但不想被現代架構拖著跑）

你描述的兩個問題，本質上都是「規格在 implementation 才落到可見物」與「驗收條件不夠可機械式判定，導致 agent 迭代成本暴增」。

### A. 建議採用的總體策略：先鎖 UX/動線，再鎖驗收行為，再讓 agent 寫可維護程式
你提出的方向是對的：**先把雛形做到所有按鈕與動線確認完成**，再進入重的程式開發階段。原因是 token/時間消耗通常發生在「反覆改 UI + 反覆跑測試 + 反覆修回歸」。

我建議把流程改成 3 個 Gate（每個 Gate 都是可驗收的）：

#### Gate 1｜UI 原型 Gate（你要的「先看到畫面」）
目標：讓你在投入大量 token 前就能確認「這就是我要的」

交付物（務實、可操作）：
1. **可點擊原型**（Figma 或 Next.js 靜態原型皆可）
2. **UI Flow Map**（每個按鈕點下去去哪、返回怎麼走、錯誤狀態怎麼呈現）
3. **頁面/元件清單**（Routes、主要元件、表單欄位、狀態）

這一段的工程手段建議是「UI scaffold」：  
- 先做頁面與元件骨架、假資料、按鈕動線（不做真整合、不做真資料庫）
- 所有互動先以 mock service/假 API 回應

你會發現：這一步做得好，後面 agent 改動就會小很多，因為方向已經定了。

#### Gate 2｜BDD 驗收 Gate（把「你腦中的預期」變成可執行、可機器判定）
目標：把「改了很多次」變成「跑一次測試就知道對不對」

做法：
- 把每條動線寫成 Gherkin（Given/When/Then）
- 把關鍵 UI 行為做成 E2E（或至少是高價值的 flows）

BDD 的價值在於：Scenario 會成為可執行規格與活文件，能大幅減少「講不清楚、改到哪裡算完成」造成的 agent 迭代。citeturn0search1turn0search14

#### Gate 3｜Agent 開發 Gate（把任務切小、PR 切小、回歸成本切小）
目標：避免「agent 花非常多時間在修改及測試」

關鍵操作原則：
- 一次只讓 agent 做**一個垂直切片（thin vertical slice）**：一條動線、或一個頁面的一個功能
- 每個 slice 都要有明確驗收（最好是能跑的測試）
- 嚴格限制 agent 的改動範圍（不允許順便重構整個架構/換套件）

---

### B. 你可以採用的「套件組合」（以 Next.js + 你現有偏好為假設）
你前面提到你的專案是 Next.js 14、測試用 Vitest（你已經在用）。基於這個前提，建議如下：

#### 1) UI 雛形階段（Gate 1）
- UI 元件庫：選一套你已熟悉或社群成熟的（例如 shadcn/ui 類型的組合式元件庫）  
- Mock API：用「假資料 + 可替換的 service layer」；或用 MSW 這類方式把 API 回應固定住（目的是鎖動線、鎖畫面狀態）

重點不是選哪個庫，而是把「按鈕、動線、狀態」做成你可直接驗收的產物。

#### 2) 動線驗收階段（Gate 2）
- E2E：Playwright（偏 UI flow 驗收，最貼近 BDD ）
- BDD 表達：Gherkin（Cucumber 生態）或「用你熟悉的測試框架但採用 Given/When/Then 的結構化寫法」

Cucumber 對「Scenario 先是可執行規格，後成為活文件」的定位很適合拿來當你與 agent 的共同契約。citeturn0search1turn0search6

#### 3) implementation 階段（Gate 3）
- 仍保留 Vitest 做單元/元件測試
- 用 E2E 做「動線不被改壞」的保險
- 把 CI 的測試分層（快速的先跑；重的夜間或合併前跑），避免每次 agent 都跑全套把時間耗光

---

## 四、把 Spec Kit 用得更適合你：你需要的是「Prototype-first 的 Spec-Driven」
你已經在用 Spec Kit（規格驅動工具），而 GitHub 官方也把它定位成協助你捕捉業務邏輯、設計與計畫後，再讓 AI 進入實作的流程化工具。citeturn2search5turn2search0  
你現在遇到的問題，通常不是 Spec Kit 不好，而是 **spec/plan/tasks 裡缺少一個「可視化、可驗收」的 UI Gate**，導致 implement 才第一次看到真相。

我建議你在 Spec Kit 流程中，明確插入兩個固定章節（或固定檔案）：

1. **UI Prototype Spec**：頁面、元件、按鈕、動線、狀態（含錯誤/空資料/權限）
2. **Acceptance Scenarios（BDD）**：每個動線的 Given/When/Then

然後規定：  
- 這兩份未「你親自驗收通過」之前，不進入 /implement 的大量開發。

---

## 五、你下一步可以怎麼做（不需要你先回答我，也能直接採用）
如果你要立刻改善「看不到畫面」與「agent 改很久」兩件事，我建議你在目前專案直接採行以下最小改動版本：

1) 先開一個 `prototype/` 或 `ui-only` 分支  
- 只做頁面、元件、動線、假資料（不碰真整合）

2) 每個頁面都產出「動線驗收清單」  
- 你只要逐條打勾（例如：按鈕 A → 頁面 B；返回；錯誤提示；空資料）

3) 把最重要的 3～5 條動線寫成 BDD Scenario  
- 先不用多，先把「最容易歪掉」的地方鎖住

4) 再把這些動線切成小任務丟給 coding agent  
- 每次只做一條動線、或一個頁面的一個功能
- 要求它以測試結果作為完成證據

---

如果你願意把其中一個專案的「功能列表/頁面列表（即使很粗略）」貼上來，我可以直接幫你把：
- Gate 1 的 UI Flow 驗收清單（逐頁、逐按鈕）
- Gate 2 的 BDD Scenario（先挑最關鍵 5 條）
- Gate 3 的任務切片方式（如何切到 agent 不會失控）

整理成一套你可以直接放進 repo 的結構與模板。

## User

如附件

## AI

All the files uploaded by the user have been fully loaded. Searching won't provide additional information.

## AI

以下依序回覆：DDD / BDD 定義、GitHub「coding agent / skills」、以及針對你目前「先把雛形做到按鈕與動線確認，再交給 coding agent」的開發流程建議（含你附的原型檔觀察）。

---

## 1) DDD 是什麼（Domain-Driven Design）
DDD（Domain-Driven Design，領域驅動設計）是一套**以「業務領域模型」為核心**的系統設計方法：先把領域概念、規則、邊界（Bounded Context）與關鍵名詞（Ubiquitous Language）定義清楚，再把程式結構（模組/聚合/實體/值物件/領域服務）對齊這些規則。

你這個「提示詞管理系統」如果後續要做到：
- 專案、提示詞、版本、狀態流轉、歸檔/刪除、進度紀錄、標籤分類、搜尋策略、匯出/同步等規則愈來愈多  
那 DDD 可以幫你把規則落在「可維護、可擴充」的結構上，而不是把規則散落在 UI state 與各種 handler 裡。

在工具面，DDD 有「方法論 + 輔助工具」；例如 Context Mapper 這類工具可用 DSL/Context Map 方式協助做 bounded context 的規劃與輸出（屬於 DDD strategic design 的範疇）。 citeturn0search2turn0search5

---

## 2) BDD 是什麼（Behavior-Driven Development）
BDD（Behavior-Driven Development，行為驅動開發）把需求寫成「**可驗收的行為描述**」，常用 Gherkin（Given/When/Then）去表達，並可連結到自動化測試，讓文件與測試成為同一份「可執行規格」。Cucumber 是最典型的 BDD 生態（支援 Gherkin / executable specification / living documentation）。 citeturn0search3

常見對應：
- .NET：SpecFlow（Gherkin/BDD） citeturn0search4  
- Python：pytest-bdd（Gherkin/BDD） citeturn0search1  
- JS/TS：Cucumber.js 或把 Gherkin 接到 E2E（例如 Playwright）

---

## 3) SDD 有 SpecKit；那 BDD 或 DDD 有嗎？
如果你問的是「像 SpecKit 一樣，能把流程固化、讓 agent 依規格穩定輸出」——我會把答案拆成兩層：

### A. BDD：有成熟「規格格式 + 執行框架」
- **規格格式**：Gherkin（Given/When/Then）
- **執行框架**：Cucumber / SpecFlow / pytest-bdd 等 citeturn0search3turn0search4turn0search1  
- **落地方式**：把「你認可的動線」寫成 feature 檔，並接到 Playwright 這種端到端測試，做到「UI 真的照你認可的動線跑」  
  - Playwright 主打 web-first assertions、並有完整的 E2E runner 與報告工具鏈。 citeturn1search12turn1search3turn1search5

### B. DDD：較多是「建模方法 + 輔助工具」而非單一套件
- DDD 本質是設計方法論；工具面常見是做 **Context Map / bounded context / domain model** 的輔助（如 Context Mapper）。 citeturn0search2turn0search5  
- 實作面則是靠你選的語言框架與分層架構（Clean Architecture/Hexagonal/模組化 monorepo 等）去承載 DDD 的模型與邊界。

---

## 4) GitHub 裡面的 coding agent 是什麼？skills 是什麼？（Claude 也有 skills）
### GitHub Copilot coding agent
GitHub 官方對 Copilot coding agent 的定位是：它可以**在你的 repo 上自主完成開發任務**（常見方式：指派 GitHub issue 給它），並產生/更新 PR 給你 review。 citeturn2search1turn2search2turn2search4

### Agent Skills（GitHub / VS Code / Claude 都在講的「skills」）
GitHub 文件把 Agent Skills 描述為：一個「資料夾」形式的模組，裡面可以放**指令、腳本、資源與規範**，讓 agent 在合適時機自動載入，以提升特定任務的穩定度與一致性。 citeturn2search0turn2search11turn2search7

Claude 端也有相同概念：Skills 用來教 Claude（或 Claude Code）如何依你團隊的標準做事，並可和 MCP（工具連接）搭配。 citeturn2search5turn2search6turn2search9

你在意的「token/費用」其實非常適合用 skills 解：  
把**專案的固定規則（UI contract、測試命令、提交規範、資料格式、命名規則、禁止事項）**打包成 skill，讓 agent 每次做事都不用重新摸索，能顯著降低「反覆修改 + 反覆測試」的無效消耗。 citeturn2search0turn2search5

---

## 5) 針對你的情境：什麼開發套件或流程最適合「有程式概念但看不懂現代架構」且要控成本？
你描述的兩個痛點非常典型：
1) implementation 才看到畫面，落差很大  
2) 改需求後 agent 花很多時間改與測

我建議你採用「**Prototype → UI Contract（可驗收動線）→ 自動化驗收（BDD/E2E + 視覺比對）→ 再讓 coding agent 分段實作**」的流程。重點是把你最在意、也最容易造成返工的部分，前移並變成“可機器驗收”。

### (1) 你已經做對的方向：先把按鈕與動線確認
你附件的原型檔其實已經把「按鈕用途與動線」寫進去了：  
- Header 的「專注編輯 / 專案說明 / 片語 / 📌釘住 / 說明」都在 onClick 時有明確的狀態切換與互斥關係（例如切專注時會關閉 overlay、收合列表等）。 fileciteturn1file0L9-L76  
- 右欄也明確定義了「複製 / 另存為 / 歸檔（可 Undo、跳下一筆）/ 刪除（可 Undo、跳下一筆）/ ⚙️中繼資料 drawer」這些高頻動作。 fileciteturn2file0L1-L28  
- 原型內甚至有一頁「操作說明（按鈕用途）」把你期望的日常節奏寫成清單（左選專案→中欄列表→點提示詞→右欄編輯；Pin OFF 自動收合；歸檔/刪除跳下一筆等）。 fileciteturn2file2L23-L41  

這些內容非常適合直接升級成 **UI Contract**（你確認過的「互動規格」）。

### (2) 把 UI Contract 變成「可機器驗收」：BDD + Playwright（建議）
**做法：**
- 用 Gherkin 把你認可的動線寫成 10～20 條 Scenario（BDD）。 citeturn0search3  
- 用 Playwright 把這些 Scenario 對到 E2E 測試（尤其你這種以 UI 動線為核心的系統很適合）。 citeturn1search12turn1search5  

**你會得到的好處：**
- 你不用看一堆現代架構細節；你只要看「Given/When/Then」與測試結果，就能判斷成品是否符合預期。
- coding agent 每做一個 PR，必須讓這些驗收測試通過；否則就不合格。這會大幅降低你說的「改一點點卻改很久」的失控情況。

### (3) 再加一個成本控制利器：Storybook（元件/狀態先定稿）
如果你的落差主要來自 UI 呈現與狀態組合（抽屜、modal、收合、focus mode 等），可以把關鍵元件與頁面狀態用 Storybook 固化，讓你在「不跑整個 app」的情況下確認 UI。Storybook 的核心價值就是 isolating component/page states 做開發與文件化。 citeturn1search4turn1search13  
若你願意更進一步，也可用 Storybook + Chromatic 做視覺回歸（UI 變動自動比對）。 citeturn1search8turn1search2

---

## 6) 你現在就能採用的「最小可行流程」（建議版）
不增加太多新工具、但能立即改善你兩個痛點：

1. **Prototype 冻結（Freeze）**
   - 以你這份原型檔為基準，把所有按鈕與動線寫成一份 `ui-contract.md`（等同你原型中的「操作說明」＋按鈕規格）。 fileciteturn2file2L23-L41  
2. **把 ui-contract 轉成 10～20 條 BDD Scenario**
   - 用 Cucumber/Gherkin 管理規格（可讀、可驗收）。 citeturn0search3  
3. **Playwright 寫出對應的 E2E 驗收**
   - 用 web-first assertions 降低 flaky、並用報告讓你 review（你只看報告/截圖/trace 也能驗收）。 citeturn1search3turn1search12  
4. **coding agent 的工作粒度改為「一條 Scenario 一個 PR」**
   - 每個 PR 只做一個可驗收行為，避免 agent 在大範圍重構中燒大量 token。  
5. **把規範封裝成 Agent Skill**
   - Skill 內放：`ui-contract.md`、測試命令、PR checklist、命名規則、禁止改動區域（例如不得改 UI contract 的 data-testid）。  
   - 這套 Skill 可同時服務 GitHub Copilot（coding agent / VS Code agent mode）與 Claude Skills。 citeturn2search0turn2search11turn2search5turn2search9  

---

## 7) 針對附件原型的具體落地建議（避免你後續被 agent 拖著走）
你原型裡已經有明確的 UI state 與互斥規則，例如：
- snippets/meta/projectDetails/help 的開關互斥與關閉策略 fileciteturn1file0L27-L76  
- focus mode 會隱藏左/中欄並關閉 overlay fileciteturn1file0L9-L19  
- Pin OFF 時點提示詞會收合列表（你在「操作說明」也寫了） fileciteturn2file2L23-L28  

建議你在正式實作前，先補兩件事（這兩件會直接降低返工與 token 消耗）：
1) **替所有關鍵互動補 `data-testid`（或固定 aria-label）**  
   - Playwright 就能用穩定 selector 寫驗收測試，避免 UI class 改一點就整批測試壞掉。  
2) **把「操作說明」中的動線拆成測試清單**  
   - 你原型已經等於把驗收條件寫好了，直接轉成 BDD/E2E 是最划算的投資。 fileciteturn2file2L23-L41  

---

navlist近期關於 Agent Skills（GitHub / Claude）的更新與報導turn2news34,turn2news35,turn2news36

## User

接下來 我們要如何進行呢

你所提供的執行步驟或內容 要讓我可以重複使用在其他專案
需要你重新梳理流程 並且提供每個步驟的提示詞 以確保我在下個專案也能產生相同的文件持續完成每個步驟

## AI

下面是一套「可重複使用的 Prototype-first（先雛形後程式）+ BDD 驗收 + Coding Agent 分段交付」的標準流程。我把它整理成：

1) 固定流程（每個專案都照這個 Gate 走）  
2) 每一步的輸入/輸出（你要產出的文件/檔案）  
3) 每一步可直接複製使用的提示詞（含占位符，換專案只要填空）

整體核心原則是：**先把 UI/動線（可視化成果）鎖住，再把驗收條件（可機器判定）鎖住，最後才讓 coding agent 做大量實作**。這樣可以顯著降低反覆改 UI、反覆修測試造成的 token 與時間消耗；而 E2E 失敗時用 trace 直接定位問題，減少 debug 成本。citeturn0search8turn0search4

---

## A. 你接下來的進行方式（5 個 Gate，逐步可驗收）

### Gate 0｜專案啟動與範圍鎖定（文字版）
**輸入**：需求摘要、使用者角色、你想解決的痛點  
**輸出**：`00-brief.md`（一頁就好）、`00-done.md`（Definition of Done）  
**通過標準**：你看完這兩份文件能說清楚「做什麼/不做什麼」。

### Gate 1｜UI 雛形與動線鎖定（可視化成果）
**輸出**（至少其一）：
- 可點擊原型（Figma / 靜態頁面都可）
- `01-ui-contract.md`（按鈕、動線、狀態、錯誤/空資料/權限的行為）
- （建議）Storybook：用來把元件/頁面狀態固定住，不必跑整個 app 也能檢視難以到達的狀態。citeturn0search16turn0search12  
**通過標準**：你逐條驗收所有按鈕與動線都符合預期。

### Gate 2｜BDD 驗收規格（把「預期」變成可讀、可測）
**輸出**：`02-acceptance.feature`（Gherkin Given/When/Then）  
Gherkin 是用關鍵字結構化可執行規格的標準寫法。citeturn0search0  
**通過標準**：你用「Scenario 清單」就能判斷是否完成（而不是看程式碼）。

### Gate 3｜E2E 自動化驗收（把 BDD 變成測試）
**輸出**：`tests/e2e/*.spec.ts`（Playwright）＋ CI 測試命令  
Playwright 提供 web-first assertions（會等待條件成立）與完整 trace viewer，適合用來降低測試不穩與 debug 成本。citeturn0search6turn0search8turn0search1  
**通過標準**：核心動線測試在本機與 CI 都能穩定通過。

### Gate 4｜Coding Agent 分段交付（1 個 Scenario / 1 個 PR）
**輸出**：小步 PR（每次只做一條動線或一個功能切片）  
GitHub 的 Agent Skills 可把你的規範、腳本、資源封裝成資料夾，讓 Copilot 在任務相關時載入，提升一致性與可重複性。citeturn0search2turn0search13turn0search17  
**通過標準**：每個 PR 都以「測試通過 + UI contract 未破壞」作為合併條件。

---

## B. 建議的可重複使用專案結構（你之後每個專案可直接套用）

```text
/docs
  00-brief.md
  00-done.md
  01-ui-contract.md
  02-acceptance.feature
/skills
  /project-playbook-skill
    instructions.md
    commands.md
    resources/
    templates/
/tests
  /e2e
/src
```

其中 `/skills/...` 是你「把流程與規範封裝成可攜的技能資料夾」的落點（下個專案可直接複製整包）。citeturn0search2turn0search13

---

## C. 每個步驟的可複製提示詞（換專案只要填空）

以下每段都能直接貼給 ChatGPT / Claude / VS Code agent mode / Codex 使用。你只要把 `{...}` 換成新專案內容即可。

---

### Prompt 00｜產出專案 Brief（Gate 0）
```text
你是資深系統分析師 + 產品經理。
請根據我提供的資訊，輸出 /docs/00-brief.md（Markdown），內容要短而完整，適合給主管/客戶確認。

【專案名稱】{ProjectName}
【背景/問題】{Background}
【目標】{Goals}
【非目標（不做）】{NonGoals}
【使用者角色】{Personas}
【主要使用情境（3~5條）】{TopUseCases}
【限制】{Constraints}
【風險與假設】{RisksAssumptions}

輸出格式：
- 一頁內完成
- 條列為主
- 用詞正式
```

### Prompt 01｜定義完成標準 DoD（Gate 0）
```text
你是交付導向的 Tech Lead。
請輸出 /docs/00-done.md（Markdown），列出本專案的 Definition of Done（DoD），要包含：
1) UI/動線層面的 DoD
2) 驗收測試層面的 DoD（含 E2E）
3) 文件與交付層面的 DoD（PR、變更紀錄）
4) 明確「不算完成」的反例（至少5條）

【專案名稱】{ProjectName}
【核心動線】{CoreFlows}
【品質底線】{QualityBar}
```

---

### Prompt 10｜把「雛形」升級成 UI Contract（Gate 1）
```text
你是資深 UI/UX + 系統分析師。
請把我提供的原型/描述，整理成 /docs/01-ui-contract.md（Markdown），目的：讓工程師與 coding agent 不需要猜，就能照規格做出一致成果。

要求：
- 逐頁（route/page）列出：目的、區塊、按鈕、狀態、錯誤/空資料、權限差異
- 每個按鈕要有：名稱、位置、可見條件、點擊後行為、成功/失敗訊息、會影響哪些 UI state
- 明確列出互斥規則（例如同時只能開一個 drawer / overlay）
- 列出「必備 data-testid 命名規則」（先給規則，不要寫程式碼）

【原型來源】{PrototypeLinkOrText}
【頁面清單（如有）】{Pages}
【關鍵按鈕/動線】{ButtonsFlows}
```

---

### Prompt 20｜從 UI Contract 產出 BDD（Gate 2）
Gherkin 是用關鍵字來表達可執行規格的標準格式。citeturn0search0

```text
你是 BDD/QA Lead。
請依據 /docs/01-ui-contract.md 的內容，產出 /docs/02-acceptance.feature（Gherkin）。

規則：
- 先產出 Feature 概述與名詞表（Glossary）
- 至少 12 條 Scenario
- 每條 Scenario 必須可驗收（Then 是可觀測結果）
- 情境要涵蓋：正常流程、空資料、錯誤、取消、權限不足（若有）
- 每條 Scenario 末尾加上 @tag（例如 @core @ui @regression）

【UI Contract】{PasteUIContractOrLink}
【優先核心動線】{CoreFlowsTop5}
```

---

### Prompt 30｜把 BDD 轉成 Playwright 測試設計（Gate 3-設計）
Playwright 的 expect 有 web-first assertions（會等待條件成立），適合做 UI 驗收測試。citeturn0search6turn0search8

```text
你是 Playwright 測試架構師。
請根據 /docs/02-acceptance.feature，輸出「測試設計稿」（Markdown），包含：
1) 測試檔案切分策略（每個 Feature/Scenario 對應到哪些 spec.ts）
2) 每條 Scenario 需要的穩定 selector（以 data-testid 為主）
3) 測試資料與假資料策略（mock/seed）
4) 失敗時的診斷策略（trace、report）

要求：只輸出設計稿，不要寫程式碼。

【acceptance.feature】{PasteFeatureFile}
```

### Prompt 31｜生成 data-testid 計畫（Gate 3-前置）
```text
你是前端測試可維護性顧問。
請輸出一份 data-testid 命名與覆蓋清單（Markdown）：
- 命名規則（頁面/區塊/動作/狀態）
- 每個頁面必須具備的 testid（至少：主要區塊、主 CTA、列表、空狀態、錯誤訊息、drawer/modal）
- 明確列出「禁止用 class/文字當 selector」的情況

【UI Contract】{PasteUIContractOrLink}
```

### Prompt 40｜給 coding agent 的「一個 PR 一條動線」任務單（Gate 4）
```text
你是 GitHub Copilot coding agent 的任務派工者。
請把以下工作切成「一個 PR 只做一個可驗收切片」的任務單（Markdown），每個任務要包含：
- 任務目標（對應到哪一條 Scenario）
- 修改範圍（哪些檔案/資料夾允許碰，哪些禁止）
- 驗收方式（要跑哪些測試命令）
- 完成定義（必須提供哪些截圖/測試報告/說明）

限制：每個任務預估改動不超過 {MaxFilesChanged} 個檔案。

【Scenario 清單】{PasteScenarioList}
【Repo 結構摘要】{RepoStructure}
【限制】{Constraints}
```

---

## D. 把「流程 + 提示詞 + 命令」封裝成可攜 Skill（你要的「下個專案也能照做」）

你要的可重複使用性，關鍵在：把上述流程固化在 `skills/project-playbook-skill/` 裡，讓 agent 在任何 repo 都能載入同一套規範。GitHub 與 VS Code 都把 Agent Skills 定義為「指令、腳本、資源的資料夾」，可跨多種 agent 使用。citeturn0search2turn0search13

### Prompt 90｜生成 Skill 資料夾內容（一次到位）
```text
你是 Agent Skills 套件作者。
請為我產出一個可直接放到 /skills/project-playbook-skill/ 的內容清單與檔案草稿（以 Markdown 顯示每個檔案內容），包含：

1) instructions.md
- 專案的五個 Gate 流程
- 每個 Gate 的輸入/輸出/DoD
- coding agent 的工作粒度規則（1 Scenario / 1 PR）
- 禁止事項（避免大重構、避免改 UI contract 等）

2) commands.md
- 本機常用命令（dev、test、e2e、report、trace）
- CI 建議命令（快測/慢測分層）

3) templates/
- 00-brief.md 模板
- 00-done.md 模板
- 01-ui-contract.md 模板
- 02-acceptance.feature 模板
- PR checklist 模板（含驗收與測試）

4) resources/
- data-testid 規範
- Scenario 到測試檔案 mapping 範本

要求：
- 用詞正式、可直接複製進 repo
- 不引用特定專案名稱（使用占位符）
```

---

## E. 我建議你「現在」的下一步（不需要等你補充，也能直接動）

1) 我們先把你附件原型整理為 `/docs/01-ui-contract.md`（Gate 1）  
2) 我再把 UI contract 轉成 `/docs/02-acceptance.feature`（Gate 2）  
3) 你確認 Scenario（用勾選方式），確認後才進入 Playwright 與 coding agent 切 PR（Gate 3/4）

如果你同意這個節奏，你只要在下一則訊息貼上：  
- 你這個專案的「頁面清單（或你想要的頁面）」  
- 以及「你認為最核心的 5 條動線（用一句話描述即可）」  
我就會直接用上面的 Prompt 10/20 的格式，替你產出可落地文件，並同時把它整理成你下一個專案可重複使用的模板。

navlist近期「Agent Skills／多代理開發」相關動向（供你對內簡報引用）turn1news25,turn1news26,turn1news30


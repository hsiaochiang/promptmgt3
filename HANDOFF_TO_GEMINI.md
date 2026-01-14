# Gemini Code Assist 任務交接

> 任務：建立一個 Skill，學習 Wilson 在網站上的提示詞分類過程

---

## 一、核心目標

建立一個**學習型 Skill**，能夠：
1. 觀察 Wilson 在網站（localhost:3002）上如何分類提示詞
2. 記錄他的分類決策
3. 分析模式並歸納規則
4. 隨著互動次數增加，越來越懂 Wilson 的分類邏輯

---

## 二、什麼是 Skill？

在這個情境中，Skill 是指：
- 一個可重複執行的「學習流程」
- 不是自動監控，而是當 Wilson 需要時手動觸發
- 每次執行都會累積學習成果

---

## 三、你需要建立的 Skill

### Skill 名稱
`wilson-classification-learner`

### Skill 功能

**輸入**：
- Wilson 分類好的提示詞列表（從網站資料庫讀取）
- 時間範圍（例如：今天新分類的 10 筆）

**處理**：
1. 讀取 Wilson 的分類結果
   ```
   從 apps/server/data/projects/ 讀取最近更新的檔案
   或 Wilson 指定的檔案範圍
   ```

2. 分析分類模式
   ```
   比較：同類型的提示詞放在哪個專案？
   歸納：什麼特徵導致 Wilson 選擇某個專案？
   ```

3. 萃取規則
   ```yaml
   pattern:
     when: [觸發條件]
     then: [分類結果]
     confidence: [信心度]
     examples: [案例清單]
   ```

**輸出**：
1. 更新 `knowledge-base/patterns/wilson-rules.md`
2. 更新 `.gemini/instructions.md`（加入新規則）
3. 生成學習報告

---

## 四、Skill 定義檔案結構

請創建以下檔案：

### 檔案 1：`.agent/skills/classification-learner.md`

```markdown
---
name: classification-learner
description: 學習 Wilson 的提示詞分類模式
version: 1.0
---

## 功能說明

觀察並學習 Wilson 在網站上的分類行為，歸納出可重複應用的規則。

## 執行時機

當 Wilson 完成一批分類後，手動觸發此 Skill：
- Wilson：「Gemini，我剛分類了 10 筆，幫我學習」
- 或：「分析今天的分類並更新規則」

## 輸入參數

- `source`: 資料來源（'recent' | 'today' | 'manual'）
- `count`: 要分析的提示詞數量（預設 10）
- `files`: 手動指定的檔案清單（可選）

## 執行步驟

### Step 1: 讀取資料
\`\`\`
if source == 'recent':
  從 apps/server/data/projects/ 找出最近修改的 N 筆
else if source == 'today':
  找出今天修改的所有檔案
else:
  使用 Wilson 提供的檔案清單
\`\`\`

### Step 2: 提取特徵
對每個提示詞提取：
- 標題關鍵字
- 內容主題
- 所屬專案
- frontmatter 的 tags

### Step 3: 模式分析
\`\`\`
分組分析：
  biz-operations 裡的提示詞有什麼共同點？
  code-best-practices 裡的有什麼共同點？
  
交叉比對：
  為什麼 A 在 biz-operations 而 B 在 personal-notes？
  差異是什麼？
\`\`\`

### Step 4: 規則萃取
\`\`\`yaml
新規則範例：
  pattern_id: rule_001
  when:
    title_contains: ['業務', '客戶', '拜訪']
    OR content_theme: 'business_activity'
  then:
    project: biz-operations
  confidence: high
  learned_from:
    - 會議邀請與地點說明.md
    - 業務拜訪資料與機會.md
  created_at: 2026-01-13
\`\`\`

### Step 5: 更新檔案
1. 追加到 `knowledge-base/patterns/wilson-rules.md`
2. 更新 `.gemini/instructions.md` 的「分類原則」區塊
3. 記錄到 `knowledge-base/interactions/[date]_learning-session.md`

### Step 6: 生成報告
\`\`\`markdown
# 學習報告

## 本次分析
- 分析筆數：10
- 新增規則：2 條
- 更新規則：1 條

## 新規則
### 規則 #3：技術文件識別
- 觸發：標題含 Git, DDD, 架構
- 分類：code-best-practices
- 信心度：HIGH
- 案例：git-教學與範例.md

## 規則庫統計
- 總規則數：5
- 覆蓋率：估計 75%
\`\`\`

## 輸出

- 更新的規則檔案路徑
- 學習報告內容
- 建議 Wilson 查看的重點
```

---

## 五、支援檔案結構

### 檔案 2：`knowledge-base/patterns/wilson-rules.md`

```markdown
---
version: 1.0
total_rules: 0
last_updated: 2026-01-13
---

# Wilson 的分類規則庫

> 從實際分類行為中學習到的規則

## 規則 #1：[等待學習]

**觸發條件**：
- 

**分類結果**：

**信心度**：

**案例**：
- 

**學習時間**：

---

## 統計

- 總規則數：0
- 最後更新：
- 覆蓋專案：
```

### 檔案 3：`knowledge-base/interactions/template-learning-session.md`

```markdown
---
date: YYYY-MM-DD
type: learning-session
analyzed_count: 0
new_rules: 0
updated_rules: 0
---

# 學習會議記錄

## 分析來源
- 

## 發現的模式
- 

## 新增/更新的規則
- 

## Wilson 的反饋
- 

## 下次改進
- 
```

---

## 六、執行範例

### 場景 1：Wilson 分類了 10 筆

**Wilson**：
```
Gemini，我剛在網站上把 10 個提示詞分類到專案了，
幫我分析學習一下。
```

**Gemini（你）執行**：
1. 讀取最近 10 筆修改的檔案
2. 分析分類模式
3. 萃取規則
4. 更新規則庫
5. 回報學習成果

**回應 Wilson**：
```
✓ 已分析 10 筆分類

新學到的規則：
- 規則 #1：業務場景優先
  發現您將「會議邀請」、「業務拜訪」都放在 biz-operations
  歸納：涉及客戶/商業活動 → biz-operations

- 規則 #2：技術文件識別  
  發現您將「Git教學」、「DDD實踐」放在 code-best-practices
  歸納：開發相關教學 → code-best-practices

已更新：
- knowledge-base/patterns/wilson-rules.md（新增 2 條規則）
- .gemini/instructions.md（更新分類指南）

建議：下次處理新資料時，我可以參考這些規則提供建議。
```

### 場景 2：Wilson 想看目前學到什麼

**Wilson**：
```
Gemini，總結一下目前學到的規則
```

**Gemini（你）回應**：
```
讀取 knowledge-base/patterns/wilson-rules.md

目前學到 5 條規則：

1. 業務優先原則（信心度：HIGH）
   - 業務/客戶相關 → biz-operations
   - 案例：8 筆

2. 技術文件識別（信心度：HIGH）
   - 程式碼/開發教學 → code-best-practices
   - 案例：5 筆

3. ...

覆蓋率：約 70%
建議：再累積 10-20 筆可達到 85%
```

---

## 七、開始執行

### Task 1：創建 Skill 結構

請你（Gemini）執行：

1. 創建 `.agent/skills/classification-learner.md`（如上述格式）
2. 創建 `knowledge-base/patterns/wilson-rules.md`（空白規則庫）
3. 創建學習記錄模板

### Task 2：首次學習

當檔案創建完成後：

1. 掃描 `apps/server/data/projects/` 下現有的 71 筆
2. 分析這些提示詞的分類
3. 歸納出初步規則（3-5 條）
4. 更新到規則庫
5. 告訴 Wilson 學習結果

---

## 八、重要提醒

### 這個 Skill 不會

❌ 自動監控網站操作
❌ 即時分析每個動作
❌ 需要一直運行

### 這個 Skill 會

✓ 在 Wilson 請求時執行
✓ 讀取檔案系統的分類結果
✓ 定期累積學習成果
✓ 越來越準確

### 互動模式

```
Wilson 在網站分類（自己的節奏）
  ↓
完成一批後（可能 10 筆）
  ↓
呼叫 Gemini：「學習這批」
  ↓
Gemini 執行 Skill
  ↓
更新規則庫
  ↓
下次建議更準
```

---

## 九、成功指標

每次學習後可以衡量：
- 新增了幾條規則？
- 規則庫總共幾條？
- 覆蓋率達到多少？
- Wilson 認為準確嗎？

目標：
- 第 1 週：累積 5-10 條基礎規則
- 第 2 週：覆蓋率達 70%
- 第 3 週：覆蓋率達 85%
- 第 4 週：可以自動分類新資料，Wilson 只需確認

---

**Gemini，請開始創建這個 Skill！**

Task 1 完成後告訴 Wilson：
「Skill 結構已建立，準備開始首次學習。」


---

## 一、專案背景

### 專案名稱
Prompt Asset Hub - AI 提示詞資產管理系統

### 核心目標
建立一個「會學習的分類系統」，透過記錄 Wilson 的分類決策，逐步理解他的分類偏好，最終成為「另一個 Wilson」的智能助手。

### 為什麼需要你
Wilson 有 650+ 個提示詞需要分類到不同專案中。我們希望透過互動學習的方式，讓系統越來越懂 Wilson 的分類邏輯，而非硬性規則。

---

## 二、現有資料結構

### 專案分類（已建立）

```
apps/server/data/projects/
├── biz-operations/          # 業務與會議
├── cloud-orange-rfp/        # 雲橘工作說明書
├── code-best-practices/     # 程式碼最佳實踐
├── file-search-automation/  # 檔案搜尋自動化
├── fin-inquiry-bot/         # 財務詢價機器人
├── gen-ai-guidelines/       # Gen AI 使用指南
├── gov-rfp-helper/          # 政府標案輔助
├── hackmd-automation/       # HackMD 自動化
├── personal-notes/          # 個人筆記/雜項
├── prompt-mgt-system/       # 本系統設計
└── ... (共 13+ 個專案)
```

### 已分類的提示詞

目前有 71 個提示詞已經分類到上述專案中，位於：
```
apps/server/data/projects/[專案名稱]/prompts/*.md
```

### 學習記錄資料夾

```
knowledge-base/
├── interactions/     # 互動記錄（Wilson 的決策過程）
├── decisions/        # 重要決策的詳細說明
└── patterns/         # 從互動中萃取的規則模式
```

---

## 三、你的任務

### 階段 1：驗證現有分類（第一批 20 筆）

**目標**：從已分類的 71 筆中，隨機選 20 筆，請 Wilson 驗證分類是否合理。

**執行步驟**：

1. **讀取現有提示詞**
   ```
   從 apps/server/data/projects/ 各專案的 prompts/ 目錄
   隨機選擇 20 個 .md 檔案
   ```

2. **提取關鍵資訊**
   - 檔案路徑
   - frontmatter 中的 title
   - 內容前 200 字
   - 目前所屬專案

3. **生成驗證清單**
   ```markdown
   # 第一批驗證清單（20 筆）
   
   ## 1. 會議邀請與地點說明
   - 目前分類：biz-operations
   - 內容摘要：[前 200 字]
   - Wilson 您認為：✓ 正確 / ✗ 應改為：_______
   - 理由：
   
   ## 2. Git 教學與範例
   - 目前分類：code-best-practices
   - 內容摘要：[前 200 字]
   - Wilson 您認為：✓ 正確 / ✗ 應改為：_______
   - 理由：
   
   ... (共 20 筆)
   ```

4. **儲存清單**
   ```
   儲存到：knowledge-base/interactions/2026-01-13_batch-01-verification.md
   ```

### 階段 2：記錄 Wilson 的決策

當 Wilson 回覆驗證結果後：

1. **分析修正模式**
   - 哪些分類他同意？
   - 哪些他修正了？
   - 修正的理由是什麼？

2. **萃取規則**
   ```yaml
   # 範例
   pattern:
     when: 提示詞涉及「業務拜訪」、「客戶會議」
     then: 優先歸類到 biz-operations
     reason: 業務場景 > 會議工具
     confidence: high
   ```

3. **更新規則庫**
   ```
   將萃取的規則寫入：
   knowledge-base/patterns/wilson-classification-patterns.md
   ```

4. **更新你的指令檔**
   ```
   將新規則加入：
   .gemini/instructions.md
   ```

### 階段 3：處理新資料（後續批次）

當有新的提示詞需要分類時：

1. **參考已建立的規則**
   - 讀取 knowledge-base/patterns/
   - 讀取 .gemini/instructions.md

2. **提出分類建議**
   ```markdown
   # 第二批分類建議（50 筆）
   
   ## 1. [提示詞標題]
   - 建議分類：biz-operations
   - 信心度：85%
   - 理由：內容涉及業務場景，符合規則 #1
   - 備選方案：personal-notes（若無涉及客戶）
   
   ...
   ```

3. **記錄互動**
   - Wilson 同意 → 記錄成功案例
   - Wilson 修正 → 記錄修正理由 → 更新規則

---

## 四、輸出格式範本

### 驗證清單格式

```markdown
---
date: 2026-01-13
batch: 01
type: verification
total: 20
---

# 第一批驗證清單

## 提示詞 1
- **檔案**：`apps/server/data/projects/biz-operations/prompts/會議邀請與地點說明.md`
- **標題**：會議邀請與地點說明
- **目前分類**：biz-operations
- **內容摘要**：
  ```
  [前 200 字內容]
  ```
- **Wilson 驗證**：
  - [ ] ✓ 分類正確
  - [ ] ✗ 應改為：___________
  - 理由：

---

## 提示詞 2
...
```

### 規則萃取格式

```markdown
# Wilson 的分類規則庫

## 規則 1：業務優先原則

**觸發條件**：提示詞涉及業務、客戶、拜訪

**分類結果**：biz-operations

**信心度**：HIGH

**來源**：Wilson 修正案例 #3, #7, #12
```

---

## 五、開始執行

當你準備好後，請：

1. 讀取 `apps/server/data/projects/` 下所有提示詞
2. 隨機選擇 20 筆
3. 生成第一批驗證清單
4. 儲存到 `knowledge-base/interactions/2026-01-13_batch-01-verification.md`
5. 告訴 Wilson 已完成

---

**Gemini，你準備好開始了嗎？**

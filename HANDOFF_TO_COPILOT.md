# GitHub Copilot 任務交接

> 任務：建立學習系統，記錄並學習 Wilson 的提示詞分類模式

---

## 一、專案背景

### 系統名稱
Prompt Asset Hub - AI 提示詞資產管理系統

### 核心目標
建立一個能夠學習 Wilson 分類偏好的系統。隨著 Wilson 在網站上分類更多提示詞，系統會越來越理解他的邏輯，最終能提供精準的分類建議。

### 為什麼需要你
- Wilson 有 650+ 個提示詞需要分類
- 目前已有 71 個提示詞完成分類
- 需要從這 71 個中學習模式
- 協助處理剩餘 600 個的分類

---

## 二、現有資料結構

### 專案目錄
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

### 提示詞檔案格式
```markdown
---
id: uuid
title: 提示詞標題
projectId: 專案UUID
slug: 檔案slug
status: draft/ready/deprecated
tags: [標籤1, 標籤2]
createdAt: 日期
updatedAt: 日期
---

# 提示詞內容

提示詞的正文...
```

### 學習記錄目錄
```
knowledge-base/
├── interactions/     # 每次學習的記錄
├── patterns/         # 歸納出的規則
└── decisions/        # 重要決策說明
```

---

## 三、你的任務

### Task 1：分析現有的 71 筆提示詞

**目標**：從已分類的提示詞中學習 Wilson 的分類邏輯

**執行步驟**：

#### Step 1：掃描所有提示詞
```javascript
// 需要讀取的路徑
const projectsDir = 'apps/server/data/projects/';

// 遍歷每個專案的 prompts/ 目錄
// 提取：
// - 檔案路徑
// - frontmatter (title, tags, projectId)
// - 內容前 200 字
// - 所屬專案名稱
```

#### Step 2：分組分析
```
按專案分組：
  biz-operations 裡有哪些提示詞？
  code-best-practices 裡有哪些？
  ...

提取共同特徵：
  - 標題關鍵字
  - 內容主題
  - tags 模式
```

#### Step 3：歸納規則
```yaml
規則範例：
  rule_id: 001
  name: 業務場景優先
  pattern:
    title_keywords: ['業務', '客戶', '拜訪', '會議']
    content_themes: ['商業活動', '客戶管理']
  action:
    classify_to: biz-operations
  confidence: HIGH
  examples:
    - apps/server/data/projects/biz-operations/prompts/會議邀請與地點說明.md
    - apps/server/data/projects/biz-operations/prompts/業務拜訪資料與機會.md
  notes: 即使包含「會議」關鍵字，但核心是業務場景
```

#### Step 4：生成規則文件
```markdown
# Wilson 的分類規則庫

## 規則 #1：業務場景優先

**觸發條件**：
- 標題或內容包含：業務、客戶、拜訪、商機
- 明確涉及商業活動或客戶關係

**分類結果**：biz-operations

**信心度**：HIGH

**案例**：
- 會議邀請與地點說明（涉及業務拜訪場景）
- 業務拜訪資料與機會（明確的商業活動）

**備註**：
業務會議 ≠ 個人會議。即使同樣是「會議」主題，
商業場景優先歸類到 biz-operations 而非 personal-notes。

---

## 規則 #2：技術文件識別
...
```

#### Step 5：儲存結果
```
1. 創建 knowledge-base/patterns/wilson-classification-rules.md
2. 更新 .github/copilot-instructions.md（加入規則摘要）
3. 生成學習報告到 knowledge-base/interactions/2026-01-13_initial-learning.md
```

---

### Task 2：提供分類建議（後續階段）

當有新提示詞需要分類時：

```markdown
# 新提示詞分析

## 提示詞：[標題]
內容摘要：[前 200 字]

## 分析
- 關鍵字匹配：業務(✓), 客戶(✓)
- 主題判斷：商業場景
- 符合規則：#1 業務場景優先

## 建議
- **推薦分類**：biz-operations
- **信心度**：85%
- **理由**：涉及客戶互動，符合業務場景特徵
- **備選**：personal-notes（如果確認為純個人記錄）
```

---

## 四、輸出格式

### 學習報告格式

```markdown
---
date: 2026-01-13
type: initial-learning
analyzed_files: 71
rules_generated: 5
coverage_estimate: 70%
---

# 初次學習報告

## 分析概況
- 掃描專案：13 個
- 分析提示詞：71 個
- 新增規則：5 條

## 發現的主要模式

### 業務相關（biz-operations）
共 12 筆提示詞
共同特徵：
- 關鍵字：業務、客戶、會議、拜訪
- 主題：商業活動、客戶關係管理
- 案例：會議邀請、業務拜訪資料

### 技術文件（code-best-practices）
共 8 筆提示詞
共同特徵：
- 關鍵字：Git、DDD、架構、程式碼
- 主題：開發教學、最佳實踐
- 案例：Git教學、資料儲存建議

### 政府標案（gov-rfp-helper）
...

## 歸納規則

### 規則 #1：業務場景優先
[詳細內容]

### 規則 #2：技術文件識別
[詳細內容]

...

## 統計

- 總規則數：5
- 估計覆蓋率：70%
- 未覆蓋案例：約 21 筆（需更多學習）

## 建議

1. 規則已可用於初步分類建議
2. 建議再累積 20-30 筆互動以提升準確度
3. 特別關注：personal-notes 與其他類別的區分標準
```

---

## 五、執行方式

### 啟動方式

**在 VS Code 中**：
1. 按 `Ctrl + I` 或點擊 Copilot Chat 圖標
2. 輸入以下任一指令：

```
選項 A（簡潔）：
「請執行 HANDOFF_TO_COPILOT.md 中的 Task 1」

選項 B（明確）：
「請分析 apps/server/data/projects/ 下所有提示詞，
 歸納 Wilson 的分類規則，
 並生成規則文件到 knowledge-base/patterns/」

選項 C（詳細）：
「請讀取 HANDOFF_TO_COPILOT.md 了解任務背景，
 然後執行 Task 1：分析 71 筆已分類的提示詞，
 生成初步規則庫」
```

### 預期輸出

Copilot 會：
1. 掃描 71 個提示詞檔案
2. 分析分類模式
3. 創建規則文件
4. 生成學習報告
5. 回報：「已分析 71 筆，生成 5 條規則，詳見 knowledge-base/patterns/」

---

## 六、重要提醒

### 分析重點

**要觀察的**：
- ✓ 相同專案裡的提示詞有什麼共同點
- ✓ 不同專案之間的差異是什麼
- ✓ Wilson 為什麼選擇 A 專案而不是 B 專案

**要避免的**：
- ✗ 過度細緻的規則（會難以應用）
- ✗ 只看關鍵字（要理解語意）
- ✗ 忽略特例（特例也是規則的一部分）

### 規則品質標準

**好的規則**：
```yaml
明確：觸發條件清楚
可驗證：可以判斷是否符合
有案例：至少 2-3 個實例支持
有信心度：標示 HIGH/MEDIUM/LOW
```

**不好的規則**：
```
模糊：「看起來像是...」
主觀：「感覺應該...」
無案例：「應該會有...」
```

---

## 七、後續階段

### 階段 2：持續學習

當 Wilson 在網站分類新的提示詞後，他會告訴你：
```
「Copilot，我剛分類了 10 筆，請學習並更新規則」
```

你需要：
1. 找出最近修改的檔案
2. 分析新的分類決策
3. 更新或新增規則
4. 回報學習成果

### 階段 3：提供建議

準確率 >80% 後，可以開始建議新資料的分類：
```
「Copilot，這個新提示詞應該分到哪裡？
 標題：[...]
 內容：[...]」
```

---

## 八、檔案清單

執行後應創建以下檔案：

### 必須創建
- [ ] `knowledge-base/patterns/wilson-classification-rules.md`（規則庫）
- [ ] `knowledge-base/interactions/2026-01-13_initial-learning.md`（學習報告）

### 選擇性創建
- [ ] 分析過程的中間檔案（JSON 或 CSV）
- [ ] 統計圖表（如果有視覺化需求）

### 更新檔案
- [ ] `.github/copilot-instructions.md`（加入規則摘要）

---

## 九、成功標準

### Task 1 完成指標
- ✓ 成功讀取 71 個提示詞檔案
- ✓ 歸納出 5-10 條規則
- ✓ 規則文件格式正確
- ✓ 學習報告完整
- ✓ Wilson 認為規則合理

### 品質檢查
```
規則是否明確？
案例是否充分？
覆蓋率是否 >60%？
Wilson 是否認同？
```

---

## 開始執行

**Copilot，請執行 Task 1：**

1. 掃描 `apps/server/data/projects/` 下所有提示詞
2. 分析 Wilson 的分類模式
3. 歸納 5-10 條規則
4. 生成規則文件到 `knowledge-base/patterns/wilson-classification-rules.md`
5. 生成學習報告到 `knowledge-base/interactions/2026-01-13_initial-learning.md`
6. 告訴 Wilson 學習結果

**預估時間**：2-5 分鐘

**完成後回報**：「已分析 71 筆提示詞，生成 [N] 條規則」

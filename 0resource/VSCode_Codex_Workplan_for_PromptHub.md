# VS Code Insiders + Codex 端自動化工作說明（給 AI Coding 使用）

> 目的：在 **VS Code Insiders** 內，使用 **Codex**（或等效的 AI Coding Agent）對整個提示詞專案 Repo 進行「分析、產出建議、產出操作清單」；**不直接**替你做不可逆操作（搬檔、刪檔、覆寫正式欄位），由 Web 介面進行人工確認後再套用。

---

## 1. 總體原則（務必遵守）

1. **只做「建議」與「可逆」變更**  
   - Codex 端可寫入：`suggestions`、報表檔（`/ops/*.json|md`）、索引檔（`/indexes/*.md`）  
   - Codex 端避免直接做：搬移檔案、刪除檔案、批次改寫正式 tags/project/type（除非是明確的「Normalize 任務」且先產出影響清單）

2. **每次任務都要輸出可審核的結果檔**  
   - 輸出到 `/ops/`：JSON（供 Web UI 讀取）＋可讀的 Markdown 報表（供人工快速檢閱）

3. **所有建議要附：信心分數（0~1）＋理由（rationale）＋依據關鍵字（evidence）**  
   - 讓 Web UI 可以依門檻批次採用（例如 `confidence >= 0.80`）

4. **任何批次改寫（例如 tag normalize）都必須：先產出 mapping 與影響範圍 → 再套用**  
   - 兩階段：`plan`（只產出計畫）→ `apply`（套用）

---

## 2. Repo 基本約定（路徑與資料流）

### 2.1 目錄結構（建議）
- `/inbox/`：未歸檔草稿（Web 新增預設寫入）
- `/projects/<project>/prompts/`：正式提示詞
- `/snippets/`：常用片語（剪貼簿）
- `/ops/`：Codex 任務輸出（Web UI 讀取）
- `/reports/`：日報/週報/變更摘要（可選）
- `/indexes/`：索引頁（可選，如 tags index、project index）

### 2.2 Markdown Frontmatter（建議格式）
每個 prompt 檔案最上方可含 YAML frontmatter：

```yaml
---
id: "p_20251224_001"          # 可由 Web 產生
status: "inbox"               # inbox | active | archived | deprecated
project: null                 # Web 套用後寫入正式 project
type: null                    # Web 套用後寫入正式 type
tags: []                      # Web 套用後寫入正式 tags
suggestions:
  project: "ai-workflow-course"
  type: "RAG-調教"
  tags: ["RAG","課程簡報","n8n"]
  moveTo: "projects/ai-workflow-course/prompts/rag/"
  confidence: 0.86
  rationale: "內容包含...關鍵字...且與專案描述一致"
  evidence: ["AI Workflow","n8n","RAG","課程"]
audit:
  lastReviewedAt: null
  lastReviewedBy: null
---
```

> Codex 端主要寫入 `suggestions`（或更新其中部分欄位），正式欄位由 Web UI 套用。

---

## 3. 任務清單（VS Code + Codex 端要做什麼）

本節每一項任務都定義：**輸入範圍**、**輸出檔案**、**資料格式**、**成功判準**。

---

### 任務 A：Inbox Triage（未歸檔草稿分析與歸檔建議）

**目的**：掃描 `/inbox/*.md`，為每個檔案產出「專案/類型/tags/歸檔路徑」建議，並寫入 frontmatter 的 `suggestions` 與輸出 `/ops/triage_YYYYMMDD.json`。

#### A1. 輸入
- 目錄：`/inbox/`
- 參照資料（用來判斷專案與資料夾）：
  - `/projects/**/README.md`（如有）
  - `/projects/**/project.meta.json`（如有）
  - `/indexes/project_index.md`（如有）

#### A2. 輸出
- `/ops/triage_YYYYMMDD.json`
- `/ops/triage_YYYYMMDD.md`（人類可讀報表）
- 可選：更新每篇 inbox 檔案 frontmatter 的 `suggestions`

#### A3. JSON Schema（建議）
```json
{
  "runId": "triage_20251224_001",
  "createdAt": "2025-12-24T13:00:00+08:00",
  "scope": { "path": "inbox/", "count": 12 },
  "items": [
    {
      "path": "inbox/xxx.md",
      "id": "p_20251224_001",
      "title": "…",
      "suggestions": {
        "project": "ai-workflow-course",
        "type": "RAG-調教",
        "tags": ["RAG","課程簡報","n8n"],
        "moveTo": "projects/ai-workflow-course/prompts/rag/",
        "confidence": 0.86,
        "rationale": "…",
        "evidence": ["…","…"]
      },
      "flags": ["low_confidence", "missing_title"]
    }
  ]
}
```

#### A4. 成功判準
- 每個 inbox 檔案都有一筆 `items[]`
- 每筆皆含 `confidence`、`rationale`、`moveTo`
- Markdown 報表中，至少列出：檔名、建議專案、建議路徑、信心、理由摘要

#### A5. Codex 指令模板（給 AI Agent 的 Prompt）
- 「掃描 `inbox/` 下所有 markdown，根據內容推論 project/type/tags，並依 `projects/` 既有結構建議 moveTo。輸出 JSON 與 Markdown 報表到 `ops/`，並在各檔 frontmatter 填入 suggestions（不改正式欄位）。」

---

### 任務 B：Changes Summary & Commit Assistant（變更摘要與 Commit 訊息建議）

**目的**：對本次變更（建議以 **staged changes** 為準）產出：
- 建議 commit message
- 變更摘要（release note 風格）
- 風險註記（例如大量搬檔、標籤規則改動）

#### B1. 輸入
- Git staged diff（或 working tree diff）
- 目錄結構與命名規範（可從 `/README.md` 或 `/indexes/` 取得）

#### B2. 輸出
- `/ops/commit_YYYYMMDD_HHMM.md`
- `/ops/commit_YYYYMMDD_HHMM.json`（可選）

#### B3. Markdown 內容（建議）
```md
# Commit 建議（commit_20251224_1305）

## 建議 Commit Message
feat(triage): add suggestions for 12 inbox prompts

## 變更摘要
- …
- …

## 風險與注意事項
- …

## 受影響專案
- …
```

#### B4. 成功判準
- 提供 1~3 個 commit message 方案（保守/標準/精簡）
- 摘要需可直接貼入週報

#### B5. Codex 指令模板
- 「讀取 staged diff，產出 commit message 建議（3 版本）＋變更摘要＋風險註記，輸出到 `ops/commit_*.md`。」

---

### 任務 C：Snippet Candidates Mining（常用片語候選挖掘）

**目的**：從 prompts 內容找出高頻重複段落，生成候選 snippets 清單，供 Web UI 一鍵建立到 `/snippets/`。

#### C1. 輸入
- 範圍：
  - 預設：`/projects/**/prompts/**/*.md`
  - 可選：只掃指定專案

#### C2. 輸出
- `/ops/snippet_candidates_YYYYMMDD.json`
- `/ops/snippet_candidates_YYYYMMDD.md`

#### C3. JSON Schema（建議）
```json
{
  "runId": "snip_20251224_001",
  "items": [
    {
      "candidateName": "角色設定－資深系統分析顧問",
      "category": "role",
      "content": "…",
      "frequency": 18,
      "sourceRefs": ["projects/.../a.md#L1-L20", "projects/.../b.md#L5-L25"],
      "confidence": 0.82
    }
  ]
}
```

#### C4. 成功判準
- 每筆候選至少附 2 個 `sourceRefs`
- `content` 需為可直接用作 snippet 的完整段落

#### C5. Codex 指令模板
- 「掃描 prompts，找出重複段落（角色設定/輸出格式/限制條款優先），為每段落產生候選 snippet（名稱、類別、內容、出現次數、來源），輸出到 ops。」

---

### 任務 D：Similarity / Duplicate Detection（相似提示詞與重複偵測）

**目的**：找出高度相似的 prompts，協助你判斷是否要：
- 合併為模板
- 抽出 snippet
- 標記 `duplicateOf`

#### D1. 輸入
- `/projects/**/prompts/**/*.md`

#### D2. 輸出
- `/ops/similarity_YYYYMMDD.json`
- `/ops/similarity_YYYYMMDD.md`

#### D3. JSON Schema（建議）
```json
{
  "pairs": [
    {
      "a": "projects/x/prompts/a.md",
      "b": "projects/y/prompts/b.md",
      "similarity": 0.87,
      "overlapSummary": ["共有段落：角色設定…", "共同限制條款…"],
      "recommendation": "extract_template",
      "confidence": 0.78
    }
  ]
}
```

#### D4. 成功判準
- 列出 Top N（例如 30 組）最相似 pair
- 每組含 recommendation 與 overlapSummary

---

### 任務 E：Tag Normalization Plan & Apply（標籤規範化：先計畫、再套用）

**目的**：解決標籤漂移（大小寫、同義字、重複概念）。

#### E1. 兩階段流程
1) **Plan**：只盤點 tags、提出 mapping、計算影響範圍  
2) **Apply**：依 mapping 批次修改檔案 tags（可選：只改 `status=active`）

#### E2. 輸入
- 所有含 `tags:` frontmatter 的檔案（prompts + snippets）

#### E3. 輸出
- Plan：
  - `/ops/tag_normalize_plan_YYYYMMDD.json`
  - `/ops/tag_normalize_plan_YYYYMMDD.md`
- Apply：
  - `/ops/tag_normalize_apply_YYYYMMDD.md`（記錄實際改動）
  - 可選：`/reports/tag_normalize_YYYYMMDD.md`

#### E4. Plan JSON Schema（建議）
```json
{
  "mapping": [
    { "from": ["內訓","講座","教學"], "to": "課程與內訓", "confidence": 0.84 }
  ],
  "impact": [
    { "tag": "內訓", "files": 12 },
    { "tag": "講座", "files": 5 }
  ]
}
```

#### E5. 成功判準
- Plan 報表列出：
  - mapping 清單
  - 影響檔案數
  - 風險提示（例如「此 mapping 可能過度合併」）

#### E6. Codex 指令模板
- Plan：「盤點全 repo tags，提出 normalize mapping 與影響範圍，輸出 plan（不改檔）。」
- Apply：「依已確認的 mapping 批次更新 tags，先產出 diff 概要，再實際改檔並輸出 apply 報告。」

---

### 任務 F：Prompt Linter（提示詞品質規範檢查）

**目的**：檢查是否符合你固定的提示詞結構與規範（例如：需包含角色/任務/輸出格式、需有資料來源要求、需用繁體中文等）。

#### F1. 輸入
- `/projects/**/prompts/**/*.md`

#### F2. 輸出
- `/ops/lint_YYYYMMDD.json`
- `/ops/lint_YYYYMMDD.md`

#### F3. Lint 規則（示例）
- 缺少「回覆格式」段落
- 缺少「不知道就說不知道」限制
- 缺少「需附資料來源」要求
- 語氣不符合（可選）
- 標題過長/命名不一致（可選）

#### F4. 成功判準
- 報表能列出：
  - 問題類型統計
  - 每個檔案的違規項目與建議修正句

---

### 任務 G：Index Generator（索引頁生成）

**目的**：生成 Web UI 或人工瀏覽用索引檔。

#### G1. 輸入
- prompts/snippets 的 frontmatter（project/type/tags/status）

#### G2. 輸出
- `/indexes/project_index.md`
- `/indexes/tag_index.md`
- `/indexes/inbox_queue.md`（可選）

#### G3. 成功判準
- 索引可被 Web UI 讀取或直接用 Markdown 瀏覽
- 每個條目含路徑與簡短摘要（可選）

---

## 4. VS Code 任務編排（建議）

> 實作方式不限定，但建議讓每個任務有清楚入口，便於你在 VS Code Command Palette 一鍵觸發。

### 4.1 建議的 Task 名稱（概念）
- `Triage Inbox`
- `Generate Commit Summary`
- `Mine Snippet Candidates`
- `Detect Similar Prompts`
- `Tag Normalize (Plan)`
- `Tag Normalize (Apply)`
- `Prompt Lint`
- `Generate Indexes`

### 4.2 產物一致性
- 所有任務的輸出都必須落在 `/ops/`（或 `/indexes/`）並帶日期時間戳
- Web UI 只需要監控這些輸出檔案即可呈現建議

---

## 5. Web 介面對接注意事項（給 AI Coding 的交接點）

1. **Web UI 讀取 `/ops/*.json` 作為「建議清單」資料來源**
2. **Web UI 採用後，才做：**
   - 寫入正式 frontmatter：`project/type/tags/status`
   - 搬移檔案到 `suggestions.moveTo`
   - 回寫 `audit.lastReviewedAt/By`
3. 建議保留 `suggestions` 作為歷史參考，或採用後清空（由你決策）

---

## 6. 驗收清單（你可以用來檢查 AI 產出的品質）

- [ ] 任務 A：`ops/triage_*.json` 存在，且每筆含 confidence/rationale/evidence/moveTo
- [ ] 任務 B：`ops/commit_*.md` 可直接複製 commit message 與週報摘要
- [ ] 任務 C：候選 snippets 具體可用，且附來源
- [ ] 任務 E：normalize 必須先 plan 後 apply，且 plan 有 impact
- [ ] 所有輸出都有日期戳、runId、scope

---

## 7. 建議的最小可用版本（MVP 順序）

1. **Inbox Triage（任務 A）**：立即解決「未歸檔」痛點  
2. **Commit Summary（任務 B）**：降低版本控管心智負擔  
3. **Snippet Candidates（任務 C）**：建立剪貼簿資產池  
4. **Tag Normalize Plan/Apply（任務 E）**：長期維護品質  
5. **Lint + Index（任務 F/G）**：規模變大後再上

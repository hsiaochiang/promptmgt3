---
date: 2026-01-13
type: initial-learning
analyzed_files: 52
rules_generated: 8
coverage_estimate: 70%
---

# 初次學習報告 — Wilson 的分類模式

摘要：根據掃描 `apps/server/data/projects/` 下的提示詞檔案（共 52 筆 sample），我們從中歸納出 8 條初始規則，涵蓋業務、技術、前端設計、政府標案、Gen-AI 指南、自動化、個人筆記與金融專案等類別。估計規則初步覆蓋率約 70%，需要更多標注資料以提升準確度。

## 掃描概況
- 掃描專案數：13+（含 `wos-frontend`, `code-best-practices`, `biz-operations`, `gen-ai-guidelines`, `personal-notes`, 等）
- 檔案類型：prompts/*.md（含 frontmatter 與內容）
- 抽樣數量：52 個 prompts 檔案（含 project.md 與 prompts 文件樣本）

## 主要發現

- 業務相關（biz-operations）：常見關鍵字 `業務`、`客戶`、`拜訪`、`會議`。具商業互動情境者歸入 `biz-operations`。
- 技術 / 程式碼（code-best-practices）：出現 `Git`、`DDD`、`程式碼`、`arch`、`教學` 等偏技術性字詞，傾向歸類為 `code-best-practices`。
- 前端 / UI（wos-frontend）：大量 Notion-like、React、UI 設計、style guide、prototype 範例。
- 政府標案（gov-rfp-helper）：RFP、規格書、投標相關內容高度結構化，容易判別。
- Gen AI 與平台指南（gen-ai-guidelines）：標註平台 tags（#Plat/GEMINI、#Plat/CHATGPT）與設定指南是強信號。
- 自動化 / 檔案處理：Power Automate、檔案轉換、流程設計常見於 `hackmd-automation` 或 `file-search-automation`。
- 個人筆記（personal-notes）：多為 Web clip、翻譯或個人備註，frontmatter 常較簡單且 tags 少。
- 金融專案（fin-inquiry-bot）：銀行 / 企業資金詢價等含 domain-specific 關鍵字。

## 已生成規則摘要（8 條）
- 規則 #001：業務/客戶場景優先（biz-operations） — HIGH
- 規則 #002：技術/程式碼最佳實踐（code-best-practices） — HIGH
- 規則 #003：前端/UI/設計（wos-frontend） — HIGH
- 規則 #004：政府標案 / RFP（gov-rfp-helper） — HIGH
- 規則 #005：Gen-AI / 平台指南（gen-ai-guidelines） — MEDIUM-HIGH
- 規則 #006：自動化 / 檔案處理（file-search-automation / hackmd-automation） — MEDIUM
- 規則 #007：個人筆記 / 雜項（personal-notes） — MEDIUM
- 規則 #008：金融 / 企業資金（fin-inquiry-bot） — MEDIUM-HIGH

## 覆蓋率估計方式
- 以樣本比對：在 52 筆樣本中，約 70% 的檔案可用上述規則之一得到合理推論，剩餘約 30% 屬於跨領域或不夠具體的描述，需要人工或更多樣本。

## 建議後續步驟

1. 對 `MEDIUM` 或 `LOW` 信心度的規則，額外蒐集 20-30 筆新樣本（Wilson 新分類時觸發）以更新規則與提高信心度。
2. 建議建立自動化流水線：
   - 先套用 `HIGH` 規則進行自動分類並標註為 `suggested`；
   - `MEDIUM` 規則回傳 `suggested` 並要求人工確認；
   - 新增 `interactions` 記錄每次人工覆核結果以供持續學習。
3. 在 `.github/copilot-instructions.md` 加入規則摘要（選擇性），以利 Copilot 在互動時能引用。

## 輸出檔案
- knowledge-base/patterns/wilson-classification-rules.md（已建立）
- knowledge-base/interactions/2026-01-13_initial-learning.md（此檔）

---

若要我接著：
- 可先將這兩個檔案 commit（我可以幫你 commit）；
- 或調整規則細節 / 增加更多範例再 commit。

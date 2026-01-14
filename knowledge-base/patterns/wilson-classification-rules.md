---
title: Wilson 的提示詞分類規則庫
generatedAt: 2026-01-13
author: Copilot
---

# Wilson 的分類規則庫（初版）

說明：以下規則根據 `apps/server/data/projects/` 下已分類提示詞樣本（約 52 個檔案）歸納而成。每條規則包含觸發條件、預期分類、信心度與案例。規則旨在簡潔可驗證，方便在自動化分類時套用與調整。

---

## 規則 #001：業務 / 客戶場景優先

**觸發條件**：
- 標題或前言包含關鍵字：業務、客戶、拜訪、商機、商業、Sales、會議邀請
- tags/分類含業務或 client/audience 指示（若有）

**分類結果**：biz-operations

**信心度**：HIGH

**案例**：
- apps/server/data/projects/biz-operations/prompts/業務拜訪資料與機會.md
- apps/server/data/projects/biz-operations/prompts/會議邀請與地點說明.md

**備註**：遇到「會議」字眼時，若同時含有商務/客戶語境，優先歸到 `biz-operations` 而非 `personal-notes`。

---

## 規則 #002：技術 / 程式碼最佳實踐

**觸發條件**：
- 標題或 tags 包含 Git、DDD、程式碼、架構、教學、技術、code、git
- 內容以技術教學、程式範例或工程實務為主

**分類結果**：code-best-practices

**信心度**：HIGH

**案例**：
- apps/server/data/projects/code-best-practices/prompts/git-教學與範例.md
- apps/server/data/projects/code-best-practices/prompts/ddd-coding-agent-skills.md

**備註**：若同時出現「技術」與「專案流程」的混合內容，以技術細節為主者仍歸入 code-best-practices。

---

## 規則 #003：前端 / UI / 設計類別

**觸發條件**：
- 標題或內容含前端、UI、UX、React、前端風格、設計、Notion、Canvas、prototype
- tags 指向 UI/UX、prototype 或 web 前端相關

**分類結果**：wos-frontend

**信心度**：HIGH

**案例**：
- apps/server/data/projects/wos-frontend/prompts/前端風格審查方法.md
- apps/server/data/projects/wos-frontend/prompts/React網站雛形設計.md

**備註**：若是工具性前端整合的程式碼（含技術實作），需視內容深度判斷是否歸入 code-best-practices。

---

## 規則 #004：政府標案 / RFP

**觸發條件**：
- 標題或內容包含 RFP、政府機關、標案、投標、招標、規格書
- tags 指向 client 或 Aud:CLIENT

**分類結果**：gov-rfp-helper

**信心度**：HIGH

**案例**：
- apps/server/data/projects/gov-rfp-helper/prompts/政府機關RFP範本與提示詞.md

**備註**：RFP 類內容通常具體列出文件結構、欄位、驗收條件，出現這類結構化段落可視為強信號。

---

## 規則 #005：Gen-AI / 平台整合與使用指南

**觸發條件**：
- 標題或 tags 包含 Gemini、Copilot、GPT、平台整合、設定自訂gpt、Gen AI
- 內容為平台使用指南、整合策略、prompt 設計或 Copilot 指令說明

**分類結果**：gen-ai-guidelines

**信心度**：MEDIUM-HIGH

**案例**：
- apps/server/data/projects/gen-ai-guidelines/prompts/gemini-內容處理方式.md
- apps/server/data/projects/gen-ai-guidelines/prompts/設定自訂gpt步驟.md

**備註**：此類常含平台 tag（#Plat/GEMINI, #Plat/CHATGPT），可作為次要觸發條件。

---

## 規則 #006：自動化 / 檔案處理（工具與流程）

**觸發條件**：
- 標題或內容包含檔案轉換、檔案查找、Power Automate、流程設計、automation、Power Platform

**分類結果**：file-search-automation 或 hackmd-automation（視專案語境）

**信心度**：MEDIUM

**案例**：
- apps/server/data/projects/file-search-automation/prompts/檔案轉換為md格式.md
- apps/server/data/projects/hackmd-automation/prompts/Power Automate XML 使用.md

**備註**：若內容偏程式整合（API、資料庫），考慮遷移到 code-best-practices。

---

## 規則 #007：個人筆記 / 雜項

**觸發條件**：
- 標題或內容是翻譯、備忘、工具使用教學（僅個人用途）、或明確標註為 personal-notes

**分類結果**：personal-notes

**信心度**：MEDIUM

**案例**：
- apps/server/data/projects/personal-notes/prompts/Excel 下拉選單設定.md
- apps/server/data/projects/personal-notes/prompts/翻譯成中文.md

**備註**：personal-notes 類往往缺少 projectId 且為單機/個人剪貼或 Web clip，遇到疑義可降為 low-confidence 建議人工確認。

---

## 規則 #008：金融 / 企業資金（專案導向）

**觸發條件**：
- 標題或內容包含銀行、資金、詢價、玉山、funding、banking

**分類結果**：fin-inquiry-bot

**信心度**：MEDIUM-HIGH

**案例**：
- apps/server/data/projects/fin-inquiry-bot/prompts/企業資金詢價1218.md
- apps/server/data/projects/fin-inquiry-bot/prompts/玉山資訊1218.md

**備註**：金融領域常有高機密或合規需求，分類時若出現敏感 tag（#SENSITIVE、#Aud/CLIENT），提高人工審核權重。

---

## 使用建議與後續調整

- 規則以「關鍵字 + 主題語意」共同觸發，避免僅用單一字串判定。
- 每條規則應保留最少 2-3 個支援實例；新分類決策出現時請回補案例並更新信心度。
- 建議先以高信心規則做自動分類；對 MEDIUM/LOW 規則回傳標示建議給 Wilson 做最終確認。

---

End of rules (初版)

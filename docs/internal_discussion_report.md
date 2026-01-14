# 內部討論版報告：企業資金詢價平台（平台化 + 雙端 AI 解析）

> 本報告為內部討論版（Technical Feasibility / 初步工期與報價估算），整理自原始 PDF「雲力橘子 SOC 平台 — 需求確認計畫」。內容專注於可執行之技術方向、系統構成、AI 解析需求與 MVP 範圍，供後續 SA / PM 與開發團隊快速決策。

---

## 1. 摘要與專案目標

- 專案目標：建立「企業資金詢價與回覆管理平台」，將分散於 email 的詢價流程轉為可追蹤、可自動化、可稽核的案件流（Case-based workflow），並透過 AI 協助解析 email、分類、抽取金額/天期等欄位，減少人工轉錄與漏接風險。
- 核心價值：
  - 集中化追蹤與可視化（Dashboard / 報表）
  - 降低人工處理成本與錯誤率
  - 提升回覆效率（含 SLA 管理與通知）

---

## 2. 主要業務場景（六大場域）與需求摘要

1. 身分驗證與存取控制（Foundation & Access Control）
   - 支援企業帳號、強制 2FA、SSO/AD 整合、session timeout、密碼政策等。
   - 目標頁：1~6 頁（會議內容分章），需在設計時列入合規、稽核追蹤欄位。

2. 組織架構與資產管理（Organization & Assets）
   - 支援多層級組織、群組、設備/資產屬性與擁有權管理。
   - 自動通知新成員、初始帳號設定。

3. 事件生命週期（Ticket Lifecycle）
   - 自建立到結案完整流程：建立 / 指派 / 處理 / 回覆 / 結案。
   - 保留處理紀錄、附件、版本與稽核 log。

4. 進階事件處理與批次作業
   - 批次接手、批次送出、錯誤重試、工作流自動化。

5. 情資整合、公告與第三方介接
   - RSS、STIX、對外公告、Email 模板管理、外部系統介接等。

6. 報表、儀表板與稽核
   - 產製定期報表（Word / PDF / 加密傳送）、Dashboard KPI、Audit Log。

---

## 3. To-Be 流程（端到端，Notion 式摘要）

1. 企業端（發信方）在平台建立詢價案件（產生 email 內容與識別碼並寄出）。
2. 企業端以自有郵件系統寄出詢價 email，銀行端收件人為「原經辦」。
3. 銀行端系統接收 email，執行 AI 解析並將結果分類成案件（含保留原文與解析結果）。
4. 銀行端通知原經辦（email 通知含 Web 連結），原經辦點連結後透過 SSO/AD 登入，進入 Web 表單填寫回覆內容並送出。
5. 系統紀錄版本、稽核資訊，並將回覆結果以通知 email 傳回企業端；企業端可透過 Dashboard 檢視回覆狀態與歷程。
6. 平台提供 Dashboard 與報表功能（回覆率、開信率、SLA 違規等）。

---

## 4. 技術設計要點（SAD Quick View）

### 前後端與服務分層
- 前端：Web Portal（企業端、銀行端），Notion-like 三欄式 UI（Sidebar / Main / Detail）以利案件檢視與快速操作。
- 後端：API 層（Inquiry Case Service）、Mail Connector、AI Parsing Service、Notification Service、Audit/Evidence Service。
- 資料層：Case / Email 原文 / Parsed Result / Audit Log / Templates。

### Mail Connector（雙端考量）
- 支援接收方式：企業寄送為「企業自有郵件系統寄出」，平台需能抓取或由企業端 push webhook；銀行端需能抓取到該郵件（Graph / IMAP / EWS 選項，實務上依銀行環境決定）。
- 強調：本專案不採用共享 mailbox（除非事先確定），優先以『個別 mailbox / delegated access / service account』作為可行模式。

### AI 解析服務（核心）
- 輸入：Email header（From/To/Date/Message-ID）、body、attachments。
- 輸出：結構化 JSON（fields：金額、天期、回覆指標、案件識別碼、confidence、原文 span）。
- 要求：prompt & model version 管理、置信度（confidence）欄位、原文定位（span）以利稽核與人工覆核。
- 人機協作：建立「低信度 → 人工覆核 → 回填」閉環，避免直接自動化錯誤回覆。

### 身分、權限與安全
- SSO/AD 整合（銀行端必須）、OAuth / Service Account 授權機制、原文儲存加密、最小化存取原則、Audit Log 必要欄位（who/when/what/before-after）。

---

## 5. 資安、合規與稽核建議

- 原文保存策略：首選「保留原文（加密）並限制存取範圍」，並且定義保存年限與刪除流程。
- 不可變證據：對於回覆或原文，應保留 hash 與時間戳，確保不可變更稽核來源。
- 對外界面防護：銀行端公開介面（若有）需 WAF、IPS、弱點掃描、日誌集中化。

---

## 6. MVP 建議（最小可交付範圍）

核心：企業端本地工具（Local Utility） + 銀行端 Email 收件解析 + 基本 Dashboard

- 企業端（MVP）：本地工具（名單/模板/一鍵寄送）、IMAP/SMTP 或企業 API 接入、回覆合併樣板。
- 銀行端（MVP）：接收 email → AI 解析 → 建立 case → 通知原經辦（含 Web 連結）→ 經辦透過 SSO 登入填寫回覆 → 系統寄出回覆並紀錄。
- 共通：原文儲存（加密）、稽核 log、簡易 Dashboard（案件列表、回覆狀態、回覆率）。

Phase 2（選配）：銀行端 Inbox 管理、指派/審核流程、SLA 監控、批次操作、更多報表／Export。

---

## 7. 主要風險與控制建議

1. Mail Connector 可行性差異（Graph / IMAP / Exchange）→ 控制：先做 PoC，確定銀行環境後再擇一實作。
2. Email 格式多樣與解析難度 → 控制：建立樣本庫、逐步擴充 template 與 human-in-loop。
3. SSO/AD 與內外網邊界（DMZ）→ 控制：明確邊界部署、必要時採 DMZ + API 轉發設計。
4. 保存政策與合規 → 控制：早期定義保存年限 / hash 證據 / 權限範圍。

---

## 8. 初步 WBS（供內部估時參考）

- Epic 1：平台基礎（前後端、CI/CD、身分驗證、稽核）
- Epic 2：Mail Connector（企業寄送 + 銀行收件）
- Epic 3：AI Parsing Service（Prompt/Schema、模型運行、confidence 與覆核流程）
- Epic 4：銀行端 Portal（案件列表、指派、回覆）
- Epic 5：企業端 Portal（送件歷程 / 回覆檢視 / 報表）
- Epic 6：測試 / UAT / 上線支援

主要成本驅動：Mail Connector 型式、AI 模型授權／雲端合規、SSO/AD 整合複雜度、是否保留原文與加密需求。

---

## 9. 接下來建議的決策項目（需內部確認）

1. Mail 接入方式：Graph / IMAP / EWS / 企業 push（需銀行確認）
2. 原文保存策略：是否保留原文（加密）與保存年限
3. AI 方案：Cloud LLM（需供應商與合規審查）或地端模型（需評估資源）
4. MVP 範圍確認：是否先以「企業端本地工具 + 銀行端解析 & 通知」作為最小範圍

---

## 10. 附註與交付內容

- 本檔為「內部討論版」草案，供 PM / SA / 技術評估會議使用。
- 可進一步輸出為：
  - SA / SDD 範本（技術架構細節）
  - RFP 草稿（供廠商投標）
  - RAG-ready chunks（供 LLM 檢索與回答使用）

---

如需，我可依此 MD 檔：
- 產出 SA / SDD 範本（含 Mermaid 流程圖）
- 將需求切分為可估時的 user stories 與 task list
- 產出 RAG chunk（metadata + content）以便後續進行 LLM 索引

請回覆要我先做哪一項（或下載此 MD）。

---
name: experience-depositor
description: Use when the user is committing changes, wants to reduce repeated effort, or asks to save learnings from debugging/UI changes. Also use after finishing any bugfix or UI adjustment.
---

# Experience Depositor Skill

<!--
【中文說明（註解區）】
用途：
- 當使用者準備提交（commit）變更、希望降低重複溝通成本、想把除錯或 UI/UX 調整的學習成果留下來時，啟用此 Skill。
- 亦適用於：任何 bugfix 或 UI 調整完成後的收尾階段，用來把「這次怎麼解」沉澱成可復用知識。
- 核心理念：讓每一次修改都能「累積可學習資料」，使後續相同問題的處理速度越來越快。

目標（Goal）：
- 將本次變更轉成「可檢索、可重現、可驗證」的經驗檔（Experience Note）
- 建立專案的內部知識庫（/experience/），讓 Coding Agent 在下次遇到相似情境前能先參考，避免重蹈覆轍

執行指引（Instructions）：
1) 先判定本次變更的主要類型（用來決定記錄重點）：
   - UI/UX 一致性調整
   - Bug 修復 / 執行期錯誤
   - 重構 / 維護性修改
2) 在 `/experience/YYYY-MM/` 建立或更新經驗檔，內容需包含（建議固定欄位）：
   - Symptom（症狀）：使用者看到什麼問題
   - Repro Steps（可重現步驟）：如何從乾淨狀態重跑
   - Expected vs Actual（預期 vs 實際）
   - Root Cause（根因）：真正原因是什麼（狀態/事件綁定/API/路由/CSS/資料型別等）
   - Fix（修正）：修改了哪些檔案、做了哪些關鍵改動
   - Verification Evidence（驗證證據）：跑了哪些指令/輸出重點/截圖路徑/驗證清單
   - Regression Test（回歸測試）：新增/更新測試，或至少列出回歸檢核項
   - Rule（可復用規則）：一句話規則，讓下次同類問題先檢查此點
3) 經驗檔命名必須可搜尋、可辨識：
   - 檔名建議包含「功能 + 症狀關鍵字」
   - 例：`2026-01-17_login_button_nullref.md`
   - 目標是讓 agent 能用關鍵字快速命中過去案例

補充建議（實務落地）：
- 若同類型問題再次出現，優先更新既有經驗檔（累積同一類問題的演進），而不是散落多份難以追蹤的筆記
- 建議在每次 git commit 前後執行此 Skill，形成固定節奏：「變更 → 驗證 → 沉澱」

-->

## Goal
Turn every change into reusable project knowledge.

## Instructions
1. Determine whether this change is primarily:
   - UI/UX consistency
   - Bugfix / runtime error
   - Refactor / maintenance
2. Create or update an experience note under /experience/YYYY-MM/ with:
   - Symptom
   - Repro Steps
   - Expected vs Actual
   - Root Cause
   - Fix (files + summary)
   - Verification Evidence
   - Regression Test
   - Rule (one-liner)
3. Ensure the experience note title is searchable:
   - Include feature + symptom keyword (e.g., "login_button_nullref")

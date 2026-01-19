---
name: debug-sheriff
description: Use when the user reports an error, runtime crash, broken button, repeated bug, or when an agent previously claimed "fixed" but the issue persists.
---

# Debug Sheriff Skill

<!--
【中文說明（註解區）】
用途：
- 當使用者回報錯誤（error）、執行期崩潰（runtime crash）、按鈕失效（broken button）、問題反覆出現（repeated bug）
- 或先前 Coding Agent 宣稱已修復但實際仍舊發生時，啟用此 Skill。
- 目的在於終止「修了但沒好 / 改錯頁 / 重複三四次才解掉」的除錯迴圈。

目標（Goal）：
- 以「可重現、可定位、可驗證、可回歸」的方式完成修復
- 確保修改發生在正確頁面/正確元件/正確事件綁定位置
- 並把本次經驗沉澱到 /experience/，讓後續同類問題能更快解決

執行指引（Instructions）：
1) 先產出 Bug Brief（除錯簡報／摘要），內容必須包含：
   - 可重現步驟（Repro Steps）：以條列/編號方式描述，讓任何人都能重跑
   - 預期 vs 實際（Expected vs Actual）：清楚說明應該怎樣、實際怎樣
   - 疑似檔案/頁面/元件清單（Suspected files）：列出推測理由，避免盲改
2) 確認修改位置正確（避免改錯頁/改錯元件）：
   - 在動手改之前，要先追到「點擊路徑」與「事件處理函式」真正綁定的位置
   - 釐清是前端狀態、路由、API 回應、或樣式造成的問題
3) 以最小安全修正（Smallest Safe Fix）完成修復：
   - 不做無關重構
   - 不擴大修改範圍
4) 驗證證據（Verification Evidence）為強制輸出：
   - 必須附上實際執行的指令（例如 lint/test/build/dev）
   - 並提供關鍵輸出片段、或截圖路徑、或手動驗證清單
   - 沒有證據不得宣稱「已修復」
5) 更新經驗檔（/experience/YYYY-MM/）：
   - 必須記錄：症狀、重現步驟、根因、修正摘要、驗證證據
   - 並寫出一條 Rule（可復用規則）：下次遇到同類錯誤要先檢查什麼

限制（Constraints）：
- 不得在沒有證據的情況下宣稱修復完成
- 不得修改無關頁面；若不確定，先定位再修改
- 必須避免「改錯頁」：修改前要證明目前編輯的檔案就是實際觸發的檔案
-->

## Goal
Eliminate repeated bug-fix loops by enforcing reproducibility, correct file targeting, and verification evidence.

## Instructions
1. Create a Bug Brief:
   - Repro steps (numbered)
   - Expected vs Actual
   - Suspected page/component/file list (with reasons)
2. Confirm correct file/page:
   - Before editing, locate the click path and the handler binding.
3. Implement the smallest safe fix.
4. Verification evidence (mandatory):
   - Show the exact command(s) you ran and key output lines
   - If UI bug, provide screenshot path(s) or a manual verification checklist
5. Add/update an experience note in /experience/YYYY-MM/:
   - Include "Rule" to prevent the same class of bug

## Constraints
- Never claim fixed without evidence.
- Never change unrelated pages; avoid "wrong page" fixes.

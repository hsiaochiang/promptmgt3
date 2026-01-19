# Debugging Protocol（固定格式）

## 1) Bug Brief（先寫這份再動手修）
- Symptom（症狀）
- Environment（環境：OS / node / browser）
- Steps to Reproduce（重現步驟）
- Expected vs Actual（預期 vs 實際）
- Error Logs（錯誤訊息/堆疊）
- Scope Guess（影響範圍）
- Suspected Files（可能檔案/元件/路由）

## 2) Fix Plan（修復計畫）
- Root Cause Hypothesis（先假設根因，若不確定寫「待確認」）
- Minimal Change Set（最小改動清單）
- Risk & Side Effects（可能副作用）

## 3) Verification（驗證）
至少提供一項：
- type-check / lint / test / build
並附上「實際跑過的指令與結果摘要」。

## 4) Regression Guard（回歸防護）
- 是否需要補測試 / 防呆 / 型別
- 是否需要更新共用元件避免同類錯誤

## 5) Experience Deposit（必做）
- 修完後新增 /experience/YYYY-MM/ 文件（依 experience-depositor 模板）

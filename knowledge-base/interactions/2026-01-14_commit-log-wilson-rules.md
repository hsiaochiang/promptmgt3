---
date: 2026-01-14
author: Copilot
---

# 提交日誌（Wilson 分類規則與初次學習）

本次變更摘要：

- 掃描 `apps/server/data/projects/` 下的提示詞樣本（共 52 筆）。
- 從樣本中歸納出 8 條初步分類規則，覆蓋業務、技術、前端/UI、政府標案、Gen-AI 指南、自動化、個人筆記與金融等類別。
- 產生並加入：
  - `knowledge-base/patterns/wilson-classification-rules.md`（規則庫，含觸發條件、分類建議、信心度與案例）
  - `knowledge-base/interactions/2026-01-13_initial-learning.md`（初次學習報告，含分析概況與建議步驟）
- 將規則摘要加入 `.github/agents/copilot-instructions.md`，以利 Copilot / Agent 使用時參考。

操作細節：

- 已在本地建立並 commit 相關檔案。
- 本次 commit 為同步到遠端的推送（git push），確保遠端儲存庫包含上述規則與報告，以便 CI / 其他協作者存取。

後續建議：

1. 若要提升分類準確度，請持續新增人工確認的分類範例（20-30 筆），並週期性重新訓練/更新規則。
2. 可考慮實作一個小型自動分類工具（TypeScript），先以規則引擎匹配並回傳建議分類與信心度。

End of commit log

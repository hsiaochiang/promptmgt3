---
name: uiux-guardian
description: Use when the user asks to adjust UI/UX, match Notion-style, fix visual inconsistencies, align CTA hierarchy, typography, spacing, colors, or component states.
---

# UIUX Guardian Skill

<!--
【中文說明（註解區）】
用途：
- 當使用者要求調整 UI/UX、比對 Notion Style、修正視覺不一致、對齊 CTA 層級、字體/間距/顏色、或補齊元件互動狀態時，啟用此 Skill。

目標（Goal）：
- 所有 UI 變更必須嚴格符合 /context/uiux_contract.md
- 並確保跨頁面維持一致（避免每頁各自微調導致風格漂移）

執行指引（Instructions）：
1) 先讀取 /context/uiux_contract.md，並整理本次相關的規則重點
2) 盤點受影響的頁面/元件：
   - 若多個頁面共用同一種版型或元件模式，優先抽共用元件或調整共用元件
   - 避免針對每頁做一次性 patch
3) 以「最小變更」方式實作：
   - 不做無關重構
   - 不擴大修改範圍
4) 進行驗證（Verification）並提供可驗收證據：
   - 優先執行 lint/test/build（若專案具備）
   - 提供證據：截圖路徑（screenshot path）或簡短一致性檢核清單
5) 將本次調整沉澱到 /experience/YYYY-MM/：
   - 至少包含：症狀、根因、修正摘要
   - 並加入一條「Rule（可復用規則）」：一句話規則，用於避免同類問題再次發生

限制（Constraints）：
- 不得新增合約以外的顏色/字級比例（typography scale）
- 除非 /context/uiux_contract.md 明確允許，否則不得建立一次性的 CSS override（例如只為某頁硬塞樣式）
-->

## Goal
Make UI changes that strictly comply with /context/uiux_contract.md and remain consistent across all pages.

## Instructions
1. Read and summarize the relevant constraints from:
   - /context/uiux_contract.md
2. Identify impacted pages/components. If multiple pages share the same pattern, create/modify a shared component instead of per-page tweaks.
3. Implement changes with minimal scope.
4. Run verification:
   - Provide commands run (lint/test/build if available)
   - Provide evidence: screenshot path(s) or a short checklist proving consistency
5. Update /experience/YYYY-MM/ with:
   - Symptom, root cause, fix, and "Rule" (one-liner to prevent reoccurrence)

## Constraints
- Do not introduce new colors/typography scales outside the contract.
- Do not create one-off CSS overrides unless explicitly allowed in the contract.

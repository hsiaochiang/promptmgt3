# UIUX Bootstrap（Notion-style 收斂策略）

## Symptom（症狀）
- Notion-style 很難一次到位；即使給了網址與截圖，頁面之間仍會出現按鈕、字級、間距、顏色、狀態不一致。
- 同樣的 UI Pattern 在不同頁面需要重複微調，耗時且不穩定。

## Root Cause（根因）
- 缺少「共用元件」與「token（設計約束）」：導致每個頁面都可能各自長出一套樣式。
- 缺少一致性驗證流程：改完沒有固定證據，agent 容易以為已完成但實際未達標。

## Fix Strategy（修正策略）
1) 以 /context/uiux_contract.md 為唯一標準（Single Source of Truth）
2) 多頁重複 Pattern（列表、看板、編輯頁）必須抽共用元件：
   - Button / Badge / Tag / Dropdown / Table / Card / Header actions
3) 禁止每頁 one-off CSS patch（除非 contract 明確允許）
4) CTA 層級與互動狀態（hover/active/disabled/loading/error）要一次補齊

## Verification Evidence（驗證證據）
每次 UI 調整必須至少提供其一：
- 一致性檢核清單（按鈕/字級/間距/狀態）+ 對照結果
- 或 screenshot 路徑（含頁面名稱與日期）

## Rule（一句話規則）
- 「多頁重複的 UI 模式，必須抽共用元件；禁止每頁微調。」

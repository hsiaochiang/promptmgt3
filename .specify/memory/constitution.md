# Constitution — Principles Only

以下內容為精簡版憲法，只包含使用者要求的四項核心原則：程式碼品質、測試標準、使用者體驗一致性與效能要求。

## I. Code Quality & Maintainability

MUST:
- 單一職責：模組與函式應維持單一職責，代碼應易讀、易測試。
- 型別安全：若使用 TypeScript，啟用嚴格模式；禁止任意使用 `any`。
- 錯誤處理：非同步邏輯必須有適當錯誤處理與回退機制。

SHOULD:
- 使用自動化格式化與 linter（如 ESLint + Prettier）。

Rationale: 維護性與可理解性可降低整合與運維成本。

---

## II. Testing Standards (NON-NEGOTIABLE)

MUST:
- Test-First：功能開發前先寫測試（若不可行，需在 PR 中說明理由）。
- 契約測試：跨系統介面變更需對應契約測試（如 `packages/contracts/`）。
- 覆蓋率目標：核心功能建議達到 ≥ 80%（可在專案中具體化）。

Rationale: 測試保護跨系統整合與減少回歸風險。

---

## III. User Experience Consistency

MUST:
- 視覺與互動一致性：在不同端（Web/Extension/Editor）保持狀態顯示、按鈕與通知的一致性。
- 及時回饋：使用者操作應在 200ms 內至少有視覺回饋。

Rationale: 一致的 UX 降低使用者學習成本並提升效率。

---

## IV. Performance Requirements

MUST:
- API 與本地檔案操作在典型情境下應達到合理延遲（建議：p95 < 100ms for file read/write）。
- 搜尋與列表操作應有可量測的效能目標，並在必要時加入基準測試。

Rationale: 即時性是本地應用的核心體驗要求。

---

**Version**: 1.0.0 | **Ratified**: 2026-01-04 | **Last Amended**: 2026-01-04

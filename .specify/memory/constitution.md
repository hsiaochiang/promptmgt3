<!--
Sync Impact Report
Version: 1.0.0 -> 1.1.0
Modified principles: Code Quality & Maintainability (clarified wording), Testing Standards (clarified wording), User Experience Consistency (clarified wording), Performance Requirements (clarified wording)
Added sections: Documentation Language Policy, Governance
Removed sections: None
Templates requiring updates: .specify/templates/plan-template.md ✅ | .specify/templates/spec-template.md ✅ | .specify/templates/tasks-template.md ✅
Follow-up TODOs: None
-->

# Project Constitution

**Version**: 1.1.0 | **Ratified**: 2026-01-04 | **Last Amended**: 2026-01-04

This constitution defines the non-negotiable engineering standards for the project.
It prioritizes maintainability, safety, consistent user experience, performance,
and clear documentation language expectations.

## I. Code Quality & Maintainability

MUST:
- Single Responsibility: Modules and functions stay focused, readable, and testable.
- Type Safety: Enable strict type checking (e.g., TypeScript strict mode or equivalent);
	avoid untyped `any` usage.
- Error Handling: Async paths include error handling and fallbacks for predictable failure modes.

SHOULD:
- Use automated formatting and linters (e.g., ESLint + Prettier) to keep code consistent.

Rationale: Maintainable, well-structured code reduces integration risk and operational cost.

---

## II. Testing Standards (NON-NEGOTIABLE)

MUST:
- Test-First: Write tests before implementation; if not feasible, document justification in the PR.
- Contract Tests: Cross-system interface changes require matching contract tests (e.g., in contracts packages).
- Coverage Goal: Core functionality targets ≥ 80% coverage unless a project-specific target is explicitly set.

Rationale: Strong tests protect integrations and prevent regressions.

---

## III. User Experience Consistency

MUST:
- Visual and Interaction Consistency: Keep state cues, controls, and notifications consistent across surfaces (Web/Extension/Editor).
- Timely Feedback: Provide visible feedback within 200ms of user actions.

Rationale: Consistency and responsiveness lower user learning costs and improve efficiency.

---

## IV. Performance Requirements

MUST:
- Responsive Operations: Typical API and local file actions target p95 < 100ms (baseline; refine per feature where needed).
- Defined SLOs: Search and listing flows declare measurable SLOs; add benchmarks when handling large data sets.

Rationale: Near-instant responses are core to the local-first experience.

---

## Documentation Language Policy

- Governance documents (including this constitution) MUST be written in English.
- Specifications, implementation plans, task lists, and user-facing documentation MUST be written in Traditional Chinese (zh-TW).
- Each document MUST indicate its language at the top and provide user-facing examples in Traditional Chinese (zh-TW).
- Non-compliant documents MUST include a TODO noting this policy and a timeline for producing the required zh-TW artifact.

Rationale: A single authoritative English governance source paired with localized execution
artifacts keeps alignment while serving users effectively.

---

## Governance

- Amendments: Changes are proposed via PR, referencing affected sections. Approval from project maintainers is required before merging.
- Versioning: Follow semantic versioning for governance documents (MAJOR for incompatible removals/redefinitions, MINOR for new or expanded principles, PATCH for clarifications).
- Compliance Reviews: Apply Constitution Check during planning; reviewers block merges if non-compliant. Conduct periodic retro checks to ensure performance and testing targets remain tracked.

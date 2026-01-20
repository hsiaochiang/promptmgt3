# Code Snapshot（HEAD）

- 產出時間：2026-01-20T03:35:09.990Z
- Branch：`001-prompt-asset-hub`
- Commit：`6459d25` UIUX：對齊導覽列與編輯面板字級

## A. 版本與提交資訊

```bash
git rev-parse --abbrev-ref HEAD
git log -1 --oneline
git show --name-only --oneline -1
git status --porcelain
```

**變更檔案（HEAD）**：
- apps/web/src/data/mockData.ts
- apps/web/src/features/library/ListView.tsx
- apps/web/src/layout/MainContent.tsx
- apps/web/src/layout/ProjectView.tsx
- apps/web/src/layout/SidePanel.tsx
- apps/web/src/layout/Sidebar.tsx
- apps/web/src/state/uiStore.ts

**未提交狀態（porcelain）**：
```
?? "0resource/ui_reference/01\345\260\210\346\241\210\345\210\227\350\241\250.png"
?? "0resource/ui_reference/02\345\260\210\346\241\210\347\234\213\346\235\277.png"
?? "0resource/ui_reference/04\346\217\220\347\244\272\350\251\236\345\210\227\350\241\250.png"
?? "0resource/ui_reference/05\346\217\220\347\244\272\350\251\236\347\234\213\346\235\277.png"
?? "0resource/ui_reference/\344\277\256\346\224\271\345\211\215/"
?? context/snapshots/2026-01/code_HEAD_92143f7.md
?? docs/CODEX_CLARIFICATIONS.md
?? docs/CODEX_PROJECT_SCAN.md
?? docs/CODEX_TASK_HANDOFF.md
?? docs/UIUX_BACKLOG.md
```

## B. Diff Stat（摘要）


```
6459d25 UIUX：對齊導覽列與編輯面板字級
 apps/web/src/data/mockData.ts              |  13 ++++
 apps/web/src/features/library/ListView.tsx |   4 +-
 apps/web/src/layout/MainContent.tsx        |   6 +-
 apps/web/src/layout/ProjectView.tsx        |  35 +--------
 apps/web/src/layout/SidePanel.tsx          | 118 ++++++++++++++++-------------
 apps/web/src/layout/Sidebar.tsx            |  10 +--
 apps/web/src/state/uiStore.ts              |  10 +--
 7 files changed, 93 insertions(+), 103 deletions(-)
```


## C. Diff Patch（前 120 行）


```diff
diff --git a/apps/web/src/data/mockData.ts b/apps/web/src/data/mockData.ts
index 8e82218..bf9dc01 100644
--- a/apps/web/src/data/mockData.ts
+++ b/apps/web/src/data/mockData.ts
@@ -15,6 +15,7 @@ export const MOCK_PROJECTS: ProjectEntity[] = [
     status: 'in_progress',
     type: '',
     tags: [],
+    category: '',
     archived: false,
     createdAt: '2024-01-01T00:00:00Z',
     updatedAt: '2024-01-02T15:30:00Z',
@@ -28,6 +29,7 @@ export const MOCK_PROJECTS: ProjectEntity[] = [
     status: 'planned',
     type: '',
     tags: [],
+    category: '',
     archived: false,
     createdAt: '2024-01-01T00:00:00Z',
     updatedAt: '2024-01-03T11:15:00Z',
@@ -41,6 +43,7 @@ export const MOCK_PROJECTS: ProjectEntity[] = [
     status: 'in_progress',
     type: '',
     tags: [],
+    category: '',
     archived: false,
     createdAt: '2024-01-01T00:00:00Z',
     updatedAt: '2024-01-05T10:30:00Z',
@@ -54,6 +57,7 @@ export const MOCK_PROJECTS: ProjectEntity[] = [
     status: 'done',
     type: '',
     tags: [],
+    category: '',
     archived: false,
     createdAt: '2023-01-01T00:00:00Z',
     updatedAt: '2023-01-01T00:00:00Z',
@@ -78,6 +82,7 @@ export const MOCK_PROMPTS: PromptEntity[] = [
     status: 'ready',
     tags: ['Analysis', 'Customer Service', 'Sentiment'],
     priority: 'high',
+    category: '',
     sourceLink: 'https://chatgpt.com/share/xxxx-xxxx',
     notes: '測試結果：對於諷刺語氣的辨識度在 GPT-4 上表現最好。',
     archived: false,
@@ -103,6 +108,7 @@ export const MOCK_PROMPTS: PromptEntity[] = [
     status: 'draft',
     tags: ['Generation', 'Customer Service'],
     priority: 'high',
+    category: '',
     sourceLink: '',
     notes: '還需要調整語氣，目前太過生硬。',
     archived: false,
@@ -127,6 +133,7 @@ Instagram
     status: 'ready',
     tags: ['Social Media', 'Marketing', 'Instagram'],
     priority: 'high',
+    category: '',
     sourceLink: '',
     notes: '',
     archived: false,
@@ -153,6 +160,7 @@ Instagram
     status: 'needs_review',
     tags: ['Email', 'Marketing', 'Template'],
     priority: 'high',
+    category: '',
     sourceLink: '',
     notes: '需要 A/B 測試不同主旨行',
     archived: false,
@@ -169,6 +177,7 @@ Instagram
     status: 'deprecated',
     tags: ['Legacy'],
     priority: 'low',
+    category: '',
     sourceLink: '',
     notes: '',
     archived: false,
@@ -192,6 +201,7 @@ Instagram
     status: 'ready',
     tags: ['Code Review', 'Development', 'Internal'],
     priority: 'high',
+    category: '',
     sourceLink: '',
     notes: '',
     archived: false,
@@ -215,6 +225,7 @@ Instagram
     status: 'draft',
     tags: ['Productivity', 'Meeting', 'Internal'],
     priority: 'low',
+    category: '',
     sourceLink: '',
     notes: '考慮整合 Whisper API',
     archived: false,
@@ -239,6 +250,7 @@ Instagram
     status: 'needs_review',
     tags: ['E-commerce', 'Marketing', 'Product'],
     priority: 'high',
+    category: '',
     sourceLink: '',
     notes: '',
     archived: false,
@@ -474,6 +486,7 @@ export const MOCK_ARCHIVED_PROMPTS: PromptEntity[] = [
     status: 'deprecated',
     tags: ['Archive', 'Legacy'],
     priority: 'low',
+    category: '',
     sourceLink: '',
     notes: '',
     archived: true,
diff --git a/apps/web/src/features/library/ListView.tsx b/apps/web/src/features/library/ListView.tsx
index 7ddce1b..62ae9ad 100644
--- a/apps/web/src/features/library/ListView.tsx
+++ b/apps/web/src/features/library/ListView.tsx
@@ -155,8 +155,7 @@ export function ListView({
           )}
 
           {/* Prompt Rows */}
-          {group.prompts.map((prompt, _index) => {
-            const _isLast = _index === group.prompts.length - 1;
+          {group.prompts.map((prompt) => {
             // Indent logic mainly applies if there is a project
```


## D. 驗證證據（可配置）

- 本次未啟用自動驗證指令（可在 `.snapshotrc.json` 開啟）。

## E. UI/UX 一致性掃描（可配置）

### Button 分裂檢查
- 指令：`rg -n --no-heading "GhostButton|btn-primary|btn-ghost|btn-danger|<button\b" "apps" "src"`
- 命中：否


### 原生 <select> 檢查
- 指令：`rg -n --no-heading "<select\b" "apps" "src"`
- 命中：否


### Typography 混用檢查（text-2xl/3xl/4xl）
- 指令：`rg -n --no-heading "text-(2xl|3xl|4xl)" "apps" "src"`
- 命中：否


### Spacing 混用檢查（px-8/p-3/p-4 等）
- 指令：`rg -n --no-heading "\b(px-8|px-10|p-3|p-4|p-5)\b" "apps" "src"`
- 命中：否


### 硬編碼色碼檢查
- 指令：`rg -n --no-heading "#[0-9a-fA-F]{3,8}|bg-\[#|text-\[#|border-\[#" "apps" "src"`
- 命中：否



## F. Experience Note（提醒）

- 建議：本次若為 UI/UX 或除錯修正，請由 Agent 依 `experience-depositor` 產出對應的經驗檔：
  - `/experience/2026-01/code_6459d25_<keyword>.md`
- 本 snapshot 只做「證據收集與稽核輸出」，避免自動生成不精準的根因敘述。

# Code Snapshot（HEAD）

- 產出時間：2026-01-19T13:40:20.195Z
- Branch：`001-prompt-asset-hub`
- Commit：`71e1e99` chore(ui): align shared layout/button styling for Notion-style contract

## A. 版本與提交資訊

```bash
git rev-parse --abbrev-ref HEAD
git log -1 --oneline
git show --name-only --oneline -1
git status --porcelain
```

**變更檔案（HEAD）**：
- apps/web/src/ui/Button.tsx

**未提交狀態（porcelain）**：
```
?? context/snapshots/2026-01/code_HEAD_9ed9709.md
?? experience/2026-01/uiux_467c7da_clipboard_notion.md
?? experience/2026-01/uiux_467c7da_clipboard_notion_strict.md
```

## B. Diff Stat（摘要）


```
71e1e99 chore(ui): align shared layout/button styling for Notion-style contract
 apps/web/src/ui/Button.tsx | 43 +++++++++++++++++++++++++++++++++++++++++++
 1 file changed, 43 insertions(+)
```


## C. Diff Patch（前 120 行）


```diff
diff --git a/apps/web/src/ui/Button.tsx b/apps/web/src/ui/Button.tsx
new file mode 100644
index 0000000..60da94a
--- /dev/null
+++ b/apps/web/src/ui/Button.tsx
@@ -0,0 +1,43 @@
+
+import { ButtonHTMLAttributes, forwardRef } from 'react';
+import { Loader2 } from 'lucide-react';
+
+interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
+    variant?: 'primary' | 'secondary' | 'danger' | 'ghost';
+    size?: 'sm' | 'md' | 'icon';
+    isLoading?: boolean;
+}
+
+export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
+    ({ className = '', variant = 'secondary', size = 'md', isLoading, children, disabled, ...props }, ref) => {
+
+        const baseStyles = "inline-flex items-center justify-center rounded-[4px] font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-blue-400 disabled:opacity-50 disabled:cursor-not-allowed select-none";
+
+        const variants = {
+            primary: "bg-[#2383E2] text-white hover:bg-[#1D74C9] border border-transparent shadow-sm", // Notion blue
+            secondary: "bg-white text-[#37352F] border border-[rgba(55,53,47,0.16)] hover:bg-[rgba(55,53,47,0.08)] shadow-sm",
+            danger: "bg-white text-red-600 border border-[rgba(55,53,47,0.16)] hover:bg-red-50 shadow-sm",
+            ghost: "bg-transparent text-[#37352F] hover:bg-[rgba(55,53,47,0.08)]",
+        };
+
+        const sizes = {
+            sm: "h-6 px-2 text-xs",
+            md: "h-8 px-3 text-sm",
+            icon: "h-8 w-8",
+        };
+
+        return (
+            <button
+                ref={ref}
+                className={`${baseStyles} ${variants[variant]} ${sizes[size]} ${className}`}
+                disabled={disabled || isLoading}
+                {...props}
+            >
+                {isLoading && <Loader2 className="mr-2 h-3 w-3 animate-spin" />}
+                {children}
+            </button>
+        );
+    }
+);
+
+Button.displayName = "Button";
```


## D. 驗證證據（可配置）

- 本次未啟用自動驗證指令（可在 `.snapshotrc.json` 開啟）。

## E. UI/UX 一致性掃描（可配置）

### Button 分裂檢查
- 指令：`git grep -n "GhostButton\|btn-primary\|btn-ghost\|btn-danger\|<button"`
- 命中：是

```
0resource/ui_prototype_v3.jsx:229:const GhostButton = ({ children, onClick, className = "", icon: Icon, title, active }) => (
0resource/ui_prototype_v3.jsx:230:  <button 
0resource/ui_prototype_v3.jsx:291:  <button 
0resource/ui_prototype_v3.jsx:343:           <button onClick={() => { onChange({target: {value: ''}}); setIsExpanded(false); }} className="text-gray-400 hover:text-gray-600">
0resource/ui_prototype_v3.jsx:348:        <button 
0resource/ui_prototype_v3.jsx:554:                <GhostButton active={projectSubView === 'list'} onClick={() => setProjectSubView('list')} icon={ListIcon}>列表</GhostButton>
0resource/ui_prototype_v3.jsx:555:                <GhostButton active={projectSubView === 'board'} onClick={() => setProjectSubView('board')} icon={Kanban}>看板</GhostButton>
0resource/ui_prototype_v3.jsx:556:                <GhostButton active={projectSubView === 'archive'} onClick={() => setProjectSubView('archive')} icon={Archive}>已封存</GhostButton>
0resource/ui_prototype_v3.jsx:566:                    <button 
0resource/ui_prototype_v3.jsx:611:                <button 
0resource/ui_prototype_v3.jsx:621:                    <button className="text-gray-400 hover:text-gray-600 p-1 hover:bg-gray-200 rounded"><Maximize2 size={12} /></button>
0resource/ui_prototype_v3.jsx:659:                             <button className="text-gray-400 hover:text-gray-600 p-1 hover:bg-gray-200 rounded"><Maximize2 size={12} /></button>
0resource/ui_prototype_v3.jsx:672:                    <button className="text-gray-400 text-xs hover:text-gray-700 flex items-center gap-1">
0resource/ui_prototype_v3.jsx:730:              <button 
0resource/ui_prototype_v3.jsx:759:                <GhostButton active={promptSubView === 'list'} onClick={() => setPromptSubView('list')} icon={ListIcon}>列表</GhostButton>
0resource/ui_prototype_v3.jsx:760:                <GhostButton active={promptSubView === 'board'} onClick={() => setPromptSubView('board')} icon={Kanban}>看板</GhostButton>
0resource/ui_prototype_v3.jsx:761:                <GhostButton active={promptSubView === 'archive'} onClick={() => setPromptSubView('archive')} icon={Archive}>已封存</GhostButton>
0resource/ui_prototype_v3.jsx:771:                    <button 
0resource/ui_prototype_v3.jsx:836:                <button className="text-gray-400 hover:text-gray-600 p-1 hover:bg-gray-200 rounded"><Maximize2 size={12} /></button>
0resource/ui_prototype_v3.jsx:888:               <button 
0resource/ui_prototype_v3.jsx:910:             <GhostButton icon={Plus} onClick={handleCreateSnippet}>新增</GhostButton>
0resource/ui_prototype_v3.jsx:943:                  <button 
0resource/ui_prototype_v3.jsx:950:                  <button 
0resource/ui_prototype_v3.jsx:982:          <button onClick={() => setIsSidebarOpen(!isSidebarOpen)} className={`ml-auto p-1 text-gray-400 hover:text-gray-600 rounded ${!isSidebarOpen && 'w-full flex justify-center'}`}>
0resource/ui_prototype_v3.jsx:1166:            <button 
0resource/ui_prototype_v3.jsx:1199:               <button className="p-1.5 hover:bg-gray-100 rounded text-gray-500 transition-colors"><MoreHorizontal size={18} /></button>
0resource/ui_prototype_v3.jsx:1202:                   <button onClick={() => onArchive(item.type, item.id, formData.archived)} className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2">
0resource/ui_prototype_v3.jsx:1206:                 <button onClick={() => onDelete(item.type, item.id)} className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 flex items-center gap-2 border-t border-gray-100 mt-1">
0resource/ui_prototype_v3.jsx:1211:            <button onClick={onClose} className="p-1.5 hover:bg-gray-100 rounded text-gray-500 transition-colors"><ChevronRight size={20} /></button>
0resource/ui_prototype_v3.jsx:1334:                                            <button onClick={() => handleRemoveTag(globalIndex)} className="hover:text-red-500">×</button>
0resource/ui_prototype_v3.jsx:1338:                                <button onClick={() => handleAddTag(key)} className="text-gray-400 hover:text-gray-600 text-xs px-1 hover:bg-gray-100 rounded">+ Add</button>
0resource/ui_prototype_v3.jsx:1351:                                    <button onClick={() => handleRemoveTag(idx)} className="hover:text-red-500">×</button>
0resource/ui_prototype_v3.jsx:1354:                            <button onClick={() => handleAddTag('common')} className="text-gray-400 hover:text-gray-600 text-xs px-1 hover:bg-gray-100 rounded">+ Add</button>
0resource/ui_prototype_v3.jsx:1398:                        <button onClick={handleAddFile} className="text-xs text-gray-400 hover:text-gray-600 flex items-center gap-1"><Plus size={12}/> Upload</button>
0resource/ui_prototype_v3.jsx:1409:                                        <button onClick={() => handleRenameFile(file.id, file.name)} className="text-gray-400 hover:text-blue-500 p-1"><Edit2 size={12} /></button>
0resource/ui_prototype_v3.jsx:1410:                                        <button onClick={() => handleDeleteFile(file.id)} className="text-gray-400 hover:text-red-500 p-1"><Trash2 size={12} /></button>
0resource/ui_prototype_v3.jsx:1445:                    <button onClick={handleSave} className="text-xs text-gray-400 hover:text-gray-600 flex items-center gap-1"><Save size={12} /> Saved</button>
apps/browser-extension/src/App.tsx:102:          <button
apps/browser-extension/src/App.tsx:165:        <button
apps/vscode-extension/out/webview/TriagePanel.js:104:            <button id="reject-btn">Reject</button>
apps/vscode-extension/out/webview/TriagePanel.js:105:            <button id="accept-btn" class="primary">Accept & Archive (<span id="selected-count">0</span>)</button>
apps/vscode-extension/src/webview/TriagePanel.ts:104:            <button id="reject-btn">Reject</button>
apps/vscode-extension/src/webview/TriagePanel.ts:105:            <button id="accept-btn" class="primary">Accept & Archive (<span id="selected-count">0</span>)</button>
apps/web/src/components/ConfirmDialog.tsx:89:                    <button
apps/web/src/components/ConfirmDialog.tsx:99:                    <button
apps/web/src/components/ConfirmDialog.tsx:105:                    <button
apps/web/src/features/backup/BackupStatusBanner.tsx:133:            <button
apps/web/src/features/clipboard/ClipboardView.tsx:259:                  <button
apps/web/src/features/conflict/ConflictBanner.tsx:23:        <button
apps/web/src/features/conflict/ConflictBanner.tsx:30:        <button
apps/web/src/features/conflict/ConflictBanner.tsx:37:        <button
apps/web/src/features/history/HistoryView.tsx:114:          <button
apps/web/src/features/history/HistoryView.tsx:147:                  <button
apps/web/src/features/inbox/InboxView.tsx:150:            <button onClick={load} className="text-gray-500 hover:text-gray-800" title="重新整理">
apps/web/src/features/inbox/InboxView.tsx:162:              <button
apps/web/src/features/inbox/InboxView.tsx:200:                  <button
apps/web/src/features/inbox/InboxView.tsx:208:                  <button
apps/web/src/features/inbox/InboxView.tsx:314:                            <button
apps/web/src/features/settings/SettingsView.tsx:154:                        <button
apps/web/src/features/settings/SettingsView.tsx:175:                        <button
apps/web/src/features/settings/SettingsView.tsx:220:              <button
apps/web/src/features/settings/SettingsView.tsx:259:                      <button
apps/web/src/features/settings/SettingsView.tsx:305:              <button
apps/web/src/features/settings/SettingsView.tsx:395:            <button
apps/web/src/features/trash/RestoreConflictDialog.tsx:90:          <button
apps/web/src/features/trash/RestoreConflictDialog.tsx:97:          <button
apps/web/src/features/trash/TrashView.tsx:68:        <button
apps/web/src/features/trash/TrashView.tsx:79:          <button onClick={() => setError(null)}><X size={14} /></button>
apps/web/src/features/trash/TrashView.tsx:121:                <button
apps/web/src/features/trash/TrashView.tsx:128:                <button
apps/web/src/features/trash/TrashView.tsx:163:              <button
apps/web/src/features/trash/TrashView.tsx:169:              <button
apps/web/src/features/trash/TrashView.tsx:175:              <button
apps/web/src/layout/DetailPanel.tsx:209:          <button
apps/web/src/layout/DetailPanel.tsx:227:          <button
apps/web/src/layout/DetailPanel.tsx:235:          <button
apps/web/src/layout/DetailPanel.tsx:264:            <button onClick={handleRetry} className="underline hover:no-underline">
apps/web/src/layout/DetailPanel.tsx:267:            <button onClick={handleCopyUnsaved} className="underline hover:no-underline">
apps/web/src/layout/DetailPanel.tsx:353:              <button
apps/web/src/layout/MainContent.tsx:18:const GhostButton = ({
```

### 原生 <select> 檢查
- 指令：`git grep -n "<select"`
- 命中：是

```
0resource/ui_prototype_v3.jsx:1246:                    <select 
0resource/ui_prototype_v3.jsx:1272:                        <select 
0resource/ui_prototype_v3.jsx:1286:                            <select 
0resource/ui_prototype_v3.jsx:1295:                            <select 
apps/web/src/features/archive/ArchiveView.tsx:85:        <select
apps/web/src/features/inbox/InboxView.tsx:243:                        <select
apps/web/src/features/inbox/InboxView.tsx:265:                        <select
apps/web/src/features/inbox/InboxView.tsx:288:                        <select
apps/web/src/features/inbox/InboxView.tsx:322:                        <select
apps/web/src/layout/DetailPanel.tsx:289:              <select
apps/web/src/layout/DetailPanel.tsx:302:              <select
apps/web/src/layout/SidePanel.tsx:262:                    <select
apps/web/src/layout/SidePanel.tsx:289:                      <select
apps/web/src/layout/SidePanel.tsx:317:                      <select
apps/web/src/layout/SidePanel.tsx:377:                    <select
apps/web/src/prototype/PrototypeApp.tsx:1294:                <select
apps/web/src/prototype/PrototypeApp.tsx:1322:                  <select
apps/web/src/prototype/PrototypeApp.tsx:1342:                    <select
context/snapshots/2026-01/code_HEAD_066d36b.md:278:### 原生 <select> 檢查
context/snapshots/2026-01/code_HEAD_066d36b.md:279:- 指令：`git grep -n "<select"`
context/snapshots/2026-01/code_HEAD_066d36b.md:283:0resource/ui_prototype_v3.jsx:1246:                    <select 
context/snapshots/2026-01/code_HEAD_066d36b.md:284:0resource/ui_prototype_v3.jsx:1272:                        <select 
context/snapshots/2026-01/code_HEAD_066d36b.md:285:0resource/ui_prototype_v3.jsx:1286:                            <select 
context/snapshots/2026-01/code_HEAD_066d36b.md:286:0resource/ui_prototype_v3.jsx:1295:                            <select 
context/snapshots/2026-01/code_HEAD_066d36b.md:287:apps/web/src/features/archive/ArchiveView.tsx:85:        <select
context/snapshots/2026-01/code_HEAD_066d36b.md:288:apps/web/src/features/inbox/InboxView.tsx:243:                        <select
context/snapshots/2026-01/code_HEAD_066d36b.md:289:apps/web/src/features/inbox/InboxView.tsx:265:                        <select
context/snapshots/2026-01/code_HEAD_066d36b.md:290:apps/web/src/features/inbox/InboxView.tsx:288:                        <select
context/snapshots/2026-01/code_HEAD_066d36b.md:291:apps/web/src/features/inbox/InboxView.tsx:322:                        <select
context/snapshots/2026-01/code_HEAD_066d36b.md:292:apps/web/src/layout/DetailPanel.tsx:289:              <select
context/snapshots/2026-01/code_HEAD_066d36b.md:293:apps/web/src/layout/DetailPanel.tsx:302:              <select
context/snapshots/2026-01/code_HEAD_066d36b.md:294:apps/web/src/layout/SidePanel.tsx:262:                    <select
context/snapshots/2026-01/code_HEAD_066d36b.md:295:apps/web/src/layout/SidePanel.tsx:289:                      <select
context/snapshots/2026-01/code_HEAD_066d36b.md:296:apps/web/src/layout/SidePanel.tsx:317:                      <select
context/snapshots/2026-01/code_HEAD_066d36b.md:297:apps/web/src/layout/SidePanel.tsx:377:                    <select
context/snapshots/2026-01/code_HEAD_066d36b.md:298:apps/web/src/prototype/PrototypeApp.tsx:1294:                <select
context/snapshots/2026-01/code_HEAD_066d36b.md:299:apps/web/src/prototype/PrototypeApp.tsx:1322:                  <select
context/snapshots/2026-01/code_HEAD_066d36b.md:300:apps/web/src/prototype/PrototypeApp.tsx:1342:                    <select
context/snapshots/2026-01/code_HEAD_467c7da.md:170:### 原生 <select> 檢查
context/snapshots/2026-01/code_HEAD_467c7da.md:171:- 指令：`git grep -n "<select"`
context/snapshots/2026-01/code_HEAD_467c7da.md:175:0resource/ui_prototype_v3.jsx:1246:                    <select 
context/snapshots/2026-01/code_HEAD_467c7da.md:176:0resource/ui_prototype_v3.jsx:1272:                        <select 
context/snapshots/2026-01/code_HEAD_467c7da.md:177:0resource/ui_prototype_v3.jsx:1286:                            <select 
context/snapshots/2026-01/code_HEAD_467c7da.md:178:0resource/ui_prototype_v3.jsx:1295:                            <select 
context/snapshots/2026-01/code_HEAD_467c7da.md:179:apps/web/src/features/archive/ArchiveView.tsx:85:        <select
context/snapshots/2026-01/code_HEAD_467c7da.md:180:apps/web/src/features/inbox/InboxView.tsx:243:                        <select
context/snapshots/2026-01/code_HEAD_467c7da.md:181:apps/web/src/features/inbox/InboxView.tsx:265:                        <select
context/snapshots/2026-01/code_HEAD_467c7da.md:182:apps/web/src/features/inbox/InboxView.tsx:288:                        <select
context/snapshots/2026-01/code_HEAD_467c7da.md:183:apps/web/src/features/inbox/InboxView.tsx:322:                        <select
context/snapshots/2026-01/code_HEAD_467c7da.md:184:apps/web/src/layout/DetailPanel.tsx:289:              <select
context/snapshots/2026-01/code_HEAD_467c7da.md:185:apps/web/src/layout/DetailPanel.tsx:302:              <select
context/snapshots/2026-01/code_HEAD_467c7da.md:186:apps/web/src/layout/SidePanel.tsx:262:                    <select
context/snapshots/2026-01/code_HEAD_467c7da.md:187:apps/web/src/layout/SidePanel.tsx:289:                      <select
context/snapshots/2026-01/code_HEAD_467c7da.md:188:apps/web/src/layout/SidePanel.tsx:317:                      <select
context/snapshots/2026-01/code_HEAD_467c7da.md:189:apps/web/src/layout/SidePanel.tsx:377:                    <select
context/snapshots/2026-01/code_HEAD_467c7da.md:190:apps/web/src/prototype/PrototypeApp.tsx:1294:                <select
context/snapshots/2026-01/code_HEAD_467c7da.md:191:apps/web/src/prototype/PrototypeApp.tsx:1322:                  <select
context/snapshots/2026-01/code_HEAD_467c7da.md:192:apps/web/src/prototype/PrototypeApp.tsx:1342:                    <select
context/snapshots/2026-01/code_HEAD_7926c1b.md:267:### 原生 <select> 檢查
context/snapshots/2026-01/code_HEAD_7926c1b.md:268:- 指令：`git grep -n "<select"`
context/snapshots/2026-01/code_HEAD_7926c1b.md:272:0resource/ui_prototype_v3.jsx:1246:                    <select 
context/snapshots/2026-01/code_HEAD_7926c1b.md:273:0resource/ui_prototype_v3.jsx:1272:                        <select 
context/snapshots/2026-01/code_HEAD_7926c1b.md:274:0resource/ui_prototype_v3.jsx:1286:                            <select 
context/snapshots/2026-01/code_HEAD_7926c1b.md:275:0resource/ui_prototype_v3.jsx:1295:                            <select 
context/snapshots/2026-01/code_HEAD_7926c1b.md:276:apps/web/src/features/archive/ArchiveView.tsx:85:        <select
context/snapshots/2026-01/code_HEAD_7926c1b.md:277:apps/web/src/features/inbox/InboxView.tsx:243:                        <select
context/snapshots/2026-01/code_HEAD_7926c1b.md:278:apps/web/src/features/inbox/InboxView.tsx:265:                        <select
context/snapshots/2026-01/code_HEAD_7926c1b.md:279:apps/web/src/features/inbox/InboxView.tsx:288:                        <select
context/snapshots/2026-01/code_HEAD_7926c1b.md:280:apps/web/src/features/inbox/InboxView.tsx:322:                        <select
context/snapshots/2026-01/code_HEAD_7926c1b.md:281:apps/web/src/layout/DetailPanel.tsx:289:              <select
context/snapshots/2026-01/code_HEAD_7926c1b.md:282:apps/web/src/layout/DetailPanel.tsx:302:              <select
context/snapshots/2026-01/code_HEAD_7926c1b.md:283:apps/web/src/layout/SidePanel.tsx:262:                    <select
context/snapshots/2026-01/code_HEAD_7926c1b.md:284:apps/web/src/layout/SidePanel.tsx:289:                      <select
context/snapshots/2026-01/code_HEAD_7926c1b.md:285:apps/web/src/layout/SidePanel.tsx:317:                      <select
context/snapshots/2026-01/code_HEAD_7926c1b.md:286:apps/web/src/layout/SidePanel.tsx:377:                    <select
context/snapshots/2026-01/code_HEAD_7926c1b.md:287:apps/web/src/prototype/PrototypeApp.tsx:1294:                <select
context/snapshots/2026-01/code_HEAD_7926c1b.md:288:apps/web/src/prototype/PrototypeApp.tsx:1322:                  <select
context/snapshots/2026-01/code_HEAD_7926c1b.md:289:apps/web/src/prototype/PrototypeApp.tsx:1342:                    <select
context/snapshots/2026-01/code_HEAD_7926c1b.md:290:context/snapshots/2026-01/code_HEAD_066d36b.md:278:### 原生 <select> 檢查
context/snapshots/2026-01/code_HEAD_7926c1b.md:291:context/snapshots/2026-01/code_HEAD_066d36b.md:279:- 指令：`git grep -n "<select"`
```

### Typography 混用檢查（text-2xl/3xl/4xl）
- 指令：`git grep -n "text-2xl\|text-3xl\|text-4xl"`
- 命中：是

```
0resource/ui_prototype_v3.jsx:547:            <h1 className="text-3xl font-bold text-gray-900">
0resource/ui_prototype_v3.jsx:752:            <h1 className="text-3xl font-bold text-gray-900">
0resource/ui_prototype_v3.jsx:903:      <h1 className="text-3xl font-bold text-gray-900 mb-8 flex items-center gap-2">
0resource/ui_prototype_v3.jsx:1226:                    className="w-full text-4xl font-bold text-gray-900 placeholder-gray-300 border-none focus:ring-0 focus:outline-none p-0 bg-transparent leading-tight mb-2"
apps/web/src/features/clipboard/ClipboardView.tsx:332:                      className="w-full text-3xl font-bold text-gray-900 placeholder-gray-200 border-none p-0 focus:ring-0 bg-transparent leading-tight"
apps/web/src/features/inbox/InboxView.tsx:230:                    className="w-full text-4xl font-bold border-none outline-none placeholder-gray-300 py-2 bg-transparent text-gray-900"
apps/web/src/features/inbox/InboxView.tsx:410:                          h1: ({ node, ...props }) => <h1 className="text-2xl font-bold mt-8 mb-4 border-b pb-2" {...props} />,
apps/web/src/layout/DetailPanel.tsx:282:              className="w-full text-4xl font-bold text-gray-900 placeholder-gray-300 border-none focus:ring-0 focus:outline-none p-0 bg-transparent leading-tight mb-2"
apps/web/src/layout/MainContent.tsx:183:          <h1 className="text-3xl font-bold text-gray-900">{title}</h1>
apps/web/src/layout/SidePanel.tsx:247:                  className="w-full text-4xl font-bold text-gray-900 placeholder-gray-300 border-none focus:ring-0 focus:outline-none p-0 bg-transparent leading-tight mb-2"
apps/web/src/prototype/PrototypeApp.tsx:547:            <h1 className="text-3xl font-bold text-gray-900">{isArchivedView ? '已封存專案' : '專案管理'}</h1>
apps/web/src/prototype/PrototypeApp.tsx:777:            <h1 className="text-3xl font-bold text-gray-900">{isArchivedView ? '已封存提示詞' : '提示詞管理'}</h1>
apps/web/src/prototype/PrototypeApp.tsx:954:      <h1 className="text-3xl font-bold text-gray-900 mb-8 flex items-center gap-2">
apps/web/src/prototype/PrototypeApp.tsx:1276:              className="w-full text-4xl font-bold text-gray-900 placeholder-gray-300 border-none focus:ring-0 focus:outline-none p-0 bg-transparent leading-tight mb-2"
context/snapshots/2026-01/code_HEAD_066d36b.md:303:### Typography 混用檢查（text-2xl/3xl/4xl）
context/snapshots/2026-01/code_HEAD_066d36b.md:304:- 指令：`git grep -n "text-2xl\|text-3xl\|text-4xl"`
context/snapshots/2026-01/code_HEAD_066d36b.md:308:0resource/ui_prototype_v3.jsx:547:            <h1 className="text-3xl font-bold text-gray-900">
context/snapshots/2026-01/code_HEAD_066d36b.md:309:0resource/ui_prototype_v3.jsx:752:            <h1 className="text-3xl font-bold text-gray-900">
context/snapshots/2026-01/code_HEAD_066d36b.md:310:0resource/ui_prototype_v3.jsx:903:      <h1 className="text-3xl font-bold text-gray-900 mb-8 flex items-center gap-2">
context/snapshots/2026-01/code_HEAD_066d36b.md:311:0resource/ui_prototype_v3.jsx:1226:                    className="w-full text-4xl font-bold text-gray-900 placeholder-gray-300 border-none focus:ring-0 focus:outline-none p-0 bg-transparent leading-tight mb-2"
context/snapshots/2026-01/code_HEAD_066d36b.md:312:apps/web/src/features/clipboard/ClipboardView.tsx:332:                      className="w-full text-3xl font-bold text-gray-900 placeholder-gray-200 border-none p-0 focus:ring-0 bg-transparent leading-tight"
context/snapshots/2026-01/code_HEAD_066d36b.md:313:apps/web/src/features/inbox/InboxView.tsx:230:                    className="w-full text-4xl font-bold border-none outline-none placeholder-gray-300 py-2 bg-transparent text-gray-900"
context/snapshots/2026-01/code_HEAD_066d36b.md:314:apps/web/src/features/inbox/InboxView.tsx:410:                          h1: ({ node, ...props }) => <h1 className="text-2xl font-bold mt-8 mb-4 border-b pb-2" {...props} />,
context/snapshots/2026-01/code_HEAD_066d36b.md:315:apps/web/src/layout/DetailPanel.tsx:282:              className="w-full text-4xl font-bold text-gray-900 placeholder-gray-300 border-none focus:ring-0 focus:outline-none p-0 bg-transparent leading-tight mb-2"
context/snapshots/2026-01/code_HEAD_066d36b.md:316:apps/web/src/layout/MainContent.tsx:184:            <h1 className="text-3xl font-bold text-gray-900">{title}</h1>
context/snapshots/2026-01/code_HEAD_066d36b.md:317:apps/web/src/layout/SidePanel.tsx:247:                  className="w-full text-4xl font-bold text-gray-900 placeholder-gray-300 border-none focus:ring-0 focus:outline-none p-0 bg-transparent leading-tight mb-2"
context/snapshots/2026-01/code_HEAD_066d36b.md:318:apps/web/src/prototype/PrototypeApp.tsx:547:            <h1 className="text-3xl font-bold text-gray-900">{isArchivedView ? '已封存專案' : '專案管理'}</h1>
context/snapshots/2026-01/code_HEAD_066d36b.md:319:apps/web/src/prototype/PrototypeApp.tsx:777:            <h1 className="text-3xl font-bold text-gray-900">{isArchivedView ? '已封存提示詞' : '提示詞管理'}</h1>
context/snapshots/2026-01/code_HEAD_066d36b.md:320:apps/web/src/prototype/PrototypeApp.tsx:954:      <h1 className="text-3xl font-bold text-gray-900 mb-8 flex items-center gap-2">
context/snapshots/2026-01/code_HEAD_066d36b.md:321:apps/web/src/prototype/PrototypeApp.tsx:1276:              className="w-full text-4xl font-bold text-gray-900 placeholder-gray-300 border-none focus:ring-0 focus:outline-none p-0 bg-transparent leading-tight mb-2"
context/snapshots/2026-01/code_HEAD_066d36b.md:322:docs/WOS_UI_UX_CONSTITUTION.md:62:    *   **Title Area**：巨大標題 (text-4xl)，無框輸入。
context/snapshots/2026-01/code_HEAD_066d36b.md:323:experience/2026-01/uiux_clipboard_notion.md:26:   - Content title used `text-4xl` (36px) which felt oversized
context/snapshots/2026-01/code_HEAD_066d36b.md:324:experience/2026-01/uiux_clipboard_notion.md:28:   - **Gap**: Baseline uses more balanced typography scale (text-3xl/2xl range)
context/snapshots/2026-01/code_HEAD_066d36b.md:325:experience/2026-01/uiux_clipboard_notion.md:68:`text-4xl` (36px) was chosen for prominence but:
context/snapshots/2026-01/code_HEAD_066d36b.md:326:experience/2026-01/uiux_clipboard_notion.md:71:- Baseline pages use `text-3xl` or `text-2xl` for similar contexts
context/snapshots/2026-01/code_HEAD_066d36b.md:327:experience/2026-01/uiux_clipboard_notion.md:134:className="w-full text-4xl font-bold text-gray-900 ..."  // 36px
context/snapshots/2026-01/code_HEAD_066d36b.md:328:experience/2026-01/uiux_clipboard_notion.md:139:className="w-full text-3xl font-bold text-gray-900 ... leading-tight"  // 30px
context/snapshots/2026-01/code_HEAD_066d36b.md:329:experience/2026-01/uiux_clipboard_notion.md:143:- `text-4xl` (36px) → `text-3xl` (30px): More balanced typography scale
context/snapshots/2026-01/code_HEAD_066d36b.md:330:experience/2026-01/uiux_clipboard_notion.md:238:- ✅ Title size reduced to text-3xl (more balanced)
context/snapshots/2026-01/code_HEAD_066d36b.md:331:experience/2026-01/uiux_clipboard_notion.md:255:- **Title class**: `text-3xl ... leading-tight` ✅
context/snapshots/2026-01/code_HEAD_066d36b.md:332:experience/2026-01/uiux_clipboard_notion.md:278:**Before Phase 3**: Title in text-4xl, delete button icon-only
context/snapshots/2026-01/code_HEAD_066d36b.md:333:experience/2026-01/uiux_clipboard_notion.md:284:**After Phase 3**: Title in text-3xl, both buttons with icon+text
context/snapshots/2026-01/code_HEAD_066d36b.md:334:experience/2026-01/uiux_clipboard_notion.md:301:- Line 344: Reduced title size text-4xl → text-3xl + added leading-tight
context/snapshots/2026-01/code_HEAD_066d36b.md:335:experience/2026-01/uiux_clipboard_notion.md:318:   - Use `text-3xl` or `text-2xl` for titles (not text-4xl)
context/snapshots/2026-01/code_HEAD_066d36b.md:336:experience/2026-01/uiux_clipboard_notion.md:320:   - Reserve larger sizes (text-4xl+) for landing pages or long-form articles
context/snapshots/2026-01/code_HEAD_066d36b.md:337:experience/2026-01/uiux_clipboard_notion.md:341:- Don't use text-4xl+ for short titles in dense interfaces (save for hero sections)
context/snapshots/2026-01/code_HEAD_066d36b.md:338:experience/2026-01/uiux_clipboard_notion.md:357:| **Title Size** | text-4xl | ✅ Maintained | **text-3xl + leading-tight** |
context/snapshots/2026-01/code_HEAD_066d36b.md:339:experience/2026-01/uiux_clipboard_notion.md:373:- **Content Title** (Line 344): `text-3xl ... leading-tight`
context/snapshots/2026-01/code_HEAD_467c7da.md:195:### Typography 混用檢查（text-2xl/3xl/4xl）
context/snapshots/2026-01/code_HEAD_467c7da.md:196:- 指令：`git grep -n "text-2xl\|text-3xl\|text-4xl"`
context/snapshots/2026-01/code_HEAD_467c7da.md:200:0resource/ui_prototype_v3.jsx:547:            <h1 className="text-3xl font-bold text-gray-900">
context/snapshots/2026-01/code_HEAD_467c7da.md:201:0resource/ui_prototype_v3.jsx:752:            <h1 className="text-3xl font-bold text-gray-900">
context/snapshots/2026-01/code_HEAD_467c7da.md:202:0resource/ui_prototype_v3.jsx:903:      <h1 className="text-3xl font-bold text-gray-900 mb-8 flex items-center gap-2">
context/snapshots/2026-01/code_HEAD_467c7da.md:203:0resource/ui_prototype_v3.jsx:1226:                    className="w-full text-4xl font-bold text-gray-900 placeholder-gray-300 border-none focus:ring-0 focus:outline-none p-0 bg-transparent leading-tight mb-2"
context/snapshots/2026-01/code_HEAD_467c7da.md:204:apps/web/src/features/inbox/InboxView.tsx:230:                    className="w-full text-4xl font-bold border-none outline-none placeholder-gray-300 py-2 bg-transparent text-gray-900"
context/snapshots/2026-01/code_HEAD_467c7da.md:205:apps/web/src/features/inbox/InboxView.tsx:410:                          h1: ({ node, ...props }) => <h1 className="text-2xl font-bold mt-8 mb-4 border-b pb-2" {...props} />,
context/snapshots/2026-01/code_HEAD_467c7da.md:206:apps/web/src/layout/DetailPanel.tsx:282:              className="w-full text-4xl font-bold text-gray-900 placeholder-gray-300 border-none focus:ring-0 focus:outline-none p-0 bg-transparent leading-tight mb-2"
context/snapshots/2026-01/code_HEAD_467c7da.md:207:apps/web/src/layout/MainContent.tsx:183:          <h1 className="text-3xl font-bold text-gray-900">{title}</h1>
context/snapshots/2026-01/code_HEAD_467c7da.md:208:apps/web/src/layout/SidePanel.tsx:247:                  className="w-full text-4xl font-bold text-gray-900 placeholder-gray-300 border-none focus:ring-0 focus:outline-none p-0 bg-transparent leading-tight mb-2"
context/snapshots/2026-01/code_HEAD_467c7da.md:209:apps/web/src/prototype/PrototypeApp.tsx:547:            <h1 className="text-3xl font-bold text-gray-900">{isArchivedView ? '已封存專案' : '專案管理'}</h1>
context/snapshots/2026-01/code_HEAD_467c7da.md:210:apps/web/src/prototype/PrototypeApp.tsx:777:            <h1 className="text-3xl font-bold text-gray-900">{isArchivedView ? '已封存提示詞' : '提示詞管理'}</h1>
context/snapshots/2026-01/code_HEAD_467c7da.md:211:apps/web/src/prototype/PrototypeApp.tsx:954:      <h1 className="text-3xl font-bold text-gray-900 mb-8 flex items-center gap-2">
context/snapshots/2026-01/code_HEAD_467c7da.md:212:apps/web/src/prototype/PrototypeApp.tsx:1276:              className="w-full text-4xl font-bold text-gray-900 placeholder-gray-300 border-none focus:ring-0 focus:outline-none p-0 bg-transparent leading-tight mb-2"
context/snapshots/2026-01/code_HEAD_467c7da.md:213:docs/WOS_UI_UX_CONSTITUTION.md:62:    *   **Title Area**：巨大標題 (text-4xl)，無框輸入。
context/snapshots/2026-01/code_HEAD_7926c1b.md:312:### Typography 混用檢查（text-2xl/3xl/4xl）
context/snapshots/2026-01/code_HEAD_7926c1b.md:313:- 指令：`git grep -n "text-2xl\|text-3xl\|text-4xl"`
context/snapshots/2026-01/code_HEAD_7926c1b.md:317:0resource/ui_prototype_v3.jsx:547:            <h1 className="text-3xl font-bold text-gray-900">
context/snapshots/2026-01/code_HEAD_7926c1b.md:318:0resource/ui_prototype_v3.jsx:752:            <h1 className="text-3xl font-bold text-gray-900">
context/snapshots/2026-01/code_HEAD_7926c1b.md:319:0resource/ui_prototype_v3.jsx:903:      <h1 className="text-3xl font-bold text-gray-900 mb-8 flex items-center gap-2">
context/snapshots/2026-01/code_HEAD_7926c1b.md:320:0resource/ui_prototype_v3.jsx:1226:                    className="w-full text-4xl font-bold text-gray-900 placeholder-gray-300 border-none focus:ring-0 focus:outline-none p-0 bg-transparent leading-tight mb-2"
context/snapshots/2026-01/code_HEAD_7926c1b.md:321:apps/web/src/features/clipboard/ClipboardView.tsx:332:                      className="w-full text-3xl font-bold text-gray-900 placeholder-gray-200 border-none p-0 focus:ring-0 bg-transparent leading-tight"
context/snapshots/2026-01/code_HEAD_7926c1b.md:322:apps/web/src/features/inbox/InboxView.tsx:230:                    className="w-full text-4xl font-bold border-none outline-none placeholder-gray-300 py-2 bg-transparent text-gray-900"
context/snapshots/2026-01/code_HEAD_7926c1b.md:323:apps/web/src/features/inbox/InboxView.tsx:410:                          h1: ({ node, ...props }) => <h1 className="text-2xl font-bold mt-8 mb-4 border-b pb-2" {...props} />,
context/snapshots/2026-01/code_HEAD_7926c1b.md:324:apps/web/src/layout/DetailPanel.tsx:282:              className="w-full text-4xl font-bold text-gray-900 placeholder-gray-300 border-none focus:ring-0 focus:outline-none p-0 bg-transparent leading-tight mb-2"
context/snapshots/2026-01/code_HEAD_7926c1b.md:325:apps/web/src/layout/MainContent.tsx:183:          <h1 className="text-3xl font-bold text-gray-900">{title}</h1>
context/snapshots/2026-01/code_HEAD_7926c1b.md:326:apps/web/src/layout/SidePanel.tsx:247:                  className="w-full text-4xl font-bold text-gray-900 placeholder-gray-300 border-none focus:ring-0 focus:outline-none p-0 bg-transparent leading-tight mb-2"
context/snapshots/2026-01/code_HEAD_7926c1b.md:327:apps/web/src/prototype/PrototypeApp.tsx:547:            <h1 className="text-3xl font-bold text-gray-900">{isArchivedView ? '已封存專案' : '專案管理'}</h1>
context/snapshots/2026-01/code_HEAD_7926c1b.md:328:apps/web/src/prototype/PrototypeApp.tsx:777:            <h1 className="text-3xl font-bold text-gray-900">{isArchivedView ? '已封存提示詞' : '提示詞管理'}</h1>
context/snapshots/2026-01/code_HEAD_7926c1b.md:329:apps/web/src/prototype/PrototypeApp.tsx:954:      <h1 className="text-3xl font-bold text-gray-900 mb-8 flex items-center gap-2">
context/snapshots/2026-01/code_HEAD_7926c1b.md:330:apps/web/src/prototype/PrototypeApp.tsx:1276:              className="w-full text-4xl font-bold text-gray-900 placeholder-gray-300 border-none focus:ring-0 focus:outline-none p-0 bg-transparent leading-tight mb-2"
```

### Spacing 混用檢查（px-8/p-3/p-4 等）
- 指令：`git grep -n "px-8\|px-10\|p-3\|p-4\|p-5"`
- 命中：是

```
0resource/ui_prototype_v3.jsx:545:        <div className="px-8 pt-8 pb-4 flex-shrink-0">
0resource/ui_prototype_v3.jsx:578:        <div className={`flex-1 overflow-y-auto overflow-x-hidden ${projectSubView === 'board' ? 'bg-[#F7F7F5] p-0' : 'bg-white px-8'} custom-scrollbar`}>
0resource/ui_prototype_v3.jsx:693:      <div className="flex gap-4 h-full min-w-[800px] overflow-x-auto p-8 bg-[#F7F7F5]">
0resource/ui_prototype_v3.jsx:707:                  className="bg-white p-3 rounded-[3px] shadow-sm hover:shadow-md cursor-pointer transition-all border border-gray-200/50 hover:border-gray-300 group"
0resource/ui_prototype_v3.jsx:750:        <div className="px-8 pt-8 pb-4 flex-shrink-0">
0resource/ui_prototype_v3.jsx:783:        <div className={`flex-1 overflow-y-auto overflow-x-hidden ${promptSubView === 'board' ? 'bg-[#F7F7F5] p-0' : 'bg-white px-8'} custom-scrollbar`}>
0resource/ui_prototype_v3.jsx:852:      <div className="flex gap-4 h-full min-w-[800px] overflow-x-auto p-8 bg-[#F7F7F5]">
0resource/ui_prototype_v3.jsx:868:                    className="bg-white p-3 rounded-[3px] shadow-sm hover:shadow-md cursor-pointer transition-all border border-gray-200/50 hover:border-gray-300 group"
0resource/ui_prototype_v3.jsx:935:              className="bg-white p-4 rounded-lg border border-gray-200 hover:border-gray-300 hover:shadow-sm cursor-pointer transition-all group"
0resource/ui_prototype_v3.jsx:1072:        <div className="absolute bottom-6 left-1/2 transform -translate-x-1/2 bg-gray-900 text-white px-4 py-2.5 rounded shadow-xl flex items-center gap-3 text-sm animate-fade-in-up z-50">
0resource/ui_prototype_v3.jsx:1372:                        className="w-full min-h-[60px] p-3 bg-gray-50 rounded border border-transparent focus:bg-white focus:border-blue-200 focus:ring-0 text-gray-700 text-sm leading-relaxed resize-none transition-all placeholder-gray-400"
apps/browser-extension/src/App.tsx:98:      <div className="bg-slate-900 text-white p-4 flex justify-between items-center shadow-md">
apps/browser-extension/src/App.tsx:113:      <div className="p-5 flex-1 flex flex-col gap-4">
apps/browser-extension/src/App.tsx:117:          <div className="p-3 bg-green-100 border border-green-300 text-green-800 rounded text-sm font-medium animate-pulse">
apps/browser-extension/src/App.tsx:123:          <div className="p-3 bg-red-100 border border-red-300 text-red-800 rounded text-sm">
apps/browser-extension/src/App.tsx:164:      <div className="p-4 bg-white border-t border-slate-200">
apps/web/src/components/ConfirmDialog.tsx:81:                <div className={`flex items-start gap-4 p-5 border-b ${styles.border}`}>
apps/web/src/features/archive/ArchiveView.tsx:107:            <div className="grid grid-cols-[32px_minmax(400px,4fr)_120px_minmax(200px,2fr)_160px] gap-4 text-xs font-medium text-gray-400 border-b border-gray-100 bg-white sticky top-0 z-10 items-center">
apps/web/src/features/archive/ArchiveView.tsx:118:                className="grid grid-cols-[32px_minmax(400px,4fr)_120px_minmax(200px,2fr)_160px] gap-4 items-center hover:bg-gray-50 transition-colors group border-b border-gray-100 h-10"
apps/web/src/features/clipboard/ClipboardView.tsx:251:              <div className="p-4 text-muted text-xs text-center">載入中...</div>
apps/web/src/features/clipboard/ClipboardView.tsx:253:              <div className="p-4 text-muted text-xs text-center">
apps/web/src/features/clipboard/ClipboardView.tsx:338:                  <div className="flex items-center gap-4 text-sm group">
apps/web/src/features/conflict/ConflictBanner.tsx:17:    <div className="px-4 py-2 border-b border-amber-300 bg-amber-50 text-xs text-amber-900 flex items-center justify-between gap-4">
apps/web/src/features/history/HistoryView.tsx:101:      <div className="p-4 border-b border-gray-100">
apps/web/src/features/history/HistoryView.tsx:124:      <div className="flex-1 overflow-y-auto p-4 space-y-4">
apps/web/src/features/inbox/InboxView.tsx:137:      <div className="mb-4 p-3 bg-amber-50 border border-amber-200 rounded text-xs text-amber-900 flex items-start gap-2">
apps/web/src/features/inbox/InboxView.tsx:145:      <div className="flex gap-4 flex-1 min-h-0">
apps/web/src/features/inbox/InboxView.tsx:165:                className={`w-full text-left p-3 rounded border text-xs transition-all ${selectedId === item.id
apps/web/src/features/inbox/InboxView.tsx:426:                              : <code className="block bg-gray-50 p-4 rounded-lg text-sm font-mono my-4 border border-gray-100 overflow-x-auto" {...props}>{children}</code>;
apps/web/src/features/library/ListView.tsx:245:    <div className="flex gap-4 h-full min-w-[800px] overflow-x-auto p-8 bg-[#F7F7F5]">
apps/web/src/features/library/ListView.tsx:261:                  className={`bg-white p-3 rounded-[3px] shadow-sm hover:shadow-md cursor-pointer transition-all border border-gray-200/50 hover:border-gray-300 group ${selectedPromptId === prompt.id ? 'ring-2 ring-blue-500' : ''
apps/web/src/features/settings/SettingsView.tsx:98:          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md text-sm text-red-700">
apps/web/src/features/settings/SettingsView.tsx:104:          <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-md text-sm text-green-700">
apps/web/src/features/settings/SettingsView.tsx:150:                  <div key={category} className="border border-subtle rounded-md p-3">
apps/web/src/features/settings/SettingsView.tsx:256:                  <div key={key} className="border border-subtle rounded-md p-3">
apps/web/src/features/settings/SettingsView.tsx:406:        <div className="mt-8 p-4 bg-blue-50 border border-blue-200 rounded-md text-sm">
apps/web/src/features/trash/RestoreConflictDialog.tsx:32:        <div className="mb-4 p-3 bg-yellow-50 border border-yellow-200 rounded text-sm">
apps/web/src/features/trash/RestoreConflictDialog.tsx:44:          <label className="flex items-start gap-3 cursor-pointer">
apps/web/src/features/trash/RestoreConflictDialog.tsx:71:          <label className="flex items-start gap-3 cursor-pointer">
apps/web/src/features/trash/TrashView.tsx:90:        <div className="grid grid-cols-[32px_minmax(300px,3fr)_1px_minmax(150px,2fr)_160px_80px] gap-4 text-xs font-medium text-gray-400 border-b border-gray-100 bg-white sticky top-0 z-10 items-center">
apps/web/src/features/trash/TrashView.tsx:101:            <div className="grid grid-cols-[32px_minmax(300px,3fr)_1px_minmax(150px,2fr)_160px_80px] gap-4 items-center hover:bg-gray-50 transition-colors border-b border-gray-100 h-12">
apps/web/src/features/trash/TrashView.tsx:143:        <div className="absolute inset-0 bg-black/20 z-50 flex items-center justify-center p-4">
apps/web/src/features/trash/TrashView.tsx:145:            <div className="flex items-center gap-3 text-amber-600 mb-4">
apps/web/src/features/trash/TrashView.tsx:154:            <div className="bg-gray-50 rounded p-3 mb-6 text-xs font-mono text-gray-500 max-h-32 overflow-y-auto">
apps/web/src/features/trash/TrashView.tsx:162:            <div className="flex justify-end gap-3">
apps/web/src/layout/DetailPanel.tsx:343:              className="w-full min-h-[60px] p-3 bg-gray-50 rounded border border-transparent focus:bg-white focus:border-blue-200 focus:ring-0 text-gray-700 text-[11px] leading-relaxed resize-none transition-all placeholder-gray-400"
apps/web/src/layout/MainContent.tsx:181:      <div className="px-8 pt-8 pb-4 flex-shrink-0">
apps/web/src/layout/ProjectView.tsx:377:      <div className="flex gap-4 h-full w-full overflow-x-auto bg-white p-0 pt-2">
apps/web/src/layout/ProjectView.tsx:423:                            className={`bg-white p-3 rounded shadow-sm hover:shadow-md cursor-pointer transition-all border border-gray-200/40 hover:border-gray-300 group relative flex flex-col min-h-[120px] mb-2 ${snapshot.isDragging ? 'shadow-lg rotate-1 ring-2 ring-blue-500/20' : ''}`}
apps/web/src/layout/PromptView.tsx:372:      <div className="flex gap-4 h-full w-full overflow-x-auto bg-white p-0 pt-2">
apps/web/src/layout/PromptView.tsx:416:                            className={`bg-white p-3 rounded shadow-sm hover:shadow-md cursor-pointer transition-all border border-gray-200/40 hover:border-gray-300 group flex flex-col min-h-[120px] mb-2 ${snapshot.isDragging ? 'shadow-lg rotate-1 ring-2 ring-emerald-500/20' : ''}`}
apps/web/src/layout/SidePanel.tsx:207:      <div className="flex border-b border-gray-100 px-4 gap-4 text-xs font-medium bg-gray-50/50">
apps/web/src/layout/SidePanel.tsx:231:          <div className="mb-4 p-4 bg-red-50 text-red-600 rounded">
apps/web/src/prototype/PrototypeApp.tsx:545:        <div className="px-8 pt-8 pb-4 flex-shrink-0">
apps/web/src/prototype/PrototypeApp.tsx:581:        <div className={`flex-1 overflow-y-auto overflow-x-hidden ${projectSubView === 'board' ? 'bg-[#F7F7F5] p-0' : 'bg-white px-8'} custom-scrollbar`}>
apps/web/src/prototype/PrototypeApp.tsx:719:      <div className="flex gap-4 h-full min-w-[800px] overflow-x-auto p-8 bg-[#F7F7F5]">
apps/web/src/prototype/PrototypeApp.tsx:733:                    className={`bg-white p-3 rounded-[3px] shadow-sm hover:shadow-md cursor-pointer transition-all border border-gray-200/50 hover:border-gray-300 group ${col.color}`}
apps/web/src/prototype/PrototypeApp.tsx:775:        <div className="px-8 pt-8 pb-4 flex-shrink-0">
apps/web/src/prototype/PrototypeApp.tsx:811:        <div className={`flex-1 overflow-y-auto overflow-x-hidden ${promptSubView === 'board' ? 'bg-[#F7F7F5] p-0' : 'bg-white px-8'} custom-scrollbar`}>
apps/web/src/prototype/PrototypeApp.tsx:905:      <div className="flex gap-4 h-full min-w-[800px] overflow-x-auto p-8 bg-[#F7F7F5]">
apps/web/src/prototype/PrototypeApp.tsx:919:                    className={`bg-white p-3 rounded-[3px] shadow-sm hover:shadow-md cursor-pointer transition-all border border-gray-200/50 hover:border-gray-300 group ${col.color}`}
apps/web/src/prototype/PrototypeApp.tsx:991:              className="bg-white p-4 rounded-lg border border-gray-200 hover:border-gray-300 hover:shadow-sm cursor-pointer transition-all group"
apps/web/src/prototype/PrototypeApp.tsx:1146:        <div className="absolute bottom-6 left-1/2 transform -translate-x-1/2 bg-gray-900 text-white px-4 py-2.5 rounded shadow-xl flex items-center gap-3 text-sm animate-fade-in-up z-50">
apps/web/src/prototype/PrototypeApp.tsx:1372:                className="w-full min-h-[60px] p-3 bg-gray-50 rounded border border-transparent focus:bg-white focus:border-blue-200 focus:ring-0 text-gray-700 text-sm leading-relaxed resize-none transition-all placeholder-gray-400"
context/checklists/uiux_clipboard_notion_checklist.md:40:    - 指出「搜尋」所在容器：`<div className="p-3 border-b border-subtle space-y-3" role="toolbar">` (Sidebar Header)
context/snapshots/2026-01/code_HEAD_066d36b.md:342:### Spacing 混用檢查（px-8/p-3/p-4 等）
context/snapshots/2026-01/code_HEAD_066d36b.md:343:- 指令：`git grep -n "px-8\|px-10\|p-3\|p-4\|p-5"`
context/snapshots/2026-01/code_HEAD_066d36b.md:347:0resource/ui_prototype_v3.jsx:545:        <div className="px-8 pt-8 pb-4 flex-shrink-0">
context/snapshots/2026-01/code_HEAD_066d36b.md:348:0resource/ui_prototype_v3.jsx:578:        <div className={`flex-1 overflow-y-auto overflow-x-hidden ${projectSubView === 'board' ? 'bg-[#F7F7F5] p-0' : 'bg-white px-8'} custom-scrollbar`}>
context/snapshots/2026-01/code_HEAD_066d36b.md:349:0resource/ui_prototype_v3.jsx:693:      <div className="flex gap-4 h-full min-w-[800px] overflow-x-auto p-8 bg-[#F7F7F5]">
context/snapshots/2026-01/code_HEAD_066d36b.md:350:0resource/ui_prototype_v3.jsx:707:                  className="bg-white p-3 rounded-[3px] shadow-sm hover:shadow-md cursor-pointer transition-all border border-gray-200/50 hover:border-gray-300 group"
context/snapshots/2026-01/code_HEAD_066d36b.md:351:0resource/ui_prototype_v3.jsx:750:        <div className="px-8 pt-8 pb-4 flex-shrink-0">
context/snapshots/2026-01/code_HEAD_066d36b.md:352:0resource/ui_prototype_v3.jsx:783:        <div className={`flex-1 overflow-y-auto overflow-x-hidden ${promptSubView === 'board' ? 'bg-[#F7F7F5] p-0' : 'bg-white px-8'} custom-scrollbar`}>
context/snapshots/2026-01/code_HEAD_066d36b.md:353:0resource/ui_prototype_v3.jsx:852:      <div className="flex gap-4 h-full min-w-[800px] overflow-x-auto p-8 bg-[#F7F7F5]">
context/snapshots/2026-01/code_HEAD_066d36b.md:354:0resource/ui_prototype_v3.jsx:868:                    className="bg-white p-3 rounded-[3px] shadow-sm hover:shadow-md cursor-pointer transition-all border border-gray-200/50 hover:border-gray-300 group"
context/snapshots/2026-01/code_HEAD_066d36b.md:355:0resource/ui_prototype_v3.jsx:935:              className="bg-white p-4 rounded-lg border border-gray-200 hover:border-gray-300 hover:shadow-sm cursor-pointer transition-all group"
context/snapshots/2026-01/code_HEAD_066d36b.md:356:0resource/ui_prototype_v3.jsx:1072:        <div className="absolute bottom-6 left-1/2 transform -translate-x-1/2 bg-gray-900 text-white px-4 py-2.5 rounded shadow-xl flex items-center gap-3 text-sm animate-fade-in-up z-50">
context/snapshots/2026-01/code_HEAD_066d36b.md:357:0resource/ui_prototype_v3.jsx:1372:                        className="w-full min-h-[60px] p-3 bg-gray-50 rounded border border-transparent focus:bg-white focus:border-blue-200 focus:ring-0 text-gray-700 text-sm leading-relaxed resize-none transition-all placeholder-gray-400"
context/snapshots/2026-01/code_HEAD_066d36b.md:358:apps/browser-extension/src/App.tsx:98:      <div className="bg-slate-900 text-white p-4 flex justify-between items-center shadow-md">
context/snapshots/2026-01/code_HEAD_066d36b.md:359:apps/browser-extension/src/App.tsx:113:      <div className="p-5 flex-1 flex flex-col gap-4">
```

### 硬編碼色碼檢查
- 指令：`git grep -n "#[0-9a-fA-F]\{3,8\}\|bg-\[#\|text-\[#\|border-\[#"`
- 命中：是

```
Binary file "0resource/notionstyle/02 \346\217\220\347\244\272\350\251\236\347\234\213\346\235\277.png" matches
Binary file "0resource/notionstyle/03 \345\260\210\346\241\210 \347\267\250\350\274\257\351\240\201\351\235\242(\350\251\263\347\264\260\350\263\207\346\226\231\351\240\201).png" matches
Binary file "0resource/notionstyle/04 \346\217\220\347\244\272\350\251\236 \347\267\250\350\274\257\351\240\201\351\235\242(\350\251\263\347\264\260\350\263\207\346\226\231\351\240\201).png" matches
Binary file "0resource/notionstyle/05 \345\276\236\345\210\227\350\241\250\345\217\257\344\273\245\351\226\213\347\267\250\350\274\257\351\240\201\351\235\242.png" matches
Binary file "0resource/notionstyle/06 \347\267\250\350\274\257Tag\347\232\204\346\226\271\345\274\217.png" matches
0resource/ui_prototype_v3.jsx:69:      background: #E5E7EB;
0resource/ui_prototype_v3.jsx:73:      background: #D1D5DB;
0resource/ui_prototype_v3.jsx:294:      isActive ? 'bg-[#E3E3E1] text-gray-900 font-medium' : 'text-gray-600 hover:bg-[#EAEAEA]'
0resource/ui_prototype_v3.jsx:578:        <div className={`flex-1 overflow-y-auto overflow-x-hidden ${projectSubView === 'board' ? 'bg-[#F7F7F5] p-0' : 'bg-white px-8'} custom-scrollbar`}>
0resource/ui_prototype_v3.jsx:693:      <div className="flex gap-4 h-full min-w-[800px] overflow-x-auto p-8 bg-[#F7F7F5]">
0resource/ui_prototype_v3.jsx:783:        <div className={`flex-1 overflow-y-auto overflow-x-hidden ${promptSubView === 'board' ? 'bg-[#F7F7F5] p-0' : 'bg-white px-8'} custom-scrollbar`}>
0resource/ui_prototype_v3.jsx:852:      <div className="flex gap-4 h-full min-w-[800px] overflow-x-auto p-8 bg-[#F7F7F5]">
0resource/ui_prototype_v3.jsx:907:        <div className="bg-[#F7F7F5] p-6 rounded-lg h-fit">
0resource/ui_prototype_v3.jsx:940:                  <span className="text-[10px] text-gray-500 bg-[#F7F7F5] px-1.5 py-0.5 rounded w-fit mt-1">{snippet.category}</span>
0resource/ui_prototype_v3.jsx:959:              <p className="text-sm text-gray-500 line-clamp-2 font-mono bg-[#F7F7F5] p-2 rounded border border-gray-100">
0resource/ui_prototype_v3.jsx:972:    <div className="flex h-screen bg-white font-sans text-gray-900 selection:bg-[#CDE8F0] relative">
0resource/ui_prototype_v3.jsx:976:      <aside className={`flex-shrink-0 bg-[#F7F7F5] flex flex-col transition-all duration-300 ${isSidebarOpen ? 'w-60' : 'w-12'} overflow-hidden`}>
Binary file "0resource/ui_reference/03 \345\260\210\346\241\210 \347\267\250\350\274\257\351\240\201\351\235\242(\350\251\263\347\264\260\350\263\207\346\226\231\351\240\201).png" matches
apps/browser-extension/src/index.css:10:  background-color: #f8fafc; /* slage-50 */
apps/web/src/App.tsx:15:    <div className="flex h-screen bg-white font-sans text-gray-900 selection:bg-[#CDE8F0] relative">
apps/web/src/features/inbox/taxonomy.ts:68:        { value: '#decision', label: '關鍵決策' },
apps/web/src/features/library/ListView.tsx:245:    <div className="flex gap-4 h-full min-w-[800px] overflow-x-auto p-8 bg-[#F7F7F5]">
apps/web/src/index.css:12:  background-color: #ffffff;
apps/web/src/layout/DetailPanel.tsx:256:      <div className="px-4 py-2 border-b border-gray-100 bg-[#F7F7F5] text-xs">
apps/web/src/layout/Sidebar.tsx:9:      isActive ? 'bg-[#E3E3E1] text-gray-900 font-medium' : 'text-gray-600 hover:bg-[#EAEAEA]'
apps/web/src/layout/Sidebar.tsx:41:      className={`flex-shrink-0 bg-[#F7F7F5] flex flex-col transition-all duration-300 ${
apps/web/src/prototype/PrototypeApp.tsx:265:      isActive ? 'bg-[#E3E3E1] text-gray-900 font-medium' : 'text-gray-600 hover:bg-[#EAEAEA]'
apps/web/src/prototype/PrototypeApp.tsx:581:        <div className={`flex-1 overflow-y-auto overflow-x-hidden ${projectSubView === 'board' ? 'bg-[#F7F7F5] p-0' : 'bg-white px-8'} custom-scrollbar`}>
apps/web/src/prototype/PrototypeApp.tsx:719:      <div className="flex gap-4 h-full min-w-[800px] overflow-x-auto p-8 bg-[#F7F7F5]">
apps/web/src/prototype/PrototypeApp.tsx:811:        <div className={`flex-1 overflow-y-auto overflow-x-hidden ${promptSubView === 'board' ? 'bg-[#F7F7F5] p-0' : 'bg-white px-8'} custom-scrollbar`}>
apps/web/src/prototype/PrototypeApp.tsx:905:      <div className="flex gap-4 h-full min-w-[800px] overflow-x-auto p-8 bg-[#F7F7F5]">
apps/web/src/prototype/PrototypeApp.tsx:958:        <div className="bg-[#F7F7F5] p-6 rounded-lg h-fit">
apps/web/src/prototype/PrototypeApp.tsx:996:                  <span className="text-[10px] text-gray-500 bg-[#F7F7F5] px-1.5 py-0.5 rounded w-fit mt-1">
apps/web/src/prototype/PrototypeApp.tsx:1024:              <p className="text-sm text-gray-500 line-clamp-2 font-mono bg-[#F7F7F5] p-2 rounded border border-gray-100">
apps/web/src/prototype/PrototypeApp.tsx:1035:    <div className="flex h-screen bg-white font-sans text-gray-900 selection:bg-[#CDE8F0] relative">
apps/web/src/prototype/PrototypeApp.tsx:1039:        className={`flex-shrink-0 bg-[#F7F7F5] flex flex-col transition-all duration-300 ${
apps/web/src/ui/Button.tsx:17:            primary: "bg-[#2383E2] text-white hover:bg-[#1D74C9] border border-transparent shadow-sm", // Notion blue
apps/web/src/ui/Button.tsx:18:            secondary: "bg-white text-[#37352F] border border-[rgba(55,53,47,0.16)] hover:bg-[rgba(55,53,47,0.08)] shadow-sm",
apps/web/src/ui/Button.tsx:20:            ghost: "bg-transparent text-[#37352F] hover:bg-[rgba(55,53,47,0.08)]",
apps/web/src/ui/PrototypeGlobalStyles.tsx:41:      background: #E5E7EB;
apps/web/src/ui/PrototypeGlobalStyles.tsx:45:      background: #D1D5DB;
context/snapshots/2026-01/code_HEAD_066d36b.md:348:0resource/ui_prototype_v3.jsx:578:        <div className={`flex-1 overflow-y-auto overflow-x-hidden ${projectSubView === 'board' ? 'bg-[#F7F7F5] p-0' : 'bg-white px-8'} custom-scrollbar`}>
context/snapshots/2026-01/code_HEAD_066d36b.md:349:0resource/ui_prototype_v3.jsx:693:      <div className="flex gap-4 h-full min-w-[800px] overflow-x-auto p-8 bg-[#F7F7F5]">
context/snapshots/2026-01/code_HEAD_066d36b.md:352:0resource/ui_prototype_v3.jsx:783:        <div className={`flex-1 overflow-y-auto overflow-x-hidden ${promptSubView === 'board' ? 'bg-[#F7F7F5] p-0' : 'bg-white px-8'} custom-scrollbar`}>
context/snapshots/2026-01/code_HEAD_066d36b.md:353:0resource/ui_prototype_v3.jsx:852:      <div className="flex gap-4 h-full min-w-[800px] overflow-x-auto p-8 bg-[#F7F7F5]">
context/snapshots/2026-01/code_HEAD_066d36b.md:376:apps/web/src/features/library/ListView.tsx:245:    <div className="flex gap-4 h-full min-w-[800px] overflow-x-auto p-8 bg-[#F7F7F5]">
context/snapshots/2026-01/code_HEAD_066d36b.md:401:apps/web/src/prototype/PrototypeApp.tsx:581:        <div className={`flex-1 overflow-y-auto overflow-x-hidden ${projectSubView === 'board' ? 'bg-[#F7F7F5] p-0' : 'bg-white px-8'} custom-scrollbar`}>
context/snapshots/2026-01/code_HEAD_066d36b.md:402:apps/web/src/prototype/PrototypeApp.tsx:719:      <div className="flex gap-4 h-full min-w-[800px] overflow-x-auto p-8 bg-[#F7F7F5]">
context/snapshots/2026-01/code_HEAD_066d36b.md:405:apps/web/src/prototype/PrototypeApp.tsx:811:        <div className={`flex-1 overflow-y-auto overflow-x-hidden ${promptSubView === 'board' ? 'bg-[#F7F7F5] p-0' : 'bg-white px-8'} custom-scrollbar`}>
context/snapshots/2026-01/code_HEAD_066d36b.md:406:apps/web/src/prototype/PrototypeApp.tsx:905:      <div className="flex gap-4 h-full min-w-[800px] overflow-x-auto p-8 bg-[#F7F7F5]">
context/snapshots/2026-01/code_HEAD_066d36b.md:432:0resource/ui_prototype_v3.jsx:69:      background: #E5E7EB;
context/snapshots/2026-01/code_HEAD_066d36b.md:433:0resource/ui_prototype_v3.jsx:73:      background: #D1D5DB;
context/snapshots/2026-01/code_HEAD_066d36b.md:434:0resource/ui_prototype_v3.jsx:294:      isActive ? 'bg-[#E3E3E1] text-gray-900 font-medium' : 'text-gray-600 hover:bg-[#EAEAEA]'
context/snapshots/2026-01/code_HEAD_066d36b.md:435:0resource/ui_prototype_v3.jsx:578:        <div className={`flex-1 overflow-y-auto overflow-x-hidden ${projectSubView === 'board' ? 'bg-[#F7F7F5] p-0' : 'bg-white px-8'} custom-scrollbar`}>
context/snapshots/2026-01/code_HEAD_066d36b.md:436:0resource/ui_prototype_v3.jsx:693:      <div className="flex gap-4 h-full min-w-[800px] overflow-x-auto p-8 bg-[#F7F7F5]">
context/snapshots/2026-01/code_HEAD_066d36b.md:437:0resource/ui_prototype_v3.jsx:783:        <div className={`flex-1 overflow-y-auto overflow-x-hidden ${promptSubView === 'board' ? 'bg-[#F7F7F5] p-0' : 'bg-white px-8'} custom-scrollbar`}>
context/snapshots/2026-01/code_HEAD_066d36b.md:438:0resource/ui_prototype_v3.jsx:852:      <div className="flex gap-4 h-full min-w-[800px] overflow-x-auto p-8 bg-[#F7F7F5]">
context/snapshots/2026-01/code_HEAD_066d36b.md:439:0resource/ui_prototype_v3.jsx:907:        <div className="bg-[#F7F7F5] p-6 rounded-lg h-fit">
context/snapshots/2026-01/code_HEAD_066d36b.md:440:0resource/ui_prototype_v3.jsx:940:                  <span className="text-[10px] text-gray-500 bg-[#F7F7F5] px-1.5 py-0.5 rounded w-fit mt-1">{snippet.category}</span>
context/snapshots/2026-01/code_HEAD_066d36b.md:441:0resource/ui_prototype_v3.jsx:959:              <p className="text-sm text-gray-500 line-clamp-2 font-mono bg-[#F7F7F5] p-2 rounded border border-gray-100">
context/snapshots/2026-01/code_HEAD_066d36b.md:442:0resource/ui_prototype_v3.jsx:972:    <div className="flex h-screen bg-white font-sans text-gray-900 selection:bg-[#CDE8F0] relative">
context/snapshots/2026-01/code_HEAD_066d36b.md:443:0resource/ui_prototype_v3.jsx:976:      <aside className={`flex-shrink-0 bg-[#F7F7F5] flex flex-col transition-all duration-300 ${isSidebarOpen ? 'w-60' : 'w-12'} overflow-hidden`}>
context/snapshots/2026-01/code_HEAD_066d36b.md:445:apps/browser-extension/src/index.css:10:  background-color: #f8fafc; /* slage-50 */
context/snapshots/2026-01/code_HEAD_066d36b.md:446:apps/web/src/App.tsx:15:    <div className="flex h-screen bg-white font-sans text-gray-900 selection:bg-[#CDE8F0] relative">
context/snapshots/2026-01/code_HEAD_066d36b.md:447:apps/web/src/features/inbox/taxonomy.ts:68:        { value: '#decision', label: '關鍵決策' },
context/snapshots/2026-01/code_HEAD_066d36b.md:448:apps/web/src/features/library/ListView.tsx:245:    <div className="flex gap-4 h-full min-w-[800px] overflow-x-auto p-8 bg-[#F7F7F5]">
context/snapshots/2026-01/code_HEAD_066d36b.md:449:apps/web/src/index.css:12:  background-color: #ffffff;
context/snapshots/2026-01/code_HEAD_066d36b.md:450:apps/web/src/index.css:91:  background-color: #F7F7F5;
context/snapshots/2026-01/code_HEAD_066d36b.md:451:apps/web/src/layout/DetailPanel.tsx:256:      <div className="px-4 py-2 border-b border-gray-100 bg-[#F7F7F5] text-xs">
context/snapshots/2026-01/code_HEAD_066d36b.md:452:apps/web/src/layout/Sidebar.tsx:9:      isActive ? 'bg-[#E3E3E1] text-gray-900 font-medium' : 'text-gray-600 hover:bg-[#EAEAEA]'
context/snapshots/2026-01/code_HEAD_066d36b.md:453:apps/web/src/layout/Sidebar.tsx:41:      className={`flex-shrink-0 bg-[#F7F7F5] flex flex-col transition-all duration-300 ${
context/snapshots/2026-01/code_HEAD_066d36b.md:454:apps/web/src/prototype/PrototypeApp.tsx:265:      isActive ? 'bg-[#E3E3E1] text-gray-900 font-medium' : 'text-gray-600 hover:bg-[#EAEAEA]'
context/snapshots/2026-01/code_HEAD_066d36b.md:455:apps/web/src/prototype/PrototypeApp.tsx:581:        <div className={`flex-1 overflow-y-auto overflow-x-hidden ${projectSubView === 'board' ? 'bg-[#F7F7F5] p-0' : 'bg-white px-8'} custom-scrollbar`}>
context/snapshots/2026-01/code_HEAD_066d36b.md:456:apps/web/src/prototype/PrototypeApp.tsx:719:      <div className="flex gap-4 h-full min-w-[800px] overflow-x-auto p-8 bg-[#F7F7F5]">
context/snapshots/2026-01/code_HEAD_066d36b.md:457:apps/web/src/prototype/PrototypeApp.tsx:811:        <div className={`flex-1 overflow-y-auto overflow-x-hidden ${promptSubView === 'board' ? 'bg-[#F7F7F5] p-0' : 'bg-white px-8'} custom-scrollbar`}>
context/snapshots/2026-01/code_HEAD_066d36b.md:458:apps/web/src/prototype/PrototypeApp.tsx:905:      <div className="flex gap-4 h-full min-w-[800px] overflow-x-auto p-8 bg-[#F7F7F5]">
context/snapshots/2026-01/code_HEAD_066d36b.md:459:apps/web/src/prototype/PrototypeApp.tsx:958:        <div className="bg-[#F7F7F5] p-6 rounded-lg h-fit">
context/snapshots/2026-01/code_HEAD_066d36b.md:460:apps/web/src/prototype/PrototypeApp.tsx:996:                  <span className="text-[10px] text-gray-500 bg-[#F7F7F5] px-1.5 py-0.5 rounded w-fit mt-1">
context/snapshots/2026-01/code_HEAD_066d36b.md:461:apps/web/src/prototype/PrototypeApp.tsx:1024:              <p className="text-sm text-gray-500 line-clamp-2 font-mono bg-[#F7F7F5] p-2 rounded border border-gray-100">
context/snapshots/2026-01/code_HEAD_066d36b.md:462:apps/web/src/prototype/PrototypeApp.tsx:1035:    <div className="flex h-screen bg-white font-sans text-gray-900 selection:bg-[#CDE8F0] relative">
```


## F. Experience Note（提醒）

- 建議：本次若為 UI/UX 或除錯修正，請由 Agent 依 `experience-depositor` 產出對應的經驗檔：
  - `/experience/2026-01/code_71e1e99_<keyword>.md`
- 本 snapshot 只做「證據收集與稽核輸出」，避免自動生成不精準的根因敘述。

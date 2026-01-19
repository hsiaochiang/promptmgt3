# Code Snapshot（HEAD）

- 產出時間：2026-01-17T12:06:35.950Z
- Branch：`001-prompt-asset-hub`
- Commit：`9fcefcb` 測試：snapshot 第二次驗證

## A. 版本與提交資訊

```bash
git rev-parse --abbrev-ref HEAD
git log -1 --oneline
git show --name-only --oneline -1
git status --porcelain
```

**變更檔案（HEAD）**：
- context/architecture.md

**未提交狀態（porcelain）**：
```
M .agent/AGENTS.md
?? .agent/skills/
?? .githooks/
?? context/debugging_protocol.md
?? context/uiux_contract.md
?? tools/snapshot/
```

## B. Diff Stat（摘要）


```
9fcefcb 測試：snapshot 第二次驗證
 context/architecture.md | 3 ++-
 1 file changed, 2 insertions(+), 1 deletion(-)
```


## C. Diff Patch（前 120 行）


```diff
diff --git a/context/architecture.md b/context/architecture.md
index 96f1ed7..8b52ae4 100644
--- a/context/architecture.md
+++ b/context/architecture.md
@@ -19,4 +19,5 @@
 - 重複 UI Pattern 一律抽共用元件
 - 修 bug 先寫 Bug Brief（/context/debugging_protocol.md）
 
-<!-- snapshot test: <今天日期> -->
\ No newline at end of file
+<!-- snapshot test: <今天日期> -->
+<!-- snapshot test 2 -->
\ No newline at end of file
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
apps/web/src/features/clipboard/ClipboardView.tsx:162:            <button
apps/web/src/features/clipboard/ClipboardView.tsx:181:              <button
apps/web/src/features/clipboard/ClipboardView.tsx:265:                      <button
apps/web/src/features/clipboard/ClipboardView.tsx:273:                      <button
apps/web/src/features/clipboard/ClipboardView.tsx:285:                <button
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
```

### Typography 混用檢查（text-2xl/3xl/4xl）
- 指令：`git grep -n "text-2xl\|text-3xl\|text-4xl"`
- 命中：是

```
0resource/ui_prototype_v3.jsx:547:            <h1 className="text-3xl font-bold text-gray-900">
0resource/ui_prototype_v3.jsx:752:            <h1 className="text-3xl font-bold text-gray-900">
0resource/ui_prototype_v3.jsx:903:      <h1 className="text-3xl font-bold text-gray-900 mb-8 flex items-center gap-2">
0resource/ui_prototype_v3.jsx:1226:                    className="w-full text-4xl font-bold text-gray-900 placeholder-gray-300 border-none focus:ring-0 focus:outline-none p-0 bg-transparent leading-tight mb-2"
apps/web/src/features/inbox/InboxView.tsx:230:                    className="w-full text-4xl font-bold border-none outline-none placeholder-gray-300 py-2 bg-transparent text-gray-900"
apps/web/src/features/inbox/InboxView.tsx:410:                          h1: ({ node, ...props }) => <h1 className="text-2xl font-bold mt-8 mb-4 border-b pb-2" {...props} />,
apps/web/src/layout/DetailPanel.tsx:282:              className="w-full text-4xl font-bold text-gray-900 placeholder-gray-300 border-none focus:ring-0 focus:outline-none p-0 bg-transparent leading-tight mb-2"
apps/web/src/layout/MainContent.tsx:183:          <h1 className="text-3xl font-bold text-gray-900">{title}</h1>
apps/web/src/layout/SidePanel.tsx:247:                  className="w-full text-4xl font-bold text-gray-900 placeholder-gray-300 border-none focus:ring-0 focus:outline-none p-0 bg-transparent leading-tight mb-2"
apps/web/src/prototype/PrototypeApp.tsx:547:            <h1 className="text-3xl font-bold text-gray-900">{isArchivedView ? '已封存專案' : '專案管理'}</h1>
apps/web/src/prototype/PrototypeApp.tsx:777:            <h1 className="text-3xl font-bold text-gray-900">{isArchivedView ? '已封存提示詞' : '提示詞管理'}</h1>
apps/web/src/prototype/PrototypeApp.tsx:954:      <h1 className="text-3xl font-bold text-gray-900 mb-8 flex items-center gap-2">
apps/web/src/prototype/PrototypeApp.tsx:1276:              className="w-full text-4xl font-bold text-gray-900 placeholder-gray-300 border-none focus:ring-0 focus:outline-none p-0 bg-transparent leading-tight mb-2"
docs/WOS_UI_UX_CONSTITUTION.md:62:    *   **Title Area**：巨大標題 (text-4xl)，無框輸入。
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
apps/web/src/features/clipboard/ClipboardView.tsx:153:      <div className="mb-4 p-3 bg-blue-50 border border-blue-300 rounded text-xs text-blue-900">
apps/web/src/features/clipboard/ClipboardView.tsx:157:      <div className="flex gap-4 min-h-[400px]">
apps/web/src/features/clipboard/ClipboardView.tsx:173:              <div className="p-4 text-[11px] text-blue-900/70 text-center">載入片段中...</div>
apps/web/src/features/clipboard/ClipboardView.tsx:176:              <div className="p-4 text-[11px] text-blue-900/70 text-center">
apps/web/src/features/clipboard/ClipboardView.tsx:208:        <div className="flex-1 border border-gray-200 rounded p-4 flex flex-col bg-white">
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
package-lock.json:505:      "resolved": "https://registry.npmjs.org/rollup/-/rollup-3.29.5.tgz",
package-lock.json:1978:      "resolved": "https://registry.npmjs.org/@eslint-community/regexpp/-/regexpp-4.12.2.tgz",
package-lock.json:3291:      "resolved": "https://registry.npmjs.org/@uiw/codemirror-extensions-basic-setup/-/codemirror-extensions-basic-setup-4.25.4.tgz",
package-lock.json:4397:      "resolved": "https://registry.npmjs.org/escape-string-regexp/-/escape-string-regexp-5.0.0.tgz",
package-lock.json:4520:      "resolved": "https://registry.npmjs.org/escape-string-regexp/-/escape-string-regexp-4.0.0.tgz",
package-lock.json:4930:      "resolved": "https://registry.npmjs.org/find-up/-/find-up-5.0.0.tgz",
package-lock.json:7699:      "resolved": "https://registry.npmjs.org/pump/-/pump-3.0.3.tgz",
package-lock.json:7884:      "resolved": "https://registry.npmjs.org/readdirp/-/readdirp-3.6.0.tgz",
package-lock.json:8080:      "resolved": "https://registry.npmjs.org/rollup/-/rollup-4.55.1.tgz",
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
apps/web/src/ui/PrototypeGlobalStyles.tsx:41:      background: #E5E7EB;
apps/web/src/ui/PrototypeGlobalStyles.tsx:45:      background: #D1D5DB;
knowledge-base/interactions/2026-01-13_initial-learning.md:30:- 規則 #001：業務/客戶場景優先（biz-operations） — HIGH
knowledge-base/interactions/2026-01-13_initial-learning.md:31:- 規則 #002：技術/程式碼最佳實踐（code-best-practices） — HIGH
knowledge-base/interactions/2026-01-13_initial-learning.md:32:- 規則 #003：前端/UI/設計（wos-frontend） — HIGH
knowledge-base/interactions/2026-01-13_initial-learning.md:33:- 規則 #004：政府標案 / RFP（gov-rfp-helper） — HIGH
knowledge-base/interactions/2026-01-13_initial-learning.md:34:- 規則 #005：Gen-AI / 平台指南（gen-ai-guidelines） — MEDIUM-HIGH
knowledge-base/interactions/2026-01-13_initial-learning.md:35:- 規則 #006：自動化 / 檔案處理（file-search-automation / hackmd-automation） — MEDIUM
knowledge-base/interactions/2026-01-13_initial-learning.md:36:- 規則 #007：個人筆記 / 雜項（personal-notes） — MEDIUM
knowledge-base/interactions/2026-01-13_initial-learning.md:37:- 規則 #008：金融 / 企業資金（fin-inquiry-bot） — MEDIUM-HIGH
knowledge-base/patterns/wilson-classification-rules.md:13:## 規則 #001：業務 / 客戶場景優先
knowledge-base/patterns/wilson-classification-rules.md:31:## 規則 #002：技術 / 程式碼最佳實踐
knowledge-base/patterns/wilson-classification-rules.md:49:## 規則 #003：前端 / UI / 設計類別
knowledge-base/patterns/wilson-classification-rules.md:67:## 規則 #004：政府標案 / RFP
knowledge-base/patterns/wilson-classification-rules.md:84:## 規則 #005：Gen-AI / 平台整合與使用指南
knowledge-base/patterns/wilson-classification-rules.md:102:## 規則 #006：自動化 / 檔案處理（工具與流程）
knowledge-base/patterns/wilson-classification-rules.md:119:## 規則 #007：個人筆記 / 雜項
knowledge-base/patterns/wilson-classification-rules.md:136:## 規則 #008：金融 / 企業資金（專案導向）
tests/unit/slug.spec.ts:24:      expect(normalizeSlug('Test@Project#123')).toBe('testproject123');
```


## F. Experience Note（提醒）

- 建議：本次若為 UI/UX 或除錯修正，請由 Agent 依 `experience-depositor` 產出對應的經驗檔：
  - `/experience/2026-01/code_9fcefcb_<keyword>.md`
- 本 snapshot 只做「證據收集與稽核輸出」，避免自動生成不精準的根因敘述。

import { useEffect, useState } from 'react';
import type { InboxItemEntity, ProjectEntity } from '@pah/contracts';
import { fetchInboxItems, updateInboxItem, deleteInboxItem, fetchProjects } from './api';
import { Trash2, AlertTriangle, Save, RefreshCw, ExternalLink, Eye, Edit2, Tag } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { PROJECT_STATUSES, CATEGORIES, TAG_GROUPS } from './taxonomy';

export function InboxView() {
  const [items, setItems] = useState<InboxItemEntity[]>([]);
  const [projects, setProjects] = useState<ProjectEntity[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [form, setForm] = useState<Pick<InboxItemEntity, 'title' | 'notes' | 'rawContent' | 'sourceLink' | 'suggestedTags' | 'project' | 'status' | 'category' | 'tags'>>({
    title: '',
    notes: '',
    rawContent: '',
    sourceLink: '',
    suggestedTags: [],
    project: '',
    status: '',
    category: '',
    tags: [],
  });

  const [viewMode, setViewMode] = useState<'edit' | 'preview'>('preview');

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  // Load items
  const load = async () => {
    try {
      setLoading(true);
      setError(null);
      const [inboxData, projectData] = await Promise.all([
        fetchInboxItems(),
        fetchProjects()
      ]);
      setItems(inboxData);
      setProjects(projectData);
    } catch (err) {
      setError(err instanceof Error ? err.message : '載入失敗');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const handleSelect = (item: InboxItemEntity) => {
    setSelectedId(item.id);
    setForm({
      title: item.title,
      notes: item.notes || '',
      rawContent: item.rawContent,
      sourceLink: item.sourceLink,
      suggestedTags: item.suggestedTags || [],
      project: item.project || '',
      status: item.status || '',
      category: item.category || '',
      tags: item.tags || [],
    });
    setError(null);
    setSuccess(false);
    setViewMode('preview'); // Default to preview when selecting
    setError(null);
    setSuccess(false);
  };

  const handleSave = async () => {
    if (!selectedId) return;
    try {
      setSaving(true);
      setError(null);
      setSuccess(false);

      const updated = await updateInboxItem(selectedId, {
        title: form.title,
        notes: form.notes,
        rawContent: form.rawContent,
        project: form.project,
        status: form.status,
        category: form.category,
        tags: form.tags,
      });

      setItems(prev => prev.map(i => (i.id === updated.id ? updated : i)));
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch (err) {
      setError(err instanceof Error ? err.message : '保存失敗');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!selectedId) return;
    if (!confirm('警告：此操作將永久刪除此檔案，無法復原！\n\n確定要刪除嗎？')) return;

    try {
      setDeleting(true);
      setError(null);
      await deleteInboxItem(selectedId);

      // Remove from list
      setItems(prev => prev.filter(i => i.id !== selectedId));
      setSelectedId(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : '刪除失敗');
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="h-full flex flex-col">
      {/* Alert Banner */}
      <div className="mb-4 p-3 bg-amber-50 border border-amber-200 rounded text-xs text-amber-900 flex items-start gap-2">
        <AlertTriangle size={14} className="mt-0.5 flex-shrink-0" />
        <div>
          <span className="font-bold">暫存區說明：</span>
          此處顯示由外部工具（如瀏覽器擴充）擷取的原始內容。在此您可以整理標題與內容，但<strong className="text-amber-700">正式歸檔（轉為 Project/Prompt）請使用外部工具</strong>操作。
        </div>
      </div>

      <div className="flex gap-4 flex-1 min-h-0">
        {/* List Column */}
        <div className="w-1/3 flex flex-col border border-gray-200 rounded bg-gray-50/50">
          <div className="p-2 border-b border-gray-200 flex justify-between items-center bg-gray-100/50">
            <span className="text-xs font-bold text-gray-600">匯入清單 ({items.length})</span>
            <button onClick={load} className="text-gray-500 hover:text-gray-800" title="重新整理">
              <RefreshCw size={14} />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto p-1 space-y-1">
            {loading && <div className="text-center py-4 text-xs text-gray-500">載入中...</div>}
            {!loading && items.length === 0 && (
              <div className="text-center py-8 text-xs text-gray-400">暫存區是空的</div>
            )}

            {items.map(item => (
              <button
                key={item.id}
                onClick={() => handleSelect(item)}
                className={`w-full text-left p-3 rounded border text-xs transition-all ${selectedId === item.id
                  ? 'bg-white border-amber-400 shadow-sm ring-1 ring-amber-400/30'
                  : 'bg-white border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                  }`}
              >
                <div className="font-medium text-gray-900 mb-1 truncate">{item.title}</div>
                <div className="flex justify-between items-center text-[10px] text-gray-500">
                  <span>{new Date(item.importedAt).toLocaleDateString()}</span>
                  <span className={`px-1.5 py-0.5 rounded-full ${item.cleanedState === 'cleaned' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'
                    }`}>
                    {item.cleanedState || 'new'}
                  </span>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Editor Column */}
        <div className="flex-1 flex flex-col border border-gray-200 rounded bg-white overflow-hidden shadow-sm">
          {!selectedId ? (
            <div className="flex-1 flex flex-col items-center justify-center text-gray-300">
              <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mb-2">
                <RefreshCw size={24} />
              </div>
              <p className="text-xs">請選擇項目以預覽或編輯</p>
            </div>
          ) : (
            <>
              {/* Toolbar */}
              <div className="h-10 border-b border-gray-200 flex items-center justify-between px-3 bg-gray-50/50">
                <span className="text-xs font-mono text-gray-400 truncate max-w-[200px]">{selectedId}</span>
                <div className="flex gap-2">
                  <button
                    onClick={handleDelete}
                    disabled={deleting}
                    className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-red-600 hover:bg-red-50 rounded transition-colors"
                  >
                    <Trash2 size={14} />
                    永久刪除
                  </button>
                  <button
                    onClick={handleSave}
                    disabled={saving}
                    className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium bg-gray-900 text-white hover:bg-gray-800 rounded shadow-sm transition-all"
                  >
                    <Save size={14} />
                    {saving ? '保存中...' : '保存變更'}
                  </button>
                </div>
              </div>

              {/* Edit Form */}
              <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {error && (
                  <div className="p-3 bg-red-50 text-red-700 text-xs rounded border border-red-100">
                    {error}
                  </div>
                )}
                {success && (
                  <div className="p-3 bg-green-50 text-green-700 text-xs rounded border border-green-100">
                    變更已保存
                  </div>
                )}

                <div className="space-y-1">
                  <label className="text-xs font-bold text-gray-700">標題</label>
                  <input
                    type="text"
                    value={form.title}
                    onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
                    className="w-full px-3 py-2 text-sm border border-gray-300 rounded focus:border-amber-500 focus:ring-1 focus:ring-amber-500 outline-none transition-all"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-gray-700">專案 (Project)</label>
                    <select
                      value={form.project || ''}
                      onChange={e => setForm(f => ({ ...f, project: e.target.value }))}
                      className="w-full px-3 py-2 text-sm border border-gray-300 rounded focus:border-amber-500 focus:ring-1 focus:ring-amber-500 outline-none transition-all bg-white"
                    >
                      <option value="">選擇專案...</option>
                      {projects.map(p => (
                        <option key={p.id} value={p.id}>
                          {p.title}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-gray-700">狀態 (Status)</label>
                    <select
                      value={form.status || ''}
                      onChange={e => setForm(f => ({ ...f, status: e.target.value }))}
                      className="w-full px-3 py-2 text-sm border border-gray-300 rounded focus:border-amber-500 focus:ring-1 focus:ring-amber-500 outline-none transition-all bg-white"
                    >
                      <option value="">選擇狀態...</option>
                      {PROJECT_STATUSES.map(s => (
                        <option key={s.value} value={s.value}>
                          {s.label} ({s.value})
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-gray-700">分類 (Category)</label>
                  <select
                    value={form.category || ''}
                    onChange={e => setForm(f => ({ ...f, category: e.target.value }))}
                    className="w-full px-3 py-2 text-sm border border-gray-300 rounded focus:border-amber-500 focus:ring-1 focus:ring-amber-500 outline-none transition-all bg-white"
                  >
                    <option value="">選擇分類...</option>
                    {CATEGORIES.map(c => (
                      <option key={c.value} value={c.value}>
                        {c.label} ({c.value})
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-gray-700">標籤 (Tags)</label>
                  <div className="border border-gray-300 rounded p-2 bg-white space-y-2">
                    {/* Selected Tags */}
                    <div className="flex flex-wrap gap-2">
                      {form.tags && form.tags.map(tag => (
                        <span key={tag} className="inline-flex items-center gap-1 px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded-full border border-gray-200">
                          {tag}
                          <button
                            onClick={() => setForm(f => ({ ...f, tags: f.tags?.filter(t => t !== tag) || [] }))}
                            className="text-gray-400 hover:text-red-500 transition-colors"
                          >
                            ×
                          </button>
                        </span>
                      ))}
                    </div>

                    {/* Add Tag Select */}
                    <select
                      value=""
                      onChange={e => {
                        const val = e.target.value;
                        if (!val) return;
                        setForm(f => {
                          if (f.tags?.includes(val)) return f;
                          return { ...f, tags: [...(f.tags || []), val] };
                        });
                      }}
                      className="w-full text-xs p-1 border-t border-gray-100 outline-none text-gray-600 focus:text-gray-900"
                    >
                      <option value="">+ 新增標籤...</option>
                      {Object.entries(TAG_GROUPS).map(([group, options]) => (
                        <optgroup key={group} label={group}>
                          {options.filter(opt => !form.tags?.includes(opt.value)).map(opt => (
                            <option key={opt.value} value={opt.value}>
                              {opt.label} ({opt.value})
                            </option>
                          ))}
                        </optgroup>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-gray-700">整理備註 (Notes)</label>
                  <textarea
                    rows={2}
                    value={form.notes}
                    onChange={e => setForm(f => ({ ...f, notes: e.target.value }))}
                    className="w-full px-3 py-2 text-xs border border-gray-300 rounded focus:border-amber-500 focus:ring-1 focus:ring-amber-500 outline-none transition-all"
                    placeholder="例如：需提取哪部分作為 Prompt..."
                  />
                </div>

                <div className="space-y-1 flex-1 flex flex-col min-h-[300px]">
                  <div className="flex justify-between items-end">
                    <label className="text-xs font-bold text-gray-700">內容 (Content)</label>
                    <div className="flex gap-1 bg-gray-100 p-0.5 rounded-lg">
                      <button
                        onClick={() => setViewMode('edit')}
                        className={`px-2 py-1 text-[10px] font-medium rounded flex items-center gap-1 transition-all ${viewMode === 'edit'
                          ? 'bg-white text-amber-600 shadow-sm'
                          : 'text-gray-500 hover:text-gray-700'
                          }`}
                      >
                        <Edit2 size={12} /> 編輯
                      </button>
                      <button
                        onClick={() => setViewMode('preview')}
                        className={`px-2 py-1 text-[10px] font-medium rounded flex items-center gap-1 transition-all ${viewMode === 'preview'
                          ? 'bg-white text-indigo-600 shadow-sm'
                          : 'text-gray-500 hover:text-gray-700'
                          }`}
                      >
                        <Eye size={12} /> 預覽
                      </button>
                    </div>
                  </div>

                  <div className="flex-1 relative border border-gray-300 rounded overflow-hidden">
                    {viewMode === 'edit' ? (
                      <textarea
                        value={form.rawContent}
                        onChange={e => setForm(f => ({ ...f, rawContent: e.target.value }))}
                        className="absolute inset-0 w-full h-full p-4 font-mono text-xs leading-relaxed focus:border-amber-500 focus:ring-1 focus:ring-amber-500 outline-none resize-none"
                      />
                    ) : (
                      <div className="absolute inset-0 w-full h-full p-6 overflow-y-auto prose prose-sm max-w-none prose-slate">
                        {/* Classification Metadata */}
                        {(form.project || form.status || form.category || (form.tags && form.tags.length > 0)) && (
                          <div className="mb-4 pb-4 border-b border-gray-100 flex flex-wrap gap-2 items-center">
                            {form.project && <span className="px-2 py-0.5 bg-blue-50 text-blue-700 text-[10px] rounded border border-blue-100 font-medium">Project: {projects.find(p => p.id === form.project)?.title || form.project}</span>}
                            {form.status && <span className="px-2 py-0.5 bg-green-50 text-green-700 text-[10px] rounded border border-green-100 font-medium">Status: {form.status}</span>}
                            {form.category && <span className="px-2 py-0.5 bg-purple-50 text-purple-700 text-[10px] rounded border border-purple-100 font-medium">Category: {form.category}</span>}
                            {form.tags && form.tags.map(tag => (
                              <span key={tag} className="px-2 py-0.5 bg-gray-100 text-gray-700 text-[10px] rounded-full border border-gray-200 font-medium">#{tag}</span>
                            ))}
                          </div>
                        )}

                        {/* Metadata Section in Preview */}
                        {(form.sourceLink || (form.suggestedTags && form.suggestedTags.length > 0)) && (
                          <div className="mb-6 pb-4 border-b border-gray-100 space-y-3">
                            {form.sourceLink && (
                              <a
                                href={form.sourceLink}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex items-center gap-2 text-xs text-indigo-600 hover:text-indigo-800 hover:underline bg-indigo-50 p-2 rounded-md transition-colors w-fit max-w-full"
                              >
                                <ExternalLink size={14} className="flex-shrink-0" />
                                <span className="truncate">{form.sourceLink}</span>
                              </a>
                            )}

                            {form.suggestedTags && form.suggestedTags.length > 0 && (
                              <div className="flex flex-wrap gap-2">
                                {form.suggestedTags.map((tag, idx) => (
                                  <span key={idx} className="flex items-center gap-1 px-2 py-1 bg-gray-100 text-gray-600 text-[10px] rounded-full font-medium">
                                    <Tag size={10} />
                                    {tag}
                                  </span>
                                ))}
                              </div>
                            )}
                          </div>
                        )}

                        <ReactMarkdown remarkPlugins={[remarkGfm]}>
                          {form.rawContent || '*無內容*'}
                        </ReactMarkdown>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

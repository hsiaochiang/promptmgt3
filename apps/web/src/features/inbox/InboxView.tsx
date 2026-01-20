import { useEffect, useState } from 'react';
import type { InboxItemEntity, ProjectEntity } from '@pah/contracts';
import { fetchInboxItems, updateInboxItem, deleteInboxItem, fetchProjects } from './api';
import { Trash2, AlertTriangle, Save, RefreshCw, ExternalLink } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { PROJECT_STATUSES, CATEGORIES, TAG_GROUPS } from './taxonomy';
import { formatDate } from '../../utils/date';

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

      if ((updated as any).promotedTo) {
        setItems(prev => prev.filter(i => i.id !== selectedId));
        setSelectedId(null);
        setSuccess(true);

        // Trigger entity-change event to refresh ProjectView prompts
        window.dispatchEvent(new CustomEvent('entity-change'));

        // Show a clearer message
        alert('已成功歸檔為專案提示詞！');
      } else {
        setItems(prev => prev.map(i => (i.id === updated.id ? updated : i)));
        setSuccess(true);
        setTimeout(() => setSuccess(false), 3000);
      }
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
    <div className="h-full flex flex-col gap-3 px-4 py-3 overflow-hidden">
      <div className="rounded-xl border border-amber-200 bg-amber-50 px-3 py-2 text-[13px] text-amber-900 flex items-start gap-2 shadow-sm">
        <AlertTriangle size={14} className="mt-0.5 flex-shrink-0" />
        <div>
          <span className="font-bold">暫存區說明：</span>
          此處顯示由外部工具（如瀏覽器擴充）擷取的原始內容。在此您可以整理標題與內容，但<strong className="text-amber-700">正式歸檔（轉為 Project/Prompt）請使用外部工具</strong>操作。
        </div>
      </div>

      <div className="flex-1 min-h-0 flex gap-3 overflow-hidden">
        {/* List Column */}
        <div className="w-[320px] min-w-[280px] flex flex-col border border-gray-200 rounded-xl bg-white shadow-sm overflow-hidden">
          <div className="px-3 py-2 border-b border-gray-200 bg-gray-50 flex items-center justify-between text-xs font-semibold text-gray-600">
            <span>匯入清單 ({items.length})</span>
            <button
              onClick={load}
              className="text-sm text-gray-500 hover:text-gray-800"
              title="重新整理"
              type="button"
            >
              <RefreshCw size={14} />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto px-2 py-1 space-y-2 custom-scrollbar">
            {loading && (
              <div className="text-center py-4 text-[12px] text-gray-500">載入中...</div>
            )}
            {!loading && items.length === 0 && (
              <div className="text-center py-8 text-[12px] text-gray-400">暫存區是空的</div>
            )}

            {items.map(item => (
              <button
                key={item.id}
                onClick={() => handleSelect(item)}
                className={`w-full text-left px-3 py-2 rounded border transition-all text-sm ${selectedId === item.id
                  ? 'bg-white border-amber-300 shadow-md ring-1 ring-amber-300/40'
                  : 'bg-white border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                  }`}
              >
                <div className="font-medium text-gray-900 leading-tight truncate">{item.title}</div>
                <div className="flex justify-between items-center text-[11px] text-gray-500 mt-1">
                  <span>{formatDate(item.importedAt)}</span>
                  <span className={`px-1.5 py-0.5 rounded-full text-[11px] ${item.cleanedState === 'cleaned' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'
                    }`}>
                    {item.cleanedState || 'new'}
                  </span>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Editor Column */}
        <div className="flex-1 flex flex-col border border-gray-200 rounded-xl bg-white shadow-sm overflow-hidden min-w-0">
          {!selectedId ? (
            <div className="flex-1 flex flex-col items-center justify-center text-gray-400 px-4">
              <div className="w-14 h-14 bg-gray-50 rounded-full flex items-center justify-center mb-2">
                <RefreshCw size={22} />
              </div>
              <p className="text-[12px]">請選擇項目以預覽或編輯</p>
            </div>
          ) : (
            <>
              {/* Toolbar */}
              <div className="border-b border-gray-200 px-4 py-2 bg-gray-50 flex items-center justify-between gap-2">
                <span className="font-mono text-[12px] text-gray-500 truncate max-w-[240px]">{selectedId}</span>
                <div className="flex gap-2 items-center text-[12px]">
                  {error && <span className="text-red-500">{error}</span>}
                  {success && <span className="text-green-600 font-medium">已儲存</span>}
                  <button
                    onClick={handleDelete}
                    disabled={deleting}
                    className="flex items-center gap-1 px-3 py-1.5 text-xs font-medium text-red-600 hover:bg-red-50 rounded transition-colors"
                    type="button"
                  >
                    <Trash2 size={14} />
                    永久刪除
                  </button>
                  <button
                    onClick={handleSave}
                    disabled={saving}
                    className="flex items-center gap-1 px-3 py-1.5 text-xs font-medium bg-gray-900 text-white hover:bg-gray-800 rounded shadow-sm transition-all"
                    type="button"
                  >
                    <Save size={14} />
                    {saving ? '保存中...' : '保存變更'}
                  </button>
                </div>
              </div>

              {/* Content Area - Notion Style */}
              <div className="flex-1 overflow-y-auto bg-white">
                {/* Header / Title Area */}
                <div className="px-6 py-6 w-full">
                  {/* Icon placeholder removed per Constitution */}
                  <div className="mb-4"></div>

                  <input
                    type="text"
                    value={form.title}
                    onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
                    className="w-full text-3xl font-semibold border-none outline-none placeholder-gray-400 py-1 bg-transparent text-gray-900"
                    placeholder="無標題"
                  />

                  {/* Properties Table */}
                  <div className="space-y-3 text-sm text-gray-600">
                    {/* Project Field */}
                    <div className="flex items-center gap-3">
                      <div className="w-32 flex items-center text-gray-500 gap-2">
                        <span className="opacity-70">📂</span>
                        <span>專案</span>
                      </div>
                      <div className="flex-1">
                        <select
                          value={form.project || ''}
                          onChange={e => setForm(f => ({ ...f, project: e.target.value }))}
                          className="bg-transparent hover:bg-gray-100 px-2 py-1 rounded w-full max-w-xs outline-none cursor-pointer border border-transparent hover:border-gray-200 transition-all text-gray-900"
                        >
                          <option value="" className="text-gray-400">選擇專案...</option>
                          {projects.map(p => (
                            <option key={p.id} value={p.id}>
                              {p.title}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>

                    {/* Status Field */}
                    <div className="flex items-center gap-3">
                      <div className="w-32 flex items-center text-gray-500 gap-2">
                        <span className="opacity-70">📊</span>
                        <span>狀態</span>
                      </div>
                      <div className="flex-1">
                        <select
                          value={form.status || ''}
                          onChange={e => setForm(f => ({ ...f, status: e.target.value }))}
                          className={`bg-transparent hover:bg-gray-100 px-2 py-1 rounded w-full max-w-xs outline-none cursor-pointer border border-transparent hover:border-gray-200 transition-all ${form.status ? 'text-gray-900' : 'text-gray-400'
                            }`}
                        >
                          <option value="">Empty</option>
                          {PROJECT_STATUSES.map(s => (
                            <option key={s.value} value={s.value}>
                              {s.label}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>

                    {/* Category Field */}
                    <div className="flex items-center gap-3">
                      <div className="w-32 flex items-center text-gray-500 gap-2">
                        <span className="opacity-70">🏷️</span>
                        <span>分類</span>
                      </div>
                      <div className="flex-1">
                        <select
                          value={form.category || ''}
                          onChange={e => setForm(f => ({ ...f, category: e.target.value }))}
                          className={`bg-transparent hover:bg-gray-100 px-2 py-1 rounded w-full max-w-xs outline-none cursor-pointer border border-transparent hover:border-gray-200 transition-all ${form.category ? 'text-gray-900' : 'text-gray-400'
                            }`}
                        >
                          <option value="">Empty</option>
                          {CATEGORIES.map(c => (
                            <option key={c.value} value={c.value}>
                              {c.label}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>

                    {/* Tags Field */}
                    <div className="flex items-start gap-3">
                      <div className="w-32 flex items-center text-gray-500 gap-2 mt-1">
                        <span className="opacity-70">#</span>
                        <span>標籤</span>
                      </div>
                      <div className="flex-1 flex flex-wrap gap-2 items-center">
                        {form.tags && form.tags.map(tag => (
                          <span key={tag} className="inline-flex items-center gap-1 px-2 py-0.5 bg-gray-100 text-gray-700 text-xs rounded hover:bg-gray-200 transition-colors cursor-default">
                            {tag}
                            <button
                              onClick={() => setForm(f => ({ ...f, tags: f.tags?.filter(t => t !== tag) || [] }))}
                              className="text-gray-400 hover:text-red-500 ml-1"
                            >
                              ×
                            </button>
                          </span>
                        ))}
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
                          className="text-xs text-gray-400 hover:text-gray-600 bg-transparent outline-none cursor-pointer hover:bg-gray-50 px-1 py-0.5 rounded"
                        >
                          <option value="">+ Add tag</option>
                          {Object.entries(TAG_GROUPS).map(([group, options]) => (
                            <optgroup key={group} label={group}>
                              {options.filter(opt => !form.tags?.includes(opt.value)).map(opt => (
                                <option key={opt.value} value={opt.value}>
                                  {opt.label}
                                </option>
                              ))}
                            </optgroup>
                          ))}
                        </select>
                      </div>
                    </div>

                    {/* Source Link */}
                    <div className="flex items-center gap-3">
                      <div className="w-32 flex items-center text-gray-500 gap-2">
                        <span className="opacity-70">🔗</span>
                        <span>連結</span>
                      </div>
                      <div className="flex-1 truncate">
                        {form.sourceLink ? (
                          <a
                            href={form.sourceLink}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-indigo-600 hover:underline flex items-center gap-1 text-xs truncate max-w-md bg-indigo-50 px-2 py-0.5 rounded w-fit"
                          >
                            <ExternalLink size={12} />
                            {form.sourceLink}
                          </a>
                        ) : (
                          <span className="text-gray-300 italic text-xs">Empty</span>
                        )}
                      </div>
                    </div>

                    {/* Notes */}
                    <div className="flex items-start gap-3">
                      <div className="w-32 flex items-center text-gray-500 gap-2 mt-1">
                        <span className="opacity-70">📝</span>
                        <span>備註</span>
                      </div>
                      <div className="flex-1">
                        <textarea
                          rows={2}
                          value={form.notes}
                          onChange={e => setForm(f => ({ ...f, notes: e.target.value }))}
                          className="w-full bg-transparent px-2 py-1 rounded border border-gray-200 text-sm text-gray-900 resize-none focus:border-blue-300 focus:outline-none transition-colors"
                          placeholder="Empty"
                          onInput={(e) => {
                            const target = e.target as HTMLTextAreaElement;
                            target.style.height = 'auto';
                            target.style.height = target.scrollHeight + 'px';
                          }}
                        />
                      </div>
                    </div>
                  </div>

                  {/* Divider */}
                  <div className="border-t border-gray-200 my-6"></div>

                  {/* Content Section */}
                  {viewMode === 'edit' ? (
                    <textarea
                      value={form.rawContent}
                      onChange={e => setForm(f => ({ ...f, rawContent: e.target.value }))}
                      className="w-full min-h-[360px] font-mono text-sm leading-relaxed outline-none resize-none text-gray-800 bg-gray-50 border border-gray-100 px-3 py-3 rounded-lg focus:border-blue-300"
                      placeholder="輸入內容..."
                    />
                  ) : (
                    <div className="prose prose-sm max-w-none prose-slate">
                      <ReactMarkdown
                        remarkPlugins={[remarkGfm]}
                        components={{
                          h1: ({ node, ...props }) => <h1 className="text-2xl font-bold mt-8 mb-4 border-b pb-2" {...props} />,
                          h2: ({ node, ...props }) => {
                            // Custom styling for User/AI headers
                            const text = String(props.children);
                            if (text.includes('User')) {
                              return <div className="flex items-center gap-2 mt-8 mb-4 text-blue-800 bg-blue-50 p-2 rounded-lg w-fit"><span className="text-xl">🧑‍💻</span><h2 className="text-lg font-bold m-0" {...props} /></div>;
                            }
                            if (text.includes('AI') || text.includes('ChatGPT') || text.includes('Claude')) {
                              return <div className="flex items-center gap-2 mt-8 mb-4 text-purple-800 bg-purple-50 p-2 rounded-lg w-fit"><span className="text-xl">🤖</span><h2 className="text-lg font-bold m-0" {...props} /></div>;
                            }
                            return <h2 className="text-xl font-bold mt-6 mb-3" {...props} />;
                          },
                          p: ({ node, ...props }) => <p className="leading-7 mb-4 text-gray-800" {...props} />,
                          code: ({ inline, className, children, ...props }: any) => {
                            return inline
                              ? <code className="bg-gray-100 text-red-500 px-1 py-0.5 rounded text-sm font-mono" {...props}>{children}</code>
                              : <code className="block bg-gray-50 p-4 rounded-lg text-sm font-mono my-4 border border-gray-100 overflow-x-auto" {...props}>{children}</code>;
                          }
                        }}
                      >
                        {form.rawContent || '*無內容*'}
                      </ReactMarkdown>
                    </div>
                  )}
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

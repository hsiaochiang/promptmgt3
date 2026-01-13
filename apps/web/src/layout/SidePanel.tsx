import { useState, useEffect, useCallback } from 'react';
import { Maximize2, Minimize2, ChevronRight, Save, Trash2, Folder, Link as LinkIcon, Calendar } from 'lucide-react';
import { useUiStore } from '../state/uiStore';
import { getProject, getPrompt, updateProject, updatePrompt, deleteProject, deletePrompt, getProjects } from '../features/library/api';
import { ProjectEntity, PromptEntity } from '@pah/contracts';
import { MarkdownEditor } from '../components/MarkdownEditor';
import { HistoryView } from '../features/history/HistoryView';
import { PROJECT_STATUSES, CATEGORIES, TAG_GROUPS } from '../features/inbox/taxonomy';
import { formatDate } from '../utils/date';

type EntityData = (ProjectEntity | PromptEntity) & { type: 'project' | 'prompt' };

export function SidePanel() {
  const { selectedItem, closePanel } = useUiStore();
  const [isExpanded, setIsExpanded] = useState(false);
  const [data, setData] = useState<EntityData | null>(null);
  const [allProjects, setAllProjects] = useState<ProjectEntity[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Local edit state
  const [editTitle, setEditTitle] = useState('');
  const [editBody, setEditBody] = useState('');
  const [editStatus, setEditStatus] = useState('');
  const [editTags, setEditTags] = useState<string[]>([]);
  // Use `any` for flexible metadata storage that both Project/Prompt support
  const [editCategory, setEditCategory] = useState('');
  const [editLink, setEditLink] = useState('');

  // Derived state
  const [projectId, setProjectId] = useState<string>('');

  const [activeTab, setActiveTab] = useState<'editor' | 'history'>('editor');

  const loadData = useCallback(async () => {
    if (!selectedItem) {
      setData(null);
      return;
    }

    setIsLoading(true);
    setError(null);
    try {
      let result: any;
      if (selectedItem.type === 'project') {
        result = await getProject(selectedItem.id);
        result.type = 'project';
      } else if (selectedItem.type === 'prompt') {
        result = await getPrompt(selectedItem.id);
        result.type = 'prompt';
        setEditCategory(result.category || '');
        setEditLink(result.link || '');

        // Fetch project name
        if (result.projectId) {
          setProjectId(result.projectId);
        } else {
          setProjectId('');
        }
      }

      setData(result);
      setEditTitle(result.title);
      setEditBody(result.body || '');
      setEditStatus(result.status || '');
      setEditTags(result.tags || []);
      // Should we load link/category for project too? Assuming prompt only for now based on req.
      if (selectedItem.type === 'project') {
        setEditLink(result.link || '');
        setEditCategory(result.category || '');
      }

    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Failed to load data');
    } finally {
      setIsLoading(false);
    }
  }, [selectedItem]);

  useEffect(() => {
    loadData();
    // Load projects for dropdown
    getProjects().then(setAllProjects).catch(console.error);
  }, [loadData]);

  const handleSave = async (overrides: Partial<{ title: string; body: string; status: string; tags: string[]; category: string; link: string; projectId: string }> = {}) => {
    if (!selectedItem || !data) return;

    setIsSaving(true);
    try {
      const payload: any = {
        title: overrides.title ?? editTitle,
        body: overrides.body ?? editBody,
        status: overrides.status ?? editStatus,
        tags: overrides.tags ?? editTags,
        link: overrides.link ?? editLink,
      };

      if (selectedItem.type === 'prompt') {
        payload.category = overrides.category ?? editCategory;
        payload.projectId = overrides.projectId ?? projectId;
      }

      if (selectedItem.type === 'project') {
        await updateProject(selectedItem.id, payload);
      } else {
        await updatePrompt(selectedItem.id, payload);
      }

      // Update local data partially to reflect change immediately in UI if needed, 
      // but reloading is safer for consistency.
      await loadData();

      // Notify other views
      window.dispatchEvent(new CustomEvent('entity-change'));
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Failed to save');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!selectedItem || !confirm('Are you sure you want to move this to trash?')) return;
    try {
      if (selectedItem.type === 'project') {
        await deleteProject(selectedItem.id);
      } else {
        await deletePrompt(selectedItem.id);
      }
      closePanel();
      window.dispatchEvent(new CustomEvent('entity-change'));
    } catch (err: any) {
      setError(err.message);
    }
  };

  // Helper to format date only
  const formatDateOnly = (d?: string) => {
    if (!d) return '-';
    try {
      return new Date(d).toISOString().split('T')[0];
    } catch {
      return d;
    }
  };

  if (!selectedItem) return null;

  return (
    <div
      className={`absolute top-0 right-0 h-full bg-white shadow-2xl z-50 flex flex-col transform transition-all duration-300 animate-slide-in-right ${isExpanded ? 'w-full' : 'w-[600px]'
        }`}
    >
      {/* Top Bar */}
      <div className="h-12 flex items-center justify-between px-4 hover:bg-transparent border-b border-gray-100">
        {/* Breadcrumbs / Title info */}
        <div className="flex items-center gap-2 text-sm text-gray-400 transition-colors">
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="p-1 hover:bg-gray-100 hover:text-gray-600 rounded text-gray-400 transition-colors"
            title={isExpanded ? '還原' : '展開為全頁'}
          >
            {isExpanded ? <Minimize2 size={14} /> : <Maximize2 size={14} className="rotate-45" />}
          </button>

          <div className="flex items-center gap-2 cursor-default">
            <span className="hover:text-gray-900 cursor-pointer">
              {data?.type === 'project' ? '專案' : '提示詞'}
            </span>
            {data && (
              <>
                <span>/</span>
                <span className="truncate max-w-[200px] text-gray-800 font-medium">
                  {data.title}
                </span>
              </>
            )}
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-1">
          <button
            onClick={handleDelete}
            className="p-1.5 hover:bg-red-50 hover:text-red-600 rounded text-gray-400 transition-colors"
            title="Move to Trash"
          >
            <Trash2 size={18} />
          </button>
          <button onClick={closePanel} className="p-1.5 hover:bg-gray-100 rounded text-gray-500 transition-colors">
            <ChevronRight size={20} />
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-gray-100 px-4 gap-4 text-xs font-medium bg-gray-50/50">
        <button
          onClick={() => setActiveTab('editor')}
          className={`py-2 px-1 border-b-2 transition-colors ${activeTab === 'editor' ? 'border-blue-500 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700'}`}
        >
          {data?.type === 'project' ? '專案詳情' : '提示詞詳情'}
        </button>
        <button
          onClick={() => setActiveTab('history')}
          className={`py-2 px-1 border-b-2 transition-colors ${activeTab === 'history' ? 'border-blue-500 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700'}`}
        >
          歷史記錄
        </button>
      </div>

      {/* Content Area */}
      <div className="flex-1 overflow-y-auto px-12 py-8 custom-scrollbar relative bg-white">
        {isLoading && (
          <div className="absolute inset-0 flex items-center justify-center bg-white/80 z-10">
            <div className="text-gray-400">Loading...</div>
          </div>
        )}

        {error && (
          <div className="mb-4 p-4 bg-red-50 text-red-600 rounded">
            {error}
          </div>
        )}

        {activeTab === 'history' ? (
          <HistoryView />
        ) : (
          data && (
            <div className={`mx-auto ${isExpanded ? 'max-w-4xl' : ''}`}>
              {/* Constitutional Title Area (No Large Icon) */}
              <div className="mb-6">
                <input
                  type="text"
                  value={editTitle}
                  onChange={(e) => setEditTitle(e.target.value)}
                  className="w-full text-4xl font-bold text-gray-900 placeholder-gray-300 border-none focus:ring-0 focus:outline-none p-0 bg-transparent leading-tight mb-2"
                  placeholder="Untitled"
                  onBlur={() => handleSave()}
                />
              </div>

              {/* Constitutional Properties Table */}
              <div className="mt-6 mb-8 space-y-1 text-sm text-gray-600">
                {/* Status Field */}
                <div className="flex items-center h-8 group">
                  <div className="w-32 flex items-center text-gray-500 gap-2 select-none">
                    <span className="opacity-70 flex items-center justify-center w-4">📊</span>
                    <span>狀態</span>
                  </div>
                  <div className="flex-1 flex items-center">
                    <select
                      value={editStatus}
                      onChange={e => {
                        const val = e.target.value;
                        setEditStatus(val);
                        handleSave({ status: val });
                      }}
                      className={`h-full w-full max-w-xs bg-transparent hover:bg-gray-100 px-2 rounded outline-none cursor-pointer border border-transparent hover:border-gray-200 transition-all ${editStatus ? 'text-gray-900' : 'text-gray-400'} appearance-none`}
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

                {/* Project Field (New) - Dropdown */}
                {selectedItem.type === 'prompt' && (
                  <div className="flex items-center h-8 group">
                    <div className="w-32 flex items-center text-gray-500 gap-2 select-none">
                      <span className="opacity-70 flex items-center justify-center w-4"><Folder size={14} /></span>
                      <span>專案</span>
                    </div>
                    <div className="flex-1 flex items-center">
                      <select
                        value={projectId}
                        onChange={e => {
                          const val = e.target.value;
                          setProjectId(val);
                          handleSave({ projectId: val });
                        }}
                        className={`h-full w-full max-w-xs bg-transparent hover:bg-gray-100 px-2 rounded outline-none cursor-pointer border border-transparent hover:border-gray-200 transition-all ${projectId ? 'text-gray-900' : 'text-gray-400'} appearance-none`}
                      >
                        <option value="">No Project</option>
                        {allProjects.map(p => (
                          <option key={p.id} value={p.id}>
                            {p.title}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                )}

                {/* Category Field */}
                {selectedItem.type === 'prompt' && (
                  <div className="flex items-center h-8 group">
                    <div className="w-32 flex items-center text-gray-500 gap-2 select-none">
                      <span className="opacity-70 flex items-center justify-center w-4">🏷️</span>
                      <span>分類</span>
                    </div>
                    <div className="flex-1 flex items-center">
                      <select
                        value={editCategory}
                        onChange={e => {
                          const val = e.target.value;
                          setEditCategory(val);
                          handleSave({ category: val });
                        }}
                        className={`h-full w-full max-w-xs bg-transparent hover:bg-gray-100 px-2 rounded outline-none cursor-pointer border border-transparent hover:border-gray-200 transition-all ${editCategory ? 'text-gray-900' : 'text-gray-400'} appearance-none`}
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
                )}

                {/* Link Field (New) */}
                <div className="flex items-center h-8 group">
                  <div className="w-32 flex items-center text-gray-500 gap-2 select-none">
                    <span className="opacity-70 flex items-center justify-center w-4"><LinkIcon size={14} /></span>
                    <span>連結</span>
                  </div>
                  <div className="flex-1 flex items-center">
                    <input
                      type="text"
                      value={editLink}
                      onChange={e => setEditLink(e.target.value)}
                      onBlur={(e) => handleSave({ link: e.target.value })}
                      placeholder="https://..."
                      className="h-full w-full max-w-md bg-transparent hover:bg-gray-100 px-2 rounded outline-none border border-transparent hover:border-gray-200 transition-all text-gray-900 placeholder-gray-300 truncate"
                    />
                  </div>
                </div>

                {/* Tags Field */}
                <div className="flex items-start py-1 group min-h-[32px]">
                  <div className="w-32 flex items-center text-gray-500 gap-2 mt-1 select-none">
                    <span className="opacity-70 flex items-center justify-center w-4">#</span>
                    <span>標籤</span>
                  </div>
                  <div className="flex-1 flex flex-wrap gap-2 items-center">
                    {editTags && editTags.map(tag => (
                      <span key={tag} className="inline-flex items-center gap-1 px-2 py-0.5 bg-gray-100 text-gray-700 text-xs rounded hover:bg-gray-200 transition-colors cursor-default">
                        {tag}
                        <button
                          onClick={() => {
                            const newTags = editTags.filter(t => t !== tag);
                            setEditTags(newTags);
                            handleSave({ tags: newTags });
                          }}
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
                        if (editTags.includes(val)) return;
                        const newTags = [...editTags, val];
                        setEditTags(newTags);
                        handleSave({ tags: newTags });
                      }}
                      className="text-xs text-gray-400 hover:text-gray-600 bg-transparent outline-none cursor-pointer hover:bg-gray-50 px-1 py-0.5 rounded"
                    >
                      <option value="">+ Add tag</option>
                      {Object.entries(TAG_GROUPS).map(([group, options]) => (
                        <optgroup key={group} label={group}>
                          {options.filter(opt => !editTags.includes(opt.value)).map(opt => (
                            <option key={opt.value} value={opt.value}>
                              {opt.label}
                            </option>
                          ))}
                        </optgroup>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Updated Time Field (New) */}
                <div className="flex items-center h-8 group">
                  <div className="w-32 flex items-center text-gray-500 gap-2 select-none">
                    <span className="opacity-70 flex items-center justify-center w-4"><Calendar size={14} /></span>
                    <span>更新時間</span>
                  </div>
                  <div className="flex-1 px-2 text-gray-500 font-mono text-xs">
                    {formatDateOnly(data.updatedAt)}
                  </div>
                </div>

              </div>

              <hr className="border-gray-100 mb-8" />

              {/* Editor */}
              <div className="h-full flex flex-col">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-sm font-bold text-gray-900">內容編輯</h3>
                  <button
                    onClick={() => handleSave()}
                    disabled={isSaving}
                    className={`text-xs flex items-center gap-1 px-2 py-1 rounded transition-colors ${isSaving ? 'text-gray-400' : 'text-blue-600 hover:bg-blue-50'
                      }`}
                  >
                    <Save size={12} /> {isSaving ? 'Saving...' : 'Save'}
                  </button>
                </div>
                <div className="flex-1 min-h-[500px]">
                  <MarkdownEditor
                    value={editBody}
                    onChange={(val) => {
                      setEditBody(val);
                      // Auto save is handled by onBlur in textarea previously. 
                      // MarkdownEditor doesn't have onBlur prop exposed simply here, 
                      // so we might want to add a debounce or a manual save button (which we have).
                      // For now, reliance on the manual 'Save' button or navigating away is safer than debouncing blindly.
                      // Or we could implement a debounced save here.
                    }}
                    entityType={selectedItem.type === 'project' ? 'project' : 'prompt'}
                    entityId={selectedItem.id}
                    height="600px"
                  />
                </div>
              </div>

            </div>
          )
        )}
      </div>
    </div>
  );
}
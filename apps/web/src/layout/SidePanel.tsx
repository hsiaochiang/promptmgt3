import { useState, useEffect, useCallback } from 'react';
import {
  Maximize2,
  Minimize2,
  ChevronRight,
  Save,
  Trash2,
  Folder,
  Link as LinkIcon,
  Calendar,
  CheckCircle,
  Tag,
  Hash,
} from 'lucide-react';
import { useUiStore } from '../state/uiStore';
import { getProject, getPrompt, updateProject, updatePrompt, deleteProject, deletePrompt, getProjects } from '../features/library/api';
import { ProjectEntity, PromptEntity } from '@pah/contracts';
import { MarkdownEditor } from '../components/MarkdownEditor';
import { HistoryView } from '../features/history/HistoryView';
import { PROJECT_STATUSES, CATEGORIES, TAG_GROUPS } from '../features/inbox/taxonomy';
import { ConfirmDialog } from '../components/ConfirmDialog';

type EntityData = (ProjectEntity | PromptEntity) & { type: 'project' | 'prompt' };

export function SidePanel() {
  const { selectedItem, closePanel } = useUiStore();
  const [isExpanded, setIsExpanded] = useState(false);
  const [data, setData] = useState<EntityData | null>(null);
  const [allProjects, setAllProjects] = useState<ProjectEntity[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // 本地編輯狀態
  const [editTitle, setEditTitle] = useState('');
  const [editBody, setEditBody] = useState('');
  const [editStatus, setEditStatus] = useState('');
  const [editTags, setEditTags] = useState<string[]>([]);
  // 使用 `any` 以支援 Project/Prompt 共用的彈性欄位
  const [editCategory, setEditCategory] = useState('');
  const [editLink, setEditLink] = useState('');

  // 衍生狀態
  const [projectId, setProjectId] = useState<string>('');

  const [activeTab, setActiveTab] = useState<'editor' | 'history'>('editor');

  // 刪除確認對話框狀態
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

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

        // 讀取所屬專案
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
      // 初始化 project / prompt 共用欄位（分類、連結）
      setEditCategory(result.category || '');
      setEditLink(result.link || '');

    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Failed to load data');
    } finally {
      setIsLoading(false);
    }
  }, [selectedItem]);

  useEffect(() => {
    loadData();
    // 讀取下拉選單用專案清單
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
        category: overrides.category ?? editCategory,
      };

      if (selectedItem.type === 'prompt') {
        payload.projectId = overrides.projectId ?? projectId;
      }

      if (selectedItem.type === 'project') {
        await updateProject(selectedItem.id, payload);
      } else {
        await updatePrompt(selectedItem.id, payload);
      }

      // 可做局部更新讓 UI 立即反映，但為了資料一致性，重新載入更安全。
      await loadData();

      // 通知其他視圖更新
      window.dispatchEvent(new CustomEvent('entity-change'));
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Failed to save');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteClick = () => {
    if (!selectedItem) return;
    setShowDeleteConfirm(true);
  };

  const handleDeleteConfirm = async () => {
    if (!selectedItem) return;
    setShowDeleteConfirm(false);
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

  // 僅顯示日期（YYYY-MM-DD）
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
      <div className="h-10 flex items-center justify-between px-3 hover:bg-transparent border-b border-gray-100">
        {/* Breadcrumbs / Title info */}
        <div className="flex items-center gap-2 text-base text-gray-400 transition-colors">
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="p-1 hover:bg-gray-100 hover:text-gray-600 rounded text-gray-400 transition-colors"
            title={isExpanded ? '還原' : '展開為全頁'}
          >
            {isExpanded ? <Minimize2 size={16} /> : <Maximize2 size={16} className="rotate-45" />}
          </button>

          <div className="flex items-center gap-2 cursor-default">
            <span className="hover:text-gray-900">
              {data?.type === 'project' ? '專案' : '提示詞'}
            </span>
            {data && (
              <>
                <span>/</span>
                <span className="truncate max-w-[280px] text-gray-800 font-medium">
                  {data.title}
                </span>
              </>
            )}
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-1">
          <button
            onClick={handleDeleteClick}
            className="p-1.5 hover:bg-red-50 hover:text-red-600 rounded text-gray-400 transition-colors"
            title="移至回收站"
          >
            <Trash2 size={18} />
          </button>
          <button onClick={closePanel} className="p-1.5 hover:bg-gray-100 rounded text-gray-500 transition-colors">
            <ChevronRight size={20} />
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-gray-100 px-3 gap-4 text-base font-medium bg-gray-50/50">
        <button
          onClick={() => setActiveTab('editor')}
          className={`py-1.5 px-1 border-b-2 transition-colors ${activeTab === 'editor' ? 'border-blue-500 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700'}`}
        >
          {data?.type === 'project' ? '專案詳情' : '提示詞詳情'}
        </button>
        <button
          onClick={() => setActiveTab('history')}
          className={`py-1.5 px-1 border-b-2 transition-colors ${activeTab === 'history' ? 'border-blue-500 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700'}`}
        >
          歷史記錄
        </button>
      </div>

      {/* Content Area */}
      <div className="flex-1 overflow-y-auto px-12 py-8 custom-scrollbar relative bg-white">
        {isLoading && (
          <div className="absolute inset-0 flex items-center justify-center bg-white/80 z-10">
            <div className="text-gray-400">載入中…</div>
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
                  className={`w-full ${isExpanded ? 'text-2xl' : 'text-xl'} font-bold text-gray-900 placeholder-gray-300 border-none focus:ring-0 focus:outline-none p-0 bg-transparent leading-tight tracking-tight mb-2`}
                  placeholder="未命名"
                  onBlur={() => handleSave()}
                />
              </div>

              {/* Constitutional Properties Table */}
              <div className="mt-6 mb-8 space-y-1 text-base text-gray-600">
                {/* Status Field */}
                <div className="flex items-center h-8 group">
                  <div className="w-32 flex items-center text-gray-500 gap-2 select-none text-base">
                    <span className="opacity-70 flex items-center justify-center w-4">
                      <CheckCircle size={14} className="text-gray-400" />
                    </span>
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
                      className={`h-full w-full max-w-xs bg-transparent hover:bg-gray-100 px-2 rounded outline-none cursor-pointer border border-transparent hover:border-gray-200 transition-all text-base ${editStatus ? 'text-gray-900' : 'text-gray-400'} appearance-none`}
                    >
                      <option value="">未設定</option>
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
                    <div className="w-32 flex items-center text-gray-500 gap-2 select-none text-base">
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
                        className={`h-full w-full max-w-xs bg-transparent hover:bg-gray-100 px-2 rounded outline-none cursor-pointer border border-transparent hover:border-gray-200 transition-all text-base ${projectId ? 'text-gray-900' : 'text-gray-400'} appearance-none`}
                      >
                        <option value="">未指定</option>
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
                    <div className="w-32 flex items-center text-gray-500 gap-2 select-none text-base">
                      <span className="opacity-70 flex items-center justify-center w-4">
                        <Tag size={14} className="text-gray-400" />
                      </span>
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
                        className={`h-full w-full max-w-xs bg-transparent hover:bg-gray-100 px-2 rounded outline-none cursor-pointer border border-transparent hover:border-gray-200 transition-all text-base ${editCategory ? 'text-gray-900' : 'text-gray-400'} appearance-none`}
                      >
                        <option value="">未設定</option>
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
                  <div className="w-32 flex items-center text-gray-500 gap-2 select-none text-base">
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
                      className="h-full w-full max-w-md bg-transparent hover:bg-gray-100 px-2 rounded outline-none border border-transparent hover:border-gray-200 transition-all text-base text-gray-900 placeholder-gray-300 truncate"
                    />
                  </div>
                </div>

                {/* Tags Field */}
                <div className="flex items-start py-1 group min-h-[32px]">
                  <div className="w-32 flex items-center text-gray-500 gap-2 mt-1 select-none text-base">
                    <span className="opacity-70 flex items-center justify-center w-4">
                      <Hash size={14} className="text-gray-400" />
                    </span>
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
                      className="text-base text-gray-400 hover:text-gray-600 bg-transparent outline-none cursor-pointer hover:bg-gray-50 px-1 py-0.5 rounded"
                    >
                      <option value="">+ 新增標籤</option>
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
                  <div className="w-32 flex items-center text-gray-500 gap-2 select-none text-base">
                    <span className="opacity-70 flex items-center justify-center w-4"><Calendar size={14} /></span>
                    <span>更新時間</span>
                  </div>
                  <div className="flex-1 px-2 text-gray-500 font-mono text-base">
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
                    <Save size={12} /> {isSaving ? '儲存中…' : '儲存'}
                  </button>
                </div>
                <div className="flex-1 min-h-[500px]">
                  <MarkdownEditor
                    value={editBody}
                    onChange={(val) => {
                      setEditBody(val);
                      // 過去使用 textarea 的 onBlur 觸發自動儲存；MarkdownEditor 目前未直接提供 onBlur。
                      // 目前先依賴手動「儲存」按鈕或離開頁面再觸發保存，較不容易產生過度頻繁的請求。
                      // 後續如需要可再加入 debounce 自動儲存。
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

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        isOpen={showDeleteConfirm}
        title="確認刪除"
        message={`確定要將「${data?.title || '此項目'}」移至回收站嗎？`}
        confirmText="確認刪除"
        cancelText="取消"
        variant="danger"
        onConfirm={handleDeleteConfirm}
        onCancel={() => setShowDeleteConfirm(false)}
      />
    </div>
  );
}

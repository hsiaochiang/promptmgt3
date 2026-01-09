import { useState, useEffect, useCallback } from 'react';
import { Maximize2, Minimize2, ChevronRight, Save, Trash2 } from 'lucide-react';
import { useUiStore } from '../state/uiStore';
import { getProject, getPrompt, updateProject, updatePrompt, deleteProject, deletePrompt } from '../features/library/api';
import { ProjectEntity, PromptEntity } from '@pah/contracts';

type EntityData = (ProjectEntity | PromptEntity) & { type: 'project' | 'prompt' };

export function SidePanel() {
  const { selectedItem, closePanel } = useUiStore();
  const [isExpanded, setIsExpanded] = useState(false);
  const [data, setData] = useState<EntityData | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Local edit state
  const [editTitle, setEditTitle] = useState('');
  const [editBody, setEditBody] = useState('');

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
      }

      setData(result);
      setEditTitle(result.title);
      setEditBody(result.body || '');
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Failed to load data');
    } finally {
      setIsLoading(false);
    }
  }, [selectedItem]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleSave = async () => {
    if (!selectedItem || !data) return;

    setIsSaving(true);
    try {
      if (selectedItem.type === 'project') {
        await updateProject(selectedItem.id, { title: editTitle, body: editBody });
      } else {
        await updatePrompt(selectedItem.id, { title: editTitle, body: editBody });
      }
      // Refresh local data to confirm sync (optional, or just update local state)
      await loadData();
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Failed to save');
    } finally {
      setIsSaving(false);
    }
  };

  // Auto-save debounce effect could go here, for now manual save or blur-based save can be added. 
  // Let's implement simple Ctrl+S or manual button for now to keep it safe.

  const handleDelete = async () => {
    if (!selectedItem || !confirm('Are you sure you want to move this to trash?')) return;
    try {
      if (selectedItem.type === 'project') {
        await deleteProject(selectedItem.id);
      } else {
        await deletePrompt(selectedItem.id);
      }
      closePanel();
      // Ideally trigger a refresh list event here
      window.dispatchEvent(new CustomEvent('entity-change'));
    } catch (err: any) {
      setError(err.message);
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

      {/* Content Area */}
      <div className="flex-1 overflow-y-auto px-12 py-8 custom-scrollbar relative">
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

        {data && (
          <div className={`mx-auto ${isExpanded ? 'max-w-4xl' : ''}`}>
            {/* Title */}
            <div className="mb-6">
              <input
                type="text"
                value={editTitle}
                onChange={(e) => setEditTitle(e.target.value)}
                className="w-full text-4xl font-bold text-gray-900 placeholder-gray-300 border-none focus:ring-0 focus:outline-none p-0 bg-transparent leading-tight mb-2"
                placeholder="Untitled"
              />
            </div>

            <hr className="border-gray-100 mb-8" />

            {/* Editor */}
            <div className="h-full flex flex-col">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-sm font-bold text-gray-900">內容編輯</h3>
                <button
                  onClick={handleSave}
                  disabled={isSaving}
                  className={`text-xs flex items-center gap-1 px-2 py-1 rounded transition-colors ${isSaving ? 'text-gray-400' : 'text-blue-600 hover:bg-blue-50'
                    }`}
                >
                  <Save size={12} /> {isSaving ? 'Saving...' : 'Save'}
                </button>
              </div>
              <textarea
                value={editBody}
                onChange={(e) => setEditBody(e.target.value)}
                className="w-full min-h-[400px] bg-transparent border-none focus:ring-0 font-mono text-sm leading-relaxed text-gray-700 resize-none p-0 placeholder-gray-300"
                placeholder="# 開始撰寫..."
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
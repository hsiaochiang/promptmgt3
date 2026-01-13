import { useState, useEffect, useCallback } from 'react';
import { FileText, Folder, Trash2 } from 'lucide-react';
import { useUiStore } from '../state/uiStore';
import { getPrompts, getProjects, deletePrompt } from '../features/library/api';
import { PromptEntity } from '@pah/contracts';


export function PromptView() {
  const { promptSubView, searchQuery } = useUiStore();
  const [prompts, setPrompts] = useState<PromptEntity[]>([]);
  const [projectMap, setProjectMap] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Selection state
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

  const fetchData = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const [promptsData, projectsData] = await Promise.all([
        getPrompts(),
        getProjects()
      ]);
      setPrompts(promptsData);

      const map: Record<string, string> = {};
      projectsData.forEach(p => {
        map[p.id] = p.title;
      });
      setProjectMap(map);
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Failed to fetch data');
    } finally {
      setIsLoading(false);
    }
  }, []);

  const filteredPrompts = prompts.filter(p => {
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    const projectName = projectMap[p.projectId]?.toLowerCase() || '';
    return (
      p.title.toLowerCase().includes(q) ||
      p.tags.some(t => t.toLowerCase().includes(q)) ||
      projectName.includes(q)
    );
  });

  // Handle delete
  const handleDelete = async () => {
    if (selectedIds.size === 0) return;
    if (!confirm(`Are you sure you want to delete ${selectedIds.size} items?`)) return;

    try {
      await Promise.all(Array.from(selectedIds).map(id => deletePrompt(id)));
      setSelectedIds(new Set()); // Clear selection
      // CRITICAL: Refresh list to remove deleted items
      fetchData();
    } catch (err) {
      console.error('Delete failed', err);
      alert('Failed to delete some items');
    }
  };

  useEffect(() => {
    fetchData();

    // Listen for entity changes
    const handleEntityChange = () => fetchData();
    window.addEventListener('entity-change', handleEntityChange);
    return () => window.removeEventListener('entity-change', handleEntityChange);
  }, [fetchData]);

  if (isLoading && prompts.length === 0) {
    return <div className="p-8 text-gray-400">Loading prompts...</div>;
  }

  if (error) {
    return <div className="p-8 text-red-500">Error: {error}</div>;
  }

  return (
    <div className="h-full flex flex-col">
      <div className="flex-none px-4 py-2 flex justify-between items-center bg-white border-b border-gray-100 min-h-[50px]">
        <div className="flex items-center gap-4">
          <h2 className="text-sm font-semibold text-gray-700">All Prompts</h2>
          {selectedIds.size > 0 && (
            <button
              onClick={handleDelete}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-red-50 text-red-600 rounded hover:bg-red-100 text-xs font-medium transition-colors"
              title="Move to Trash"
            >
              <Trash2 size={14} />
              Delete ({selectedIds.size})
            </button>
          )}
        </div>
        {/* Creation handled in Project context */}
      </div>

      <div className="flex-1 overflow-hidden">
        {promptSubView === 'board' ? (
          <PromptBoard prompts={filteredPrompts} projectMap={projectMap} />
        ) : (
          <PromptList
            prompts={filteredPrompts}
            projectMap={projectMap}
            selectedIds={selectedIds}
            setSelectedIds={setSelectedIds}
          />
        )}
      </div>
    </div>
  );
}

const StatusBadge = ({ status }: { status: string }) => {
  const styles: Record<string, string> = {
    draft: 'text-gray-600 bg-gray-100 border border-gray-200',
    needs_review: 'text-yellow-700 bg-yellow-50 border border-yellow-100',
    ready: 'text-green-700 bg-green-50 border border-green-100',
    deprecated: 'text-red-700 bg-red-50 border border-red-100',
    tuning: 'text-blue-700 bg-blue-50 border border-blue-100',
    disabled: 'text-gray-400 bg-gray-50 border border-gray-200 dashed',
  };

  const labels: Record<string, string> = {
    draft: '草稿',
    needs_review: '待審閱',
    ready: '可用',
    deprecated: '已棄用',
    tuning: '調整中',
    disabled: '停用',
  };

  return (
    <span className={`text-xs px-2 py-0.5 rounded-md font-medium ${styles[status] || styles.draft}`}>
      {labels[status] || status}
    </span>
  );
};

const TagPill = ({ text }: { text: string }) => (
  <span className="text-[10px] px-1.5 py-0.5 bg-gray-50 text-gray-600 rounded-md border border-gray-200 truncate">
    {text}
  </span>
);

interface PromptListProps {
  prompts: PromptEntity[];
  projectMap: Record<string, string>;
  selectedIds: Set<string>;
  setSelectedIds: (ids: Set<string>) => void;
}

function PromptList({ prompts, projectMap, selectedIds, setSelectedIds }: PromptListProps) {
  const { setSelectedItem } = useUiStore();

  const handleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.checked) {
      setSelectedIds(new Set(prompts.map(p => p.id)));
    } else {
      setSelectedIds(new Set());
    }
  };

  const handleSelectOne = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const newSet = new Set(selectedIds);
    if (newSet.has(id)) {
      newSet.delete(id);
    } else {
      newSet.add(id);
    }
    setSelectedIds(newSet);
  };

  // Helper to format date as YYYY-MM-DD
  const formatDateOnly = (d: string) => {
    if (!d) return '-';
    try {
      // Use slice to get YYYY-MM-DD from ISO string (simple & robust for rough day)
      return new Date(d).toISOString().split('T')[0];
    } catch {
      return '-';
    }
  };

  return (
    // Added overflow-x-auto
    <div className="h-full overflow-y-auto overflow-x-auto pb-20 pt-2 custom-scrollbar px-6">
      {/* Added min-w-[1000px] to enforce grid width and scrolling */}
      <div className="min-w-[1000px] grid grid-cols-[40px_minmax(300px,3fr)_180px_100px_100px_minmax(150px,2fr)_120px] gap-4 text-xs font-medium text-gray-400 border-b border-gray-100 bg-white sticky top-0 z-10 items-center">
        <div className="py-2 px-3 flex justify-center">
          <input
            type="checkbox"
            className="rounded border-gray-300 text-gray-600 focus:ring-0 cursor-pointer"
            checked={prompts.length > 0 && selectedIds.size === prompts.length}
            onChange={handleSelectAll}
          />
        </div>
        <div className="py-2 px-3">名稱</div>
        <div className="py-2 px-3">所屬專案</div>
        <div className="py-2 px-3">狀態</div>
        <div className="py-2 px-3">優先級</div>
        <div className="py-2 px-3">標籤</div>
        <div className="py-2 px-3 text-right">更新</div>
      </div>

      {prompts.map((prompt) => {
        const isSelected = selectedIds.has(prompt.id);
        const projectName = projectMap[prompt.projectId] || '-';

        return (
          <div key={prompt.id} className={`group relative ${isSelected ? 'bg-blue-50/30' : ''}`}>
            <div
              className="min-w-[1000px] grid grid-cols-[40px_minmax(300px,3fr)_180px_100px_100px_minmax(150px,2fr)_120px] gap-4 items-center hover:bg-gray-50 cursor-pointer select-none transition-colors border-b border-gray-100 h-12"
              onClick={() => setSelectedItem({ type: 'prompt', id: prompt.id })}
            >
              <div className="py-2 px-3 flex justify-center" onClick={(e) => e.stopPropagation()}>
                <input
                  type="checkbox"
                  className="rounded border-gray-300 text-gray-600 focus:ring-0 cursor-pointer"
                  checked={isSelected}
                  onChange={() => { }} // Controlled by onClick handler above
                  onClick={(e) => handleSelectOne(prompt.id, e)}
                />
              </div>

              <div className="flex items-center py-2 px-3 overflow-hidden relative">
                <div className="mr-3 p-1 bg-gray-50 rounded border border-gray-100 text-gray-500 flex-shrink-0">
                  <FileText size={16} />
                </div>
                <span className="font-medium text-gray-900 text-sm truncate" title={prompt.title}>
                  {prompt.title}
                </span>
              </div>

              <div className="py-2 px-3 flex items-center overflow-hidden">
                <div className="flex items-center text-gray-500 text-xs truncate max-w-full" title={projectName}>
                  <Folder size={12} className="mr-1.5 flex-shrink-0 text-gray-400" />
                  <span className="truncate">{projectName}</span>
                </div>
              </div>

              <div className="py-2 px-3 flex items-center">
                <StatusBadge status={prompt.status} />
              </div>

              <div className="py-2 px-3 flex items-center">
                <span className="text-gray-600 text-xs capitalize">{prompt.priority || 'medium'}</span>
              </div>

              <div className="py-2 px-3 flex gap-1 overflow-hidden items-center">
                {prompt.tags.map((t: string) => <TagPill key={t} text={t} />)}
              </div>

              <div className="py-2 px-3 text-right text-xs text-gray-400 font-mono">
                {formatDateOnly(prompt.updatedAt as string)}
              </div>
            </div>
          </div>
        );
      })}

      {prompts.length === 0 && (
        <div className="p-16 text-center text-gray-400 text-sm italic">
          No prompts found.
        </div>
      )}
    </div>
  );
}

function PromptBoard({ prompts, projectMap }: { prompts: PromptEntity[], projectMap: Record<string, string> }) {
  const { setSelectedItem } = useUiStore();
  const columns = [
    { id: 'draft', label: '草稿' },
    { id: 'needs_review', label: '待審閱' },
    { id: 'ready', label: '可用' },
    { id: 'deprecated', label: '已棄用' },
  ];

  return (
    <div className="flex gap-4 h-full min-w-[1000px] overflow-x-auto p-4 bg-[#F7F7F5]">
      {columns.map((col) => (
        <div key={col.id} className="flex-1 flex flex-col min-w-[240px]">
          <div className="flex items-center justify-between px-1 mb-2">
            <span className="font-semibold text-gray-500 text-xs uppercase tracking-wide">
              {col.label}
            </span>
            <span className="text-xs text-gray-400 font-mono">
              {prompts.filter((p) => p.status === col.id).length}
            </span>
          </div>
          <div className="flex-1 overflow-y-auto space-y-2.5 pb-20 custom-scrollbar">
            {prompts
              .filter((p) => p.status === col.id)
              .map((prompt) => (
                <div
                  key={prompt.id}
                  onClick={() => setSelectedItem({ type: 'prompt', id: prompt.id })}
                  className="bg-white p-3 rounded-[3px] shadow-sm hover:shadow-md cursor-pointer transition-all border border-gray-200/50 hover:border-gray-300 group"
                >
                  <div className="flex items-start justify-between mb-2">
                    <span className="font-medium text-gray-800 leading-tight flex items-center gap-1.5 break-all">
                      <FileText size={14} className="text-emerald-500/70 flex-shrink-0" />
                      {prompt.title}
                    </span>
                  </div>

                  <div className="flex items-center text-xs text-gray-400 mb-2 truncate" title={projectMap[prompt.projectId]}>
                    <Folder size={10} className="mr-1 flex-shrink-0" />
                    <span className="truncate">{projectMap[prompt.projectId] || '-'}</span>
                  </div>

                  <div className="flex flex-wrap gap-1 mt-2">
                    {prompt.tags.map((tag: string) => (
                      <span key={tag} className="text-[10px] px-1 py-0.5 bg-gray-50 text-gray-500 rounded border border-gray-100 truncate max-w-[100px]">{tag}</span>
                    ))}
                  </div>
                </div>
              ))}
          </div>
        </div>
      ))}
    </div>
  );
}

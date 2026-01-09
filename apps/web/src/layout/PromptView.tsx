import { useState, useEffect, useCallback } from 'react';
import { FileText } from 'lucide-react';
import { useUiStore } from '../state/uiStore';
import { getPrompts } from '../features/library/api';
import { PromptEntity } from '@pah/contracts';

export function PromptView() {
  const { promptSubView, searchQuery } = useUiStore();
  const [prompts, setPrompts] = useState<PromptEntity[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchPrompts = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await getPrompts();
      setPrompts(data);
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Failed to fetch prompts');
    } finally {
      setIsLoading(false);
    }
  }, []); // Only fetch once (refresh on entity-change)

  const filteredPrompts = prompts.filter(p => {
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    return (
      p.title.toLowerCase().includes(q) ||
      p.tags.some(t => t.toLowerCase().includes(q))
    );
  });

  useEffect(() => {
    fetchPrompts();

    // Listen for entity changes
    const handleEntityChange = () => fetchPrompts();
    window.addEventListener('entity-change', handleEntityChange);
    return () => window.removeEventListener('entity-change', handleEntityChange);
  }, [fetchPrompts]);

  if (isLoading && prompts.length === 0) {
    return <div className="p-8 text-gray-400">Loading prompts...</div>;
  }

  if (error) {
    return <div className="p-8 text-red-500">Error: {error}</div>;
  }

  return (
    <div className="h-full flex flex-col">
      <div className="flex-none px-4 py-2 flex justify-between items-center bg-white border-b border-gray-100">
        <h2 className="text-sm font-semibold text-gray-700">All Prompts</h2>
        {/* Creation handled in Project context */}
      </div>

      <div className="flex-1 overflow-hidden">
        {promptSubView === 'board' ? (
          <PromptBoard prompts={filteredPrompts} />
        ) : (
          <PromptList prompts={filteredPrompts} />
        )}
      </div>
    </div>
  );
}

function PromptList({ prompts }: { prompts: PromptEntity[] }) {
  const { setSelectedItem } = useUiStore();

  return (
    <div className="h-full overflow-y-auto pb-20 pt-2 custom-scrollbar">
      <div className="flex text-xs font-medium text-gray-400 border-b border-gray-200 pb-2 mb-2 px-2 select-none sticky top-0 bg-white z-10">
        <div className="flex-[2] py-2 px-3 border-r border-gray-100">名稱</div>
        <div className="w-28 py-2 px-3 border-r border-gray-100">狀態</div>
        <div className="w-24 py-2 px-3 border-r border-gray-100">優先級</div>
        <div className="flex-1 py-2 px-3 border-r border-gray-100">標籤</div>
        <div className="w-28 py-2 px-3 text-right">更新</div>
      </div>

      {prompts.map((prompt) => (
        <div
          key={prompt.id}
          onClick={() => setSelectedItem({ type: 'prompt', id: prompt.id })}
          className="flex items-center hover:bg-gray-50 cursor-pointer border-b border-gray-100 transition-colors relative group"
        >
          <div className="flex-[2] flex items-center py-1.5 px-3 border-r border-gray-100 overflow-hidden">
            <FileText size={16} className="text-emerald-500/70 flex-shrink-0 mr-2" />
            <span className="text-gray-700 font-medium text-sm truncate">
              {prompt.title}
            </span>
          </div>
          <div className="w-28 py-1.5 px-3 border-r border-gray-100 flex items-center text-xs">
            {prompt.status}
          </div>
          <div className="w-24 py-1.5 px-3 border-r border-gray-100 text-sm text-gray-500 flex items-center">
            {prompt.priority}
          </div>
          <div className="flex-1 py-1.5 px-3 border-r border-gray-100 flex gap-1 overflow-hidden items-center">
            {prompt.tags.map((t: string) => (
              <span key={t} className="text-[10px] text-gray-500 bg-white border border-gray-200 px-1 rounded truncate max-w-[80px]">
                {t}
              </span>
            ))}
          </div>
          <div className="w-28 py-1.5 px-3 text-right text-xs text-gray-400 font-mono flex items-center justify-end">
            {new Date(prompt.updatedAt).toLocaleDateString()}
          </div>
        </div>
      ))}

      {prompts.length === 0 && (
        <div className="p-8 text-center text-gray-400 text-sm">
          No prompts found.
        </div>
      )}
    </div>
  );
}

function PromptBoard({ prompts }: { prompts: PromptEntity[] }) {
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

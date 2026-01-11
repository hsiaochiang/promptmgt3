import { useState, useEffect, useCallback } from 'react';
import { FileText } from 'lucide-react';
import { useUiStore } from '../state/uiStore';
import { getPrompts } from '../features/library/api';
import { PromptEntity } from '@pah/contracts';
import { formatDate } from '../utils/date';

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
    ready: '就緒',
    deprecated: '已棄用',
    tuning: '調整中',
    disabled: '停用',
  };

  return (
    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${styles[status] || styles.draft}`}>
      {labels[status] || status}
    </span>
  );
};

const TagPill = ({ text }: { text: string }) => (
  <span className="text-[10px] px-1.5 py-0.5 bg-gray-50 text-gray-600 rounded-md border border-gray-200 truncate">
    {text}
  </span>
);

function PromptList({ prompts }: { prompts: PromptEntity[] }) {
  const { setSelectedItem } = useUiStore();

  return (
    <div className="h-full overflow-y-auto pb-20 pt-2 custom-scrollbar px-6">
      <div className="grid grid-cols-[minmax(400px,4fr)_120px_minmax(200px,2fr)_120px_60px] gap-4 text-xs font-medium text-gray-400 border-b border-gray-100 bg-white sticky top-0 z-10 items-center">
        <div className="py-2 px-3">名稱</div>
        <div className="py-2 px-3">狀態</div>
        <div className="py-2 px-3">標籤</div>
        <div className="py-2 px-3 text-right">更新</div>
        <div className=""></div>
      </div>

      {prompts.map((prompt) => (
        <div key={prompt.id} className="group relative">
          <div
            className="grid grid-cols-[minmax(400px,4fr)_120px_minmax(200px,2fr)_120px_60px] gap-4 items-center hover:bg-gray-50 cursor-pointer select-none transition-colors border-b border-gray-100 h-12"
            onClick={() => setSelectedItem({ type: 'prompt', id: prompt.id })}
          >
            <div className="flex items-center py-2 px-3 overflow-hidden relative">
              <div className="mr-3 p-1 bg-gray-50 rounded border border-gray-100 text-gray-500 flex-shrink-0">
                <FileText size={16} />
              </div>
              <span className="font-medium text-gray-900 text-sm truncate" title={prompt.title}>
                {prompt.title}
              </span>
            </div>

            <div className="py-2 px-3 flex items-center">
              <StatusBadge status={prompt.status} />
            </div>

            <div className="py-2 px-3 flex gap-1 overflow-hidden items-center">
              {prompt.tags.map((t: string) => <TagPill key={t} text={t} />)}
            </div>

            <div className="py-2 px-3 text-right text-xs text-gray-400 font-mono">
              {formatDate(prompt.updatedAt)}
            </div>

            <div className="flex justify-center opacity-0 group-hover:opacity-100 transition-opacity">
              <button className="text-[10px] border border-gray-200 bg-white px-2 py-0.5 rounded shadow-sm hover:bg-gray-50 text-gray-600">
                OPEN
              </button>
            </div>
          </div>
        </div>
      ))}

      {prompts.length === 0 && (
        <div className="p-16 text-center text-gray-400 text-sm italic">
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

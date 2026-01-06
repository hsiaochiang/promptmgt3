import { useState, useEffect } from 'react';
import type { PromptEntity } from '@pah/contracts';
import { FileText, Maximize2 } from 'lucide-react';
import { MOCK_PROMPTS } from '../../data/mockData';

type ViewMode = 'list' | 'board';

interface ListViewProps {
  viewMode: ViewMode;
  searchQuery: string;
  onSelectPrompt: (prompt: PromptEntity | null) => void;
  selectedPromptId: string | null;
}

const USE_MOCK_DATA = true; // Set to false to use real API

export function ListView({
  viewMode,
  searchQuery,
  onSelectPrompt,
  selectedPromptId,
}: ListViewProps) {
  const [prompts, setPrompts] = useState<PromptEntity[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch prompts from server or use mock data
  useEffect(() => {
    const fetchPrompts = async () => {
      try {
        setLoading(true);
        
        if (USE_MOCK_DATA) {
          // Use mock data for visual comparison
          await new Promise(resolve => setTimeout(resolve, 300)); // Simulate loading
          setPrompts(MOCK_PROMPTS);
        } else {
          // Use real API
          const response = await fetch('http://localhost:3001/api/prompts');
          if (!response.ok) {
            throw new Error(`Failed to fetch prompts: ${response.statusText}`);
          }
          const data = await response.json();
          setPrompts(data);
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load prompts');
      } finally {
        setLoading(false);
      }
    };

    fetchPrompts();
  }, []);

  // Filter prompts by search query
  const filteredPrompts = prompts.filter((prompt) => {
    if (!searchQuery) return true;
    const query = searchQuery.toLowerCase();
    return (
      prompt.title.toLowerCase().includes(query) ||
      prompt.body.toLowerCase().includes(query) ||
      prompt.tags?.some(tag => tag.toLowerCase().includes(query))
    );
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-400 text-xs">載入中...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-8 text-center">
        <div className="text-red-600 mb-2 text-xs">載入失敗</div>
        <div className="text-xs text-gray-500">{error}</div>
      </div>
    );
  }

  if (filteredPrompts.length === 0) {
    return (
      <div className="p-8 text-center text-gray-400 text-xs">
        {searchQuery ? '找不到符合的提示詞' : '尚無提示詞'}
      </div>
    );
  }

  if (viewMode === 'board') {
    return <BoardView prompts={filteredPrompts} onSelectPrompt={onSelectPrompt} selectedPromptId={selectedPromptId} />;
  }

  return (
    <div className="pb-20 pt-2">
      <div className="flex text-xs font-medium text-gray-400 border-b border-gray-200 pb-2 mb-2 px-2 select-none sticky top-0 bg-white z-10">
        <div className="flex-[2] py-2 px-3 border-r border-gray-100">名稱</div>
        <div className="w-28 py-2 px-3 border-r border-gray-100">狀態</div>
        <div className="w-24 py-2 px-3 border-r border-gray-100">優先級</div>
        <div className="flex-1 py-2 px-3 border-r border-gray-100">標籤</div>
        <div className="w-28 py-2 px-3 text-right">更新</div>
      </div>

      {filteredPrompts.map(prompt => (
        <div
          key={prompt.id}
          onClick={() => onSelectPrompt(prompt)}
          className={`flex items-center hover:bg-gray-50 cursor-pointer border-b border-gray-100 transition-colors relative group ${
            selectedPromptId === prompt.id ? 'bg-blue-50' : ''
          }`}
        >
          <div className="flex-[2] flex items-center py-1.5 px-3 border-r border-gray-100 overflow-hidden">
            <FileText size={16} className="text-gray-400 flex-shrink-0 mr-2" />
            <span className="text-gray-700 font-medium text-xs group-hover:underline decoration-gray-300 underline-offset-2 truncate">
              {prompt.title}
            </span>
          </div>

          <div className="w-28 py-1.5 px-3 border-r border-gray-100 flex items-center">
            <StatusBadge status={prompt.status} />
          </div>

          <div className="w-24 py-1.5 px-3 border-r border-gray-100 text-xs text-gray-500 flex items-center">
            {prompt.priority}
          </div>

          <div className="flex-1 py-1.5 px-3 border-r border-gray-100 flex gap-1 overflow-hidden items-center">
            {(prompt.tags ?? []).slice(0, 2).map((t, i) => (
              <span key={i} className="text-[10px] text-gray-500 bg-white border border-gray-200 px-1 rounded">
                {t}
              </span>
            ))}
          </div>

          <div className="w-28 py-1.5 px-3 text-right text-xs text-gray-400 font-mono flex items-center justify-end">
            {new Date(prompt.updatedAt).toLocaleDateString('zh-TW')}
          </div>

          <div className="absolute right-2 opacity-0 group-hover:opacity-100 flex gap-1">
            <button className="text-gray-400 hover:text-gray-600 p-1 hover:bg-gray-200 rounded">
              <Maximize2 size={12} />
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}

function BoardView({
  prompts,
  onSelectPrompt,
  selectedPromptId,
}: {
  prompts: PromptEntity[];
  onSelectPrompt: (prompt: PromptEntity) => void;
  selectedPromptId: string | null;
}) {
  const columns = [
    { id: 'draft', label: '草稿' },
    { id: 'tuning', label: '調整中' },
    { id: 'ready', label: '就緒' },
    { id: 'disabled', label: '停用' },
  ] as const;

  return (
    <div className="flex gap-4 h-full min-w-[800px] overflow-x-auto p-8 bg-[#F7F7F5]">
      {columns.map(col => (
        <div key={col.id} className="flex-1 flex flex-col min-w-[260px]">
          <div className="flex items-center justify-between px-1 mb-2">
            <span className="font-semibold text-gray-500 text-xs uppercase tracking-wide">{col.label}</span>
            <span className="text-xs text-gray-400 font-mono">
              {prompts.filter(p => p.status === col.id).length}
            </span>
          </div>
          <div className="flex-1 overflow-y-auto space-y-2.5 pb-20 custom-scrollbar">
            {prompts
              .filter(p => p.status === col.id)
              .map(prompt => (
                <div
                  key={prompt.id}
                  onClick={() => onSelectPrompt(prompt)}
                  className={`bg-white p-3 rounded-[3px] shadow-sm hover:shadow-md cursor-pointer transition-all border border-gray-200/50 hover:border-gray-300 group ${
                    selectedPromptId === prompt.id ? 'ring-2 ring-blue-500' : ''
                  }`}
                >
                  <div className="flex items-start justify-between mb-2">
                    <span className="font-medium text-gray-800 leading-tight text-xs">{prompt.title}</span>
                    {prompt.priority === 'P0' && (
                      <div className="w-1.5 h-1.5 rounded-full bg-red-400 mt-1" title="High Priority" />
                    )}
                  </div>
                  <div className="flex flex-wrap gap-1">
                    {(prompt.tags ?? []).slice(0, 3).map((tag, i) => (
                      <span
                        key={`${prompt.id}:${tag}:${i}`}
                        className="text-[10px] px-1.5 py-0.5 bg-gray-50 text-gray-500 rounded-[2px] border border-gray-100"
                      >
                        {tag}
                      </span>
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

function StatusBadge({ status }: { status: PromptEntity['status'] }) {
  const styles: Record<PromptEntity['status'], string> = {
    draft: 'text-gray-500 bg-gray-50 border border-dashed border-gray-300',
    tuning: 'text-yellow-700 bg-yellow-50',
    ready: 'text-green-700 bg-green-50',
    disabled: 'text-gray-400 bg-gray-100 line-through',
  };

  const labels: Record<PromptEntity['status'], string> = {
    draft: '草稿',
    tuning: '調整中',
    ready: '就緒',
    disabled: '停用',
  };

  return (
    <span className={`text-xs px-2 py-0.5 rounded-[3px] ${styles[status]}`}>
      {labels[status]}
    </span>
  );
}

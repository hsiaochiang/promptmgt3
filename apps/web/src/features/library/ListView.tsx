import { useState, useEffect } from 'react';
import type { PromptEntity } from '@pah/contracts';

type ViewMode = 'list' | 'board';

interface ListViewProps {
  viewMode: ViewMode;
  searchQuery: string;
  onSelectPrompt: (prompt: PromptEntity | null) => void;
  selectedPromptId: string | null;
}

export function ListView({
  viewMode,
  searchQuery,
  onSelectPrompt,
  selectedPromptId,
}: ListViewProps) {
  const [prompts, setPrompts] = useState<PromptEntity[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch prompts from server
  useEffect(() => {
    const fetchPrompts = async () => {
      try {
        setLoading(true);
        const response = await fetch('http://localhost:3001/api/prompts');
        if (!response.ok) {
          throw new Error(`Failed to fetch prompts: ${response.statusText}`);
        }
        const data = await response.json();
        setPrompts(data);
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
        <div className="text-secondary">載入中...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-8 text-center">
        <div className="text-red-600 mb-2">載入失敗</div>
        <div className="text-sm text-secondary">{error}</div>
      </div>
    );
  }

  if (filteredPrompts.length === 0) {
    return (
      <div className="p-8 text-center text-secondary">
        {searchQuery ? '找不到符合的提示詞' : '尚無提示詞'}
      </div>
    );
  }

  if (viewMode === 'board') {
    return <BoardView prompts={filteredPrompts} onSelectPrompt={onSelectPrompt} selectedPromptId={selectedPromptId} />;
  }

  return (
    <div className="divide-y divide-subtle">
      {filteredPrompts.map((prompt) => (
        <div
          key={prompt.id}
          onClick={() => onSelectPrompt(prompt)}
          className={`p-4 cursor-pointer hover:bg-hover transition-colors ${
            selectedPromptId === prompt.id ? 'bg-blue-50' : ''
          }`}
        >
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1 min-w-0">
              <h3 className="font-medium truncate">{prompt.title}</h3>
              {prompt.body && (
                <p className="text-sm text-secondary mt-1 line-clamp-2">
                  {prompt.body.substring(0, 150)}...
                </p>
              )}
              <div className="flex items-center gap-2 mt-2">
                <span className={`text-xs px-2 py-0.5 rounded ${getStatusColor(prompt.status)}`}>
                  {getStatusLabel(prompt.status)}
                </span>
                <span className="text-xs text-tertiary">{prompt.priority}</span>
                {prompt.tags && prompt.tags.length > 0 && (
                  <div className="flex gap-1">
                    {prompt.tags.slice(0, 3).map((tag, i) => (
                      <span key={i} className="text-xs text-secondary">
                        #{tag}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </div>
            <div className="text-xs text-tertiary whitespace-nowrap">
              {new Date(prompt.updatedAt).toLocaleDateString('zh-TW')}
            </div>
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
  const statuses = ['draft', 'tuning', 'ready', 'disabled'];
  const groupedPrompts = statuses.reduce((acc, status) => {
    acc[status] = prompts.filter(p => p.status === status);
    return acc;
  }, {} as Record<string, PromptEntity[]>);

  return (
    <div className="p-4 grid grid-cols-4 gap-4 h-full">
      {statuses.map((status) => (
        <div key={status} className="flex flex-col">
          <div className="font-medium mb-2 px-2">
            {getStatusLabel(status)} ({groupedPrompts[status].length})
          </div>
          <div className="flex-1 space-y-2 overflow-auto">
            {groupedPrompts[status].map((prompt) => (
              <div
                key={prompt.id}
                onClick={() => onSelectPrompt(prompt)}
                className={`p-3 bg-white border border-subtle rounded-md cursor-pointer hover:shadow-md transition-shadow ${
                  selectedPromptId === prompt.id ? 'ring-2 ring-blue-500' : ''
                }`}
              >
                <h4 className="font-medium text-sm mb-1">{prompt.title}</h4>
                {prompt.tags && prompt.tags.length > 0 && (
                  <div className="flex flex-wrap gap-1 mt-2">
                    {prompt.tags.slice(0, 2).map((tag, i) => (
                      <span key={i} className="text-xs text-secondary">
                        #{tag}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

function getStatusLabel(status: string): string {
  const labels: Record<string, string> = {
    draft: '草稿',
    tuning: '調整中',
    ready: '就緒',
    disabled: '停用',
  };
  return labels[status] || status;
}

function getStatusColor(status: string): string {
  const colors: Record<string, string> = {
    draft: 'bg-gray-100 text-gray-700',
    tuning: 'bg-yellow-100 text-yellow-700',
    ready: 'bg-green-100 text-green-700',
    disabled: 'bg-red-100 text-red-700',
  };
  return colors[status] || 'bg-gray-100 text-gray-700';
}

import { useState, useEffect } from 'react';
import { getProjects, getPrompts } from '../library/api';
import { useUiStore } from '../../state/uiStore';
import { ProjectEntity, PromptEntity } from '@pah/contracts';
import { FileText, FolderOpen, Filter } from 'lucide-react';
import { formatDate } from '../../utils/date';

type ArchivedItem =
  | (ProjectEntity & { type: 'project' })
  | (PromptEntity & { type: 'prompt' });

export function ArchiveView() {
  const { searchQuery } = useUiStore();
  const [items, setItems] = useState<ArchivedItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filterType, setFilterType] = useState<'all' | 'project' | 'prompt'>('all');

  useEffect(() => {
    const fetchArchived = async () => {
      try {
        setLoading(true);
        const [projects, prompts] = await Promise.all([
          getProjects({ archived: true }),
          getPrompts({ archived: true })
        ]);

        const combined: ArchivedItem[] = [
          ...projects.map(p => ({ ...p, type: 'project' as const })),
          ...prompts.map(p => ({ ...p, type: 'prompt' as const }))
        ];

        // Sort by updatedAt desc
        combined.sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());

        setItems(combined);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load archived items');
      } finally {
        setLoading(false);
      }
    };

    fetchArchived();

    // Listen for changes
    const handler = () => fetchArchived();
    window.addEventListener('entity-change', handler);
    return () => window.removeEventListener('entity-change', handler);
  }, []);

  const filteredItems = items.filter((item: ArchivedItem) => {
    // Type filter
    if (filterType !== 'all' && item.type !== filterType) return false;

    // Search filter
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    return (
      item.title.toLowerCase().includes(q) ||
      item.tags.some(t => t.toLowerCase().includes(q))
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
      <div className="p-8 text-center text-red-500 text-xs">
        {error}
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col">
      <div className="flex-none px-4 py-3 flex gap-2 items-center border-b border-gray-100 bg-white">
        <Filter size={14} className="text-gray-400" />
        <select
          value={filterType}
          onChange={(e) => setFilterType(e.target.value as any)}
          className="text-xs border-none bg-gray-50 rounded px-2 py-1 focus:ring-0 cursor-pointer text-gray-700"
        >
          <option value="all">所有類型</option>
          <option value="project">專案</option>
          <option value="prompt">提示詞</option>
        </select>
        <div className="flex-1"></div>
        <div className="text-xs text-gray-400">
          共 {filteredItems.length} 個封存項目
        </div>
      </div>

      <div className="flex-1 overflow-y-auto pb-20 custom-scrollbar">
        {filteredItems.length === 0 ? (
          <div className="p-8 text-center text-gray-400 text-xs">
            沒有符合條件的封存項目
          </div>
        ) : (
          <div className="divide-y divide-gray-100">
            <div className="flex text-xs font-medium text-gray-400 bg-white sticky top-0 z-10 border-b border-gray-200">
              <div className="w-8 py-2 px-3"></div>
              <div className="flex-[2] py-2 px-3 border-r border-gray-100">名稱</div>
              <div className="w-24 py-2 px-3 border-r border-gray-100">類型</div>
              <div className="flex-1 py-2 px-3 border-r border-gray-100">標籤</div>
              <div className="w-32 py-2 px-3 text-right">封存時間</div>
            </div>

            {filteredItems.map(item => (
              <div
                key={`${item.type}-${item.id}`}
                className="flex items-center hover:bg-gray-50 transition-colors group"
              >
                <div className="w-8 py-2 px-3 flex justify-center">
                  {item.type === 'project' ? (
                    <FolderOpen size={14} className="text-blue-400" />
                  ) : (
                    <FileText size={14} className="text-emerald-400" />
                  )}
                </div>
                <div className="flex-[2] py-2 px-3 border-r border-gray-100 font-medium text-gray-700 text-xs truncate">
                  {item.title}
                </div>
                <div className="w-24 py-2 px-3 border-r border-gray-100 text-xs text-gray-500 capitalize">
                  {item.type}
                </div>
                <div className="flex-1 py-2 px-3 border-r border-gray-100 flex gap-1 overflow-hidden">
                  {item.tags.map(t => (
                    <span key={t} className="text-[10px] bg-gray-100 px-1 rounded text-gray-500 truncate">{t}</span>
                  ))}
                </div>
                <div className="w-32 py-2 px-3 text-right text-xs text-gray-400 font-mono">
                  {formatDate(item.updatedAt)}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

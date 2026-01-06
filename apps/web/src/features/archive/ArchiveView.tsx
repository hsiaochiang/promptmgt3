import { useState, useEffect } from 'react';
import type { PromptEntity } from '@pah/contracts';
import { FileText } from 'lucide-react';
import { MOCK_ARCHIVED_PROMPTS } from '../../data/mockData';

const USE_MOCK_DATA = true; // Set to false to use real API

export function ArchiveView() {
  const [prompts, setPrompts] = useState<PromptEntity[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchArchived = async () => {
      try {
        setLoading(true);
        
        if (USE_MOCK_DATA) {
          // Use mock data for visual comparison
          await new Promise(resolve => setTimeout(resolve, 300));
          setPrompts(MOCK_ARCHIVED_PROMPTS);
        } else {
          // Use real API
          const response = await fetch('http://localhost:3001/api/prompts?archived=true');
          if (!response.ok) {
            throw new Error('Failed to fetch archived prompts');
          }
          const data = await response.json();
          setPrompts(data);
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load archived prompts');
      } finally {
        setLoading(false);
      }
    };

    fetchArchived();
  }, []);

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

  if (prompts.length === 0) {
    return (
      <div className="p-8 text-center text-gray-400 text-xs">
        目前沒有封存項目
      </div>
    );
  }

  return (
    <div className="pb-20 pt-2">
      <div className="mb-4 p-3 bg-purple-50 border border-purple-300 rounded text-xs text-purple-900">
        📦 <span className="font-medium">注意：</span>封存項目為唯讀狀態。若需要重新啟用，請使用「取消封存」功能。
      </div>

      <div className="flex text-xs font-medium text-gray-400 border-b border-gray-200 pb-2 mb-2 px-2 select-none sticky top-0 bg-white z-10">
        <div className="flex-[2] py-2 px-3 border-r border-gray-100">名稱</div>
        <div className="w-28 py-2 px-3 border-r border-gray-100">狀態</div>
        <div className="flex-1 py-2 px-3 border-r border-gray-100">標籤</div>
        <div className="w-28 py-2 px-3 text-right">更新</div>
      </div>

      {prompts.map(prompt => (
        <div
          key={prompt.id}
          className="flex items-center hover:bg-gray-50 cursor-pointer border-b border-gray-100 transition-colors relative group"
        >
          <div className="flex-[2] flex items-center py-1.5 px-3 border-r border-gray-100 overflow-hidden">
            <FileText size={16} className="text-gray-400 flex-shrink-0 mr-2" />
            <span className="text-gray-500 font-medium text-xs truncate">
              {prompt.title}
            </span>
          </div>

          <div className="w-28 py-1.5 px-3 border-r border-gray-100 flex items-center">
            <span className="text-xs px-2 py-0.5 rounded-[3px] text-purple-700 bg-purple-50">
              已封存
            </span>
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
        </div>
      ))}
    </div>
  );
}

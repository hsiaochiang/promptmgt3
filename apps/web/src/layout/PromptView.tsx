import { FileText } from 'lucide-react';
import { useUiStore } from '../state/uiStore';

// Mock Data
const MOCK_PROMPTS = [
  {
    id: 'pr1',
    title: '客服情緒分析',
    status: 'ready',
    tags: ['Analysis'],
    priority: 'high',
    updatedAt: '2024-01-02',
  },
  {
    id: 'pr2',
    title: '自動回覆生成 - 退貨',
    status: 'draft',
    tags: ['Generation'],
    priority: 'medium',
    updatedAt: '2024-01-01',
  },
];

export function PromptView() {
  const { promptSubView } = useUiStore();

  if (promptSubView === 'board') {
    return <PromptBoard prompts={MOCK_PROMPTS} />;
  }
  return <PromptList prompts={MOCK_PROMPTS} />;
}

function PromptList({ prompts }: { prompts: any[] }) {
  const { setSelectedItem } = useUiStore();

  return (
    <div className="pb-20 pt-2">
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
            <FileText size={16} className="text-gray-400 flex-shrink-0 mr-2" />
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
              <span key={t} className="text-[10px] text-gray-500 bg-white border border-gray-200 px-1 rounded">
                {t}
              </span>
            ))}
          </div>
          <div className="w-28 py-1.5 px-3 text-right text-xs text-gray-400 font-mono flex items-center justify-end">
            {prompt.updatedAt}
          </div>
        </div>
      ))}
    </div>
  );
}

function PromptBoard({ prompts }: { prompts: any[] }) {
  const { setSelectedItem } = useUiStore();
  const columns = [
    { id: 'draft', label: '草稿' },
    { id: 'ready', label: '可用' },
  ];

  return (
    <div className="flex gap-4 h-full min-w-[800px] overflow-x-auto p-8 bg-[#F7F7F5]">
      {columns.map((col) => (
        <div key={col.id} className="flex-1 flex flex-col min-w-[260px]">
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
                    <span className="font-medium text-gray-800 leading-tight">{prompt.title}</span>
                  </div>
                </div>
              ))}
          </div>
        </div>
      ))}
    </div>
  );
}
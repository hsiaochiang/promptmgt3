import { useState, useEffect } from 'react';
import { Maximize2, Minimize2, MoreHorizontal, Archive, RotateCcw, Trash2, ChevronRight, Save } from 'lucide-react';
import { useUiStore } from '../state/uiStore';

// 暫時使用簡單的 Mock Data 結構，實際應從 API 或 Store 獲取
const MOCK_DATA_PLACEHOLDER = {
  title: '載入中...',
  content: '',
  status: 'draft',
  tags: [],
  updatedAt: new Date().toISOString().split('T')[0],
};

export function SidePanel() {
  const { selectedItem, closePanel, setActiveSection } = useUiStore();
  const [isExpanded, setIsExpanded] = useState(false);
  const [formData, setFormData] = useState<any>(null);

  // 模擬資料載入
  useEffect(() => {
    if (selectedItem) {
      // 這裡未來會替換為真實的 API 呼叫
      setFormData({
        ...MOCK_DATA_PLACEHOLDER,
        id: selectedItem.id,
        type: selectedItem.type,
        title: selectedItem.type === 'project' ? '專案詳情範例' : '提示詞詳情範例',
      });
    }
  }, [selectedItem]);

  if (!selectedItem || !formData) return null;

  const isProject = selectedItem.type === 'project';

  return (
    <div
      className={`absolute top-0 right-0 h-full bg-white shadow-2xl z-50 flex flex-col transform transition-all duration-300 animate-slide-in-right ${
        isExpanded ? 'w-full' : 'w-[600px]'
      }`}
    >
      {/* Top Bar */}
      <div className="h-12 flex items-center justify-between px-4 hover:bg-transparent border-b border-gray-100">
        {/* Breadcrumbs */}
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
              {isProject ? '專案列表' : '提示詞列表'}
            </span>
            <span>/</span>
            <span className="truncate max-w-[200px] text-gray-800 font-medium">
              {formData.title}
            </span>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-1">
          <button onClick={closePanel} className="p-1.5 hover:bg-gray-100 rounded text-gray-500 transition-colors">
            <ChevronRight size={20} />
          </button>
        </div>
      </div>

      {/* Content Area */}
      <div className="flex-1 overflow-y-auto px-12 py-8 custom-scrollbar">
        <div className={`mx-auto ${isExpanded ? 'max-w-4xl' : ''}`}>
          {/* Title */}
          <div className="mb-6">
            <input
              type="text"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              className="w-full text-4xl font-bold text-gray-900 placeholder-gray-300 border-none focus:ring-0 focus:outline-none p-0 bg-transparent leading-tight mb-2"
              placeholder="Untitled"
            />
          </div>

          <hr className="border-gray-100 mb-8" />

          {/* Editor Placeholder */}
          <div className="h-full flex flex-col">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-sm font-bold text-gray-900">內容編輯</h3>
              <button className="text-xs text-gray-400 hover:text-gray-600 flex items-center gap-1">
                <Save size={12} /> Saved
              </button>
            </div>
            <textarea
              className="w-full min-h-[400px] bg-transparent border-none focus:ring-0 font-mono text-sm leading-relaxed text-gray-700 resize-none p-0 placeholder-gray-300"
              placeholder="# 開始撰寫..."
            />
          </div>
        </div>
      </div>
    </div>
  );
}
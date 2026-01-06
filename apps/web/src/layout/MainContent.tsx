import { useEffect, useRef, useState, type ComponentType, type ReactNode } from 'react';
import { Kanban, List as ListIcon, Search, X } from 'lucide-react';
import { ListView } from '../features/library/ListView';
import { InboxView } from '../features/inbox/InboxView';
import { SettingsView } from '../features/settings/SettingsView';
import { HistoryView } from '../features/history/HistoryView';
import { TrashView } from '../features/trash/TrashView';
import { ArchiveView } from '../features/archive/ArchiveView';
import type { PromptEntity } from '@pah/contracts';

type ViewMode = 'list' | 'board';
type SidebarSection = 'library' | 'inbox' | 'trash' | 'archive' | 'history' | 'settings';

interface MainContentProps {
  section: SidebarSection;
  viewMode: ViewMode;
  onViewModeChange: (mode: ViewMode) => void;
  onSelectPrompt: (prompt: PromptEntity | null) => void;
  selectedPromptId: string | null;
}

const GhostButton = ({
  children,
  onClick,
  className = '',
  icon: Icon,
  title,
  active,
}: {
  children: ReactNode;
  onClick: () => void;
  className?: string;
  icon?: ComponentType<{ size?: number | string }>;
  title?: string;
  active?: boolean;
}) => (
  <button
    onClick={onClick}
    title={title}
    className={`flex items-center gap-2 px-2 py-1 rounded-[3px] text-sm transition-colors duration-200 
      ${active ? 'bg-gray-200 text-gray-900 font-medium' : 'text-gray-500 hover:bg-gray-100 hover:text-gray-900'} 
      ${className}`}
  >
    {Icon && <Icon size={16} />}
    {children}
  </button>
);

const ExpandableSearch = ({
  value,
  onChange,
  placeholder,
}: {
  value: string;
  onChange: (next: string) => void;
  placeholder: string;
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const inputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    if (isExpanded && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isExpanded]);

  const handleBlur = () => {
    if (!value) {
      setIsExpanded(false);
    }
  };

  return (
    <div className={`relative flex items-center transition-all duration-300 ${isExpanded ? 'w-48' : 'w-8'}`}>
      {isExpanded ? (
        <div className="absolute right-0 flex items-center bg-gray-100 rounded px-2 z-20">
          <Search size={14} className="text-gray-500 flex-shrink-0" />
          <input
            ref={inputRef}
            type="text"
            value={value}
            onChange={(e) => onChange(e.target.value)}
            onBlur={handleBlur}
            className="w-full bg-transparent border-none text-xs text-gray-700 focus:ring-0 px-2 py-1 placeholder-gray-400"
            placeholder={placeholder}
          />
          <button
            onClick={() => {
              onChange('');
              setIsExpanded(false);
            }}
            className="text-gray-400 hover:text-gray-600"
          >
            <X size={12} />
          </button>
        </div>
      ) : (
        <button
          onClick={() => setIsExpanded(true)}
          className="p-1.5 text-gray-500 hover:bg-gray-100 rounded hover:text-gray-900 transition-colors"
          title="搜尋"
        >
          <Search size={18} />
        </button>
      )}
    </div>
  );
};

export function MainContent({
  section,
  viewMode,
  onViewModeChange,
  onSelectPrompt,
  selectedPromptId,
}: MainContentProps) {
  const [searchQuery, setSearchQuery] = useState('');

  const title =
    section === 'library'
      ? '資料庫'
      : section === 'inbox'
        ? '暫存區'
        : section === 'trash'
          ? '回收站'
          : section === 'archive'
            ? '封存'
            : section === 'history'
              ? '歷史記錄'
              : '設定';

  return (
    <div className="h-full flex flex-col bg-white overflow-hidden">
      {/* Header & Tabs - Prototype style */}
      <div className="px-8 pt-8 pb-4 flex-shrink-0">
        <div className="flex justify-between items-end mb-6">
          <h1 className="text-3xl font-bold text-gray-900">{title}</h1>
        </div>

        <div className="flex justify-between items-center border-b border-gray-100 pb-1">
          <div className="flex gap-1">
            {section === 'library' && (
              <>
                <GhostButton
                  active={viewMode === 'list'}
                  onClick={() => onViewModeChange('list')}
                  icon={ListIcon}
                >
                  列表
                </GhostButton>
                <GhostButton
                  active={viewMode === 'board'}
                  onClick={() => onViewModeChange('board')}
                  icon={Kanban}
                >
                  看板
                </GhostButton>
              </>
            )}
          </div>

          <div className="flex items-center gap-1">
            <ExpandableSearch
              value={searchQuery}
              onChange={setSearchQuery}
              placeholder={section === 'library' ? '搜尋提示詞...' : `搜尋${title}...`}
            />
          </div>
        </div>
      </div>

      {/* Content */}
      <div
        className={`flex-1 overflow-y-auto overflow-x-hidden ${
          section === 'library' && viewMode === 'board' ? 'bg-[#F7F7F5] p-0' : 'bg-white px-8'
        } custom-scrollbar`}
      >
        {section === 'library' && (
          <ListView
            viewMode={viewMode}
            searchQuery={searchQuery}
            onSelectPrompt={onSelectPrompt}
            selectedPromptId={selectedPromptId}
          />
        )}
        {section === 'inbox' && <InboxView />}
        {section === 'trash' && <TrashView />}
        {section === 'archive' && <ArchiveView />}
        {section === 'history' && <HistoryView />}
        {section === 'settings' && <SettingsView />}
      </div>
    </div>
  );
}

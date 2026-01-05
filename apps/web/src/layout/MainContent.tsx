import { useState } from 'react';
import { ListView } from '../features/library/ListView';
import { InboxView } from '../features/inbox/InboxView';
import { SettingsView } from '../features/settings/SettingsView';
import type { PromptEntity } from '@pah/contracts';

type ViewMode = 'list' | 'board';
type SidebarSection = 'library' | 'inbox' | 'archive' | 'settings';

interface MainContentProps {
  section: SidebarSection;
  viewMode: ViewMode;
  onViewModeChange: (mode: ViewMode) => void;
  onSelectPrompt: (prompt: PromptEntity | null) => void;
  selectedPromptId: string | null;
}

export function MainContent({
  section,
  viewMode,
  onViewModeChange,
  onSelectPrompt,
  selectedPromptId,
}: MainContentProps) {
  const [searchQuery, setSearchQuery] = useState('');

  return (
    <div className="flex-1 flex flex-col h-full overflow-hidden">
      {/* Header with search and view controls */}
      <div className="border-b border-subtle p-4 bg-white">
        <div className="flex items-center justify-between gap-4">
          {/* Search */}
          <div className="flex-1 max-w-md">
            <input
              type="text"
              placeholder="搜尋提示詞..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full px-3 py-2 border border-subtle rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* View Mode Toggle */}
          {section === 'library' && (
            <div className="flex gap-1 border border-subtle rounded-md p-1">
              <button
                onClick={() => onViewModeChange('list')}
                className={`px-3 py-1 rounded text-sm ${
                  viewMode === 'list'
                    ? 'bg-white shadow-sm font-medium'
                    : 'text-secondary hover:bg-hover'
                }`}
              >
                列表
              </button>
              <button
                onClick={() => onViewModeChange('board')}
                className={`px-3 py-1 rounded text-sm ${
                  viewMode === 'board'
                    ? 'bg-white shadow-sm font-medium'
                    : 'text-secondary hover:bg-hover'
                }`}
              >
                看板
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Content Area */}
      <div className="flex-1 overflow-auto">
        {section === 'library' && (
          <ListView
            viewMode={viewMode}
            searchQuery={searchQuery}
            onSelectPrompt={onSelectPrompt}
            selectedPromptId={selectedPromptId}
          />
        )}
        {section === 'inbox' && <InboxView />}
        {section === 'archive' && (
          <div className="p-8 text-center text-secondary">
            封存功能開發中...
          </div>
        )}
        {section === 'settings' && <SettingsView />}
      </div>
    </div>
  );
}

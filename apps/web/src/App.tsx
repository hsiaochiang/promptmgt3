import { useState } from 'react';
import { Sidebar } from './layout/Sidebar';
import { MainContent } from './layout/MainContent';
import { DetailPanel } from './layout/DetailPanel';
import { BackupStatusBanner } from './features/backup/BackupStatusBanner';
import { PrototypeGlobalStyles } from './ui/PrototypeGlobalStyles';
import type { PromptEntity } from '@pah/contracts';

type ViewMode = 'list' | 'board';
type SidebarSection = 'library' | 'inbox' | 'trash' | 'archive' | 'history' | 'settings';

export interface AppState {
  currentSection: SidebarSection;
  viewMode: ViewMode;
  selectedPromptId: string | null;
  selectedPrompt: PromptEntity | null;
}

function App() {
  const [state, setState] = useState<AppState>({
    currentSection: 'library',
    viewMode: 'list',
    selectedPromptId: null,
    selectedPrompt: null,
  });

  const handleSectionChange = (section: SidebarSection) => {
    setState(prev => ({
      ...prev,
      currentSection: section,
      selectedPromptId: null,
      selectedPrompt: null,
    }));
  };

  const handleViewModeChange = (mode: ViewMode) => {
    setState(prev => ({ ...prev, viewMode: mode }));
  };

  const handleSelectPrompt = (prompt: PromptEntity | null) => {
    setState(prev => ({
      ...prev,
      selectedPromptId: prompt?.id || null,
      selectedPrompt: prompt,
    }));
  };

  return (
    <div className="flex flex-row h-screen bg-white font-sans text-gray-900 selection:bg-[#CDE8F0] relative">
      <PrototypeGlobalStyles />
      
      {/* Sidebar - Left Column (basis-60 or w-64) */}
      <Sidebar
        currentSection={state.currentSection}
        onSectionChange={handleSectionChange}
      />

      {/* List - Middle Column (flex-[1.2]) */}
      <div className="flex-[1.2] flex flex-col overflow-hidden border-r border-gray-200">
        {/* Backup Status Banner */}
        <BackupStatusBanner />
        
        <MainContent
          section={state.currentSection}
          viewMode={state.viewMode}
          onViewModeChange={handleViewModeChange}
          onSelectPrompt={handleSelectPrompt}
          selectedPromptId={state.selectedPromptId}
        />
      </div>

      {/* Detail - Right Column (flex-[1.8]) */}
      {state.selectedPrompt ? (
        <div className="flex-[1.8] overflow-hidden">
          <DetailPanel
            prompt={state.selectedPrompt}
            onClose={() => handleSelectPrompt(null)}
            onUpdate={(updated) => setState(prev => ({ ...prev, selectedPrompt: updated }))}
          />
        </div>
      ) : (
        <div className="flex-[1.8] bg-gray-50 flex items-center justify-center text-gray-400 text-xs">
          選擇項目以檢視詳細資料
        </div>
      )}
    </div>
  );
}

export default App;

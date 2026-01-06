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
    <div className="flex h-screen bg-white font-sans text-gray-900 selection:bg-[#CDE8F0] relative">
      <PrototypeGlobalStyles />
      {/* Sidebar */}
      <Sidebar
        currentSection={state.currentSection}
        onSectionChange={handleSectionChange}
      />

      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Backup Status Banner */}
        <BackupStatusBanner />

        {/* Main Content Area */}
        <div className="flex-1 flex overflow-hidden">
          <MainContent
            section={state.currentSection}
            viewMode={state.viewMode}
            onViewModeChange={handleViewModeChange}
            onSelectPrompt={handleSelectPrompt}
            selectedPromptId={state.selectedPromptId}
          />

          {/* Detail Panel - Right Side */}
          {state.selectedPrompt && (
            <DetailPanel
              prompt={state.selectedPrompt}
              onClose={() => handleSelectPrompt(null)}
              onUpdate={(updated) => setState(prev => ({ ...prev, selectedPrompt: updated }))}
            />
          )}
        </div>
      </div>
    </div>
  );
}

export default App;

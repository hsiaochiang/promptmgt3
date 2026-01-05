import { useState } from 'react';
import { Sidebar } from './layout/Sidebar';
import { MainContent } from './layout/MainContent';
import { DetailPanel } from './layout/DetailPanel';
import type { PromptEntity } from '@pah/contracts';

type ViewMode = 'list' | 'board';
type SidebarSection = 'library' | 'inbox' | 'archive' | 'settings';

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
    <div className="flex h-screen bg-white text-gray-900">
      {/* Sidebar */}
      <Sidebar
        currentSection={state.currentSection}
        onSectionChange={handleSectionChange}
      />

      {/* Main Content Area */}
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
  );
}

export default App;

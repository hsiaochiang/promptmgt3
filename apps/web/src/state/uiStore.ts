import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { updateSettings, getSettings } from '../features/settings/api';

export type ActiveSection = 'projects' | 'prompts' | 'inbox' | 'archive' | 'trash' | 'clipboard' | 'settings';
export type SubView = 'list' | 'board' | 'archive';
export type SelectedItem =
  | { type: 'project' | 'prompt' | 'snippet'; id: string }
  | null;

interface UiState {
  activeSection: ActiveSection;
  projectSubView: SubView;
  promptSubView: SubView;
  selectedItem: SelectedItem;
  isSidebarOpen: boolean;
  expandedProjects: string[];
  searchQuery: string;

  // Actions
  setActiveSection: (section: ActiveSection) => void;
  setProjectSubView: (subView: SubView) => void;
  setPromptSubView: (subView: SubView) => void;
  setSelectedItem: (item: SelectedItem) => void;
  closePanel: () => void;
  setSearchQuery: (query: string) => void;
  toggleSidebar: () => void;
  setExpandedProjects: (ids: string[]) => void;
  toggleProjectExpanded: (projectId: string) => void;

  // Sync
  initFromBackend: () => Promise<void>;
}

// Helper to debounce or just fire-and-forget
const syncPreferences = (state: Partial<UiState>) => {
  // We construct the partial update object
  const preferences: any = {};
  if (state.activeSection) preferences.activeSection = state.activeSection;
  if (state.projectSubView) preferences.projectSubView = state.projectSubView;
  if (state.promptSubView) preferences.promptSubView = state.promptSubView;
  if (state.isSidebarOpen !== undefined) preferences.sidebarOpen = state.isSidebarOpen;

  updateSettings({
    uiPreferences: preferences
  }).catch(err => console.error('Failed to sync UI preferences:', err));
};

export const useUiStore = create<UiState>()(persist((set, get) => ({
  activeSection: 'projects',
  projectSubView: 'list',
  promptSubView: 'list',
  selectedItem: null,
  isSidebarOpen: true,
  expandedProjects: [],
  searchQuery: '',

  setActiveSection: (activeSection) => {
    set({ activeSection, selectedItem: null });
    syncPreferences({ activeSection });
  },
  setProjectSubView: (projectSubView) => {
    set({ projectSubView, selectedItem: null });
    syncPreferences({ projectSubView });
  },
  setPromptSubView: (promptSubView) => {
    set({ promptSubView, selectedItem: null });
    syncPreferences({ promptSubView });
  },
  setSelectedItem: (selectedItem) => set({ selectedItem }),
  closePanel: () => set({ selectedItem: null }),
  toggleSidebar: () => {
    const next = !get().isSidebarOpen;
    set({ isSidebarOpen: next });
    syncPreferences({ isSidebarOpen: next });
  },
  setExpandedProjects: (expandedProjects) => set({ expandedProjects }),
  toggleProjectExpanded: (projectId) => {
    const current = get().expandedProjects;
    set({
      expandedProjects: current.includes(projectId)
        ? current.filter((id) => id !== projectId)
        : [...current, projectId],
    });
  },
  setSearchQuery: (searchQuery) => set({ searchQuery }),

  initFromBackend: async () => {
    try {
      const settings = await getSettings();
      if (settings.uiPreferences) {
        const p = settings.uiPreferences;
        set({
          activeSection: (p.activeSection as ActiveSection) || 'projects',
          projectSubView: (p.projectSubView as SubView) || 'list',
          promptSubView: (p.promptSubView as SubView) || 'list',
          isSidebarOpen: p.sidebarOpen ?? true,
        });
      }
    } catch (err) {
      console.error('Failed to load settings:', err);
    }
  }
}), {
  name: 'ui-storage',
  partialize: (state) => ({
    activeSection: state.activeSection,
    projectSubView: state.projectSubView,
    promptSubView: state.promptSubView,
    isSidebarOpen: state.isSidebarOpen,
    expandedProjects: state.expandedProjects,
  }),
}));

import { create } from 'zustand';
import { persist } from 'zustand/middleware';

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

  setActiveSection: (section: ActiveSection) => void;
  setProjectSubView: (subView: SubView) => void;
  setPromptSubView: (subView: SubView) => void;
  setSelectedItem: (item: SelectedItem) => void;
  closePanel: () => void;
  toggleSidebar: () => void;
  setExpandedProjects: (ids: string[]) => void;
  toggleProjectExpanded: (projectId: string) => void;
  setSearchQuery: (value: string) => void;
}

export const useUiStore = create<UiState>()(persist((set, get) => ({
  activeSection: 'projects',
  projectSubView: 'list',
  promptSubView: 'list',
  selectedItem: null,
  isSidebarOpen: true,
  expandedProjects: [],
  searchQuery: '',

  setActiveSection: (activeSection) => set({ activeSection, selectedItem: null }),
  setProjectSubView: (projectSubView) => set({ projectSubView, selectedItem: null }),
  setPromptSubView: (promptSubView) => set({ promptSubView, selectedItem: null }),
  setSelectedItem: (selectedItem) => set({ selectedItem }),
  closePanel: () => set({ selectedItem: null }),
  toggleSidebar: () => set((s) => ({ isSidebarOpen: !s.isSidebarOpen })),
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

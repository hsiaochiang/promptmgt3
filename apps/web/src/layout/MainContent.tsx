import { useCallback, useEffect, useRef, useState, type ComponentType, type ReactNode } from 'react';
import { Kanban, List as ListIcon, Search, X, Plus } from 'lucide-react';
import { createProject, createPrompt, getProjects } from '../features/library/api';
import { ProjectView } from './ProjectView';
import { PromptView } from './PromptView';
import { SettingsView } from '../features/settings/SettingsView';
import { InboxView } from '../features/inbox/InboxView';
import { ArchiveView } from '../features/archive/ArchiveView';
import { TrashView } from '../features/trash/TrashView';
import { ClipboardView } from '../features/clipboard/ClipboardView';
import type { ActiveSection } from '../state/uiStore';
import { useUiStore } from '../state/uiStore';

interface MainContentProps {
  activeSection: ActiveSection;
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
    className={`flex items-center gap-2 px-2 py-1 rounded-[3px] text-base transition-colors duration-200 
      ${active ? 'bg-gray-200 text-gray-900 font-medium' : 'text-gray-500 hover:bg-gray-100 hover:text-gray-900'} 
      ${className}`}
  >
    {Icon && <Icon size={16} />}
    {children}
  </button>
);

const actionButtonClass =
  'flex items-center gap-1 text-base bg-blue-500 hover:bg-blue-600 text-white px-3 py-1.5 rounded transition-colors shadow-sm leading-none focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-200 focus-visible:ring-offset-1';

const ExpandableSearch = ({
  value,
  onChange,
  placeholder,
  getScroller,
}: {
  value: string;
  onChange: (next: string) => void;
  placeholder: string;
  getScroller?: () => HTMLElement | null;
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const inputRef = useRef<HTMLInputElement | null>(null);

  const preserveOuterScroll = useCallback(
    (fn: () => void) => {
      const scroller = getScroller?.() ?? null;
      const top = scroller?.scrollTop ?? 0;
      const docScroller = document.scrollingElement as HTMLElement | null;
      const docTop = docScroller?.scrollTop ?? 0;

      fn();

      requestAnimationFrame(() => {
        if (scroller) scroller.scrollTop = top;
        if (docScroller) docScroller.scrollTop = docTop;
      });
    },
    [getScroller],
  );

  useEffect(() => {
    if (isExpanded && inputRef.current) {
      const scroller = getScroller?.() ?? null;
      const top = scroller?.scrollTop ?? 0;
      const docScroller = document.scrollingElement as HTMLElement | null;
      const docTop = docScroller?.scrollTop ?? 0;

      try {
        inputRef.current.focus({ preventScroll: true });
      } catch {
        inputRef.current.focus();
      }

      requestAnimationFrame(() => {
        if (scroller) scroller.scrollTop = top;
        if (docScroller) docScroller.scrollTop = docTop;
      });
    }
  }, [getScroller, isExpanded]);

  const handleBlur = () => {
    if (!value) {
      preserveOuterScroll(() => setIsExpanded(false));
    }
  };

  const handleClear = () => {
    preserveOuterScroll(() => {
      onChange('');
      setIsExpanded(false);
    });
  };

  return (
    <div className="relative h-8 w-56 flex-shrink-0">
      <button
        onMouseDown={(e) => e.preventDefault()}
        onClick={() => preserveOuterScroll(() => setIsExpanded(true))}
        className={`absolute inset-0 rounded bg-gray-100 flex items-center justify-center transition-opacity duration-200 ${
          isExpanded ? 'opacity-0 pointer-events-none' : 'opacity-100'
        }`}
        title="搜尋"
        type="button"
      >
        <Search size={18} className="text-gray-500" />
      </button>

      <div
        className={`absolute inset-0 flex items-center gap-2 px-2 bg-gray-100 rounded transition-opacity duration-200 ${
          isExpanded ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
        }`}
      >
        <Search size={14} className="text-gray-500 flex-shrink-0" />
        <input
          ref={inputRef}
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onBlur={handleBlur}
          className="w-full bg-transparent border-none text-sm text-gray-700 focus:ring-0 px-2 py-1 placeholder-gray-400"
          placeholder={placeholder}
        />
        <button
          onMouseDown={(e) => e.preventDefault()}
          onClick={handleClear}
          className="text-gray-400 hover:text-gray-600"
          title="清除"
          type="button"
        >
          <X size={12} />
        </button>
      </div>
    </div>
  );
};

export function MainContent({ activeSection }: MainContentProps) {
  const {
    projectSubView,
    promptSubView,
    setProjectSubView,
    setPromptSubView,
    searchQuery,
    setSearchQuery,
    setSelectedItem
  } = useUiStore();

  const handleCreateProject = async () => {
    try {
      // Create new project with 'planned' status (default)
      const newProject = await createProject({ title: '新增專案', status: 'planned' });
      // Open in side panel
      setSelectedItem({ type: 'project', id: newProject.id });
      // Dispatch event to refresh lists
      window.dispatchEvent(new CustomEvent('entity-change'));
    } catch (err: any) {
      alert('Failed to create project: ' + err.message);
    }
  };
  const handleCreatePrompt = async () => {
    try {
      // Find a default project ID (first one available) for the new prompt
      // We need to fetch projects here or assume we have them in store (store doesn't seem to have full list readily available without hook)
      // Simpler: just fetch projects quickly
      const projects = await getProjects();
      const defaultProjectId = projects.length > 0 ? projects[0].id : '';

      if (!defaultProjectId) {
        alert('Please create a project first before adding prompts.');
        return;
      }

      const newPrompt = await createPrompt({
        title: '新增提示詞',
        projectId: defaultProjectId,
        tags: [],
        status: 'draft',
        priority: 'medium',
        category: ''
      });

      setSelectedItem({ type: 'prompt', id: newPrompt.id });
      window.dispatchEvent(new CustomEvent('entity-change'));
    } catch (err: any) {
      alert('Failed to create prompt: ' + err.message);
    }
  };

  const handleClipboardNew = () => {
    window.dispatchEvent(new CustomEvent('clipboard-new'));
  };

  const title =
    activeSection === 'projects'
      ? '專案管理'
      : activeSection === 'prompts'
        ? '提示詞管理'
        : activeSection === 'inbox'
          ? '暫存區'
          : activeSection === 'archive'
            ? '已封存資產'
            : activeSection === 'trash'
              ? '回收站'
              : activeSection === 'clipboard'
                ? '剪貼簿'
                : '設定';

  // 簡單的 View Mode 切換邏輯
  const currentSubView = activeSection === 'projects' ? projectSubView : promptSubView;
  const setSubView = activeSection === 'projects' ? setProjectSubView : setPromptSubView;
  const showViewToggle = activeSection === 'projects' || activeSection === 'prompts';
  const contentScrollRef = useRef<HTMLDivElement | null>(null);

  return (
    <div className="h-full flex-1 min-w-0 flex flex-col bg-white overflow-hidden">
      {/* Header & Tabs - Prototype style */}
      <div className="px-8 pt-8 pb-4 flex-shrink-0">
        <div className="flex justify-between items-end mb-6">
          <h1 className="text-3xl font-bold text-gray-900">{title}</h1>
        </div>

        <div className="flex justify-between items-center border-b border-gray-100 pb-1">
          <div className="flex gap-1">
            {showViewToggle && (
              <>
                <GhostButton
                  active={currentSubView === 'list'}
                  onClick={() => setSubView('list')}
                  icon={ListIcon}
                >
                  列表
                </GhostButton>
                <GhostButton
                  active={currentSubView === 'board'}
                  onClick={() => setSubView('board')}
                  icon={Kanban}
                >
                  看板
                </GhostButton>
              </>
            )}
          </div>

          <div className="flex items-center gap-3">
            <ExpandableSearch
              value={searchQuery}
              onChange={setSearchQuery}
              placeholder={`搜尋${title}...`}
              getScroller={() => contentScrollRef.current}
            />
            {activeSection === 'projects' && (
              <button onClick={handleCreateProject} className={actionButtonClass}>
                <Plus size={16} />
                <span className="font-medium">新增</span>
              </button>
            )}
            {activeSection === 'prompts' && (
              <button onClick={handleCreatePrompt} className={actionButtonClass}>
                <Plus size={16} />
                <span className="font-medium">新增</span>
              </button>
            )}
            {activeSection === 'clipboard' && (
              <button onClick={handleClipboardNew} className={actionButtonClass}>
                <Plus size={16} />
                <span className="font-medium">新增</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Content */}
      <div ref={contentScrollRef} className="flex-1 overflow-y-auto overflow-x-hidden custom-scrollbar bg-white">
        {activeSection === 'projects' && <ProjectView />}
        {activeSection === 'prompts' && <PromptView />}
        {activeSection === 'inbox' && <InboxView />}
        {activeSection === 'archive' && <ArchiveView />}
        {activeSection === 'trash' && <TrashView />}
        {activeSection === 'clipboard' && <ClipboardView />}
        {activeSection === 'settings' && <SettingsView />}
      </div>
    </div>
  );
}

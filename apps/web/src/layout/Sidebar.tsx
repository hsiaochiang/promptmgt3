import { Layout, Kanban, List as ListIcon, Clipboard, Settings, ChevronRight } from 'lucide-react';
import { useUiStore } from '../state/uiStore';

// Helper components
const NavItem = ({ icon: Icon, label, isActive, onClick, isCollapsed }: any) => (
  <button
    onClick={onClick}
    className={`w-full flex items-center gap-2 px-3 py-1 mb-0.5 rounded-[3px] text-sm transition-colors ${
      isActive ? 'bg-[#E3E3E1] text-gray-900 font-medium' : 'text-gray-600 hover:bg-[#EAEAEA]'
    }`}
    title={isCollapsed ? label : ''}
  >
    <Icon size={18} className={isActive ? 'text-gray-800' : 'text-gray-500'} />
    {!isCollapsed && <span className="truncate">{label}</span>}
  </button>
);

const SectionHeader = ({ label, isCollapsed }: any) => {
  if (isCollapsed) return <div className="h-4"></div>;
  return (
    <div className="px-3 py-2 mt-4 mb-1 text-xs font-bold text-gray-500 uppercase tracking-wide">
      {label}
    </div>
  );
};

export function Sidebar() {
  const {
    activeSection,
    projectSubView,
    promptSubView,
    isSidebarOpen,
    setActiveSection,
    setProjectSubView,
    setPromptSubView,
    toggleSidebar,
  } = useUiStore();

  return (
    <aside
      className={`flex-shrink-0 bg-[#F7F7F5] flex flex-col transition-all duration-300 ${
        isSidebarOpen ? 'w-60' : 'w-12'
      } overflow-hidden border-r border-gray-200`}
    >
      <div className="h-12 flex items-center px-4 hover:bg-gray-200/50 cursor-pointer transition-colors m-2 rounded">
        <div
          className={`font-bold text-sm text-gray-800 flex items-center gap-2 truncate ${
            !isSidebarOpen && 'hidden'
          }`}
        >
          <div className="w-5 h-5 bg-gray-800 rounded flex items-center justify-center text-white text-[10px]">
            P
          </div>
          我的工作區
        </div>
        <button
          onClick={toggleSidebar}
          className={`ml-auto p-1 text-gray-400 hover:text-gray-600 rounded ${
            !isSidebarOpen && 'w-full flex justify-center'
          }`}
        >
          {isSidebarOpen ? (
            <ChevronRight size={16} className="rotate-180" />
          ) : (
            <ChevronRight size={16} />
          )}
        </button>
      </div>

      <nav className="flex-1 px-2 py-2 overflow-y-auto custom-scrollbar">
        <SectionHeader label="Projects" isCollapsed={!isSidebarOpen} />
        <NavItem
          icon={Layout}
          label="專案列表"
          isActive={activeSection === 'projects' && projectSubView === 'list'}
          isCollapsed={!isSidebarOpen}
          onClick={() => { setActiveSection('projects'); setProjectSubView('list'); }}
        />
        <NavItem
          icon={Kanban}
          label="專案看板"
          isActive={activeSection === 'projects' && projectSubView === 'board'}
          isCollapsed={!isSidebarOpen}
          onClick={() => { setActiveSection('projects'); setProjectSubView('board'); }}
        />

        <SectionHeader label="Prompts" isCollapsed={!isSidebarOpen} />
        <NavItem
          icon={ListIcon}
          label="提示詞列表"
          isActive={activeSection === 'prompts' && promptSubView === 'list'}
          isCollapsed={!isSidebarOpen}
          onClick={() => { setActiveSection('prompts'); setPromptSubView('list'); }}
        />
        <NavItem
          icon={Kanban}
          label="提示詞看板"
          isActive={activeSection === 'prompts' && promptSubView === 'board'}
          isCollapsed={!isSidebarOpen}
          onClick={() => { setActiveSection('prompts'); setPromptSubView('board'); }}
        />

        <SectionHeader label="Tools" isCollapsed={!isSidebarOpen} />
        <NavItem
          icon={Clipboard}
          label="剪貼簿"
          isActive={activeSection === 'clipboard'}
          isCollapsed={!isSidebarOpen}
          onClick={() => setActiveSection('clipboard')}
        />
        <NavItem
          icon={Settings}
          label="設定"
          isActive={activeSection === 'settings'}
          isCollapsed={!isSidebarOpen}
          onClick={() => setActiveSection('settings')}
        />
      </nav>
    </aside>
  );
}
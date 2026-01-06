import { useState, type ComponentType } from 'react';
import {
  Layout,
  Clipboard,
  Settings,
  ChevronRight,
  Trash2,
  History,
  Archive,
  Inbox,
} from 'lucide-react';

type SidebarSection = 'library' | 'inbox' | 'trash' | 'archive' | 'history' | 'settings';

interface SidebarProps {
  currentSection: SidebarSection;
  onSectionChange: (section: SidebarSection) => void;
}

const NavItem = ({
  icon: Icon,
  label,
  isActive,
  onClick,
  isCollapsed,
}: {
  icon: ComponentType<{ size?: number | string; className?: string }>;
  label: string;
  isActive: boolean;
  onClick: () => void;
  isCollapsed: boolean;
}) => (
  <button
    onClick={onClick}
    className={`w-full flex items-center gap-2 px-3 py-1 mb-0.5 rounded-[3px] text-xs transition-colors ${
      isActive
        ? 'bg-slate-900 text-white font-medium'
        : 'text-gray-600 hover:bg-[#EAEAEA]'
    }`}
    title={isCollapsed ? label : ''}
  >
    <Icon size={18} className={isActive ? 'text-white' : 'text-gray-500'} />
    {!isCollapsed && <span className="truncate">{label}</span>}
  </button>
);

const SectionHeader = ({ label, isCollapsed }: { label: string; isCollapsed: boolean }) => {
  if (isCollapsed) return <div className="h-4"></div>;
  return (
    <div className="px-3 py-2 mt-4 mb-1 text-xs font-bold text-gray-500 uppercase tracking-wide">
      {label}
    </div>
  );
};

export function Sidebar({ currentSection, onSectionChange }: SidebarProps) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  return (
    <aside
      className={`flex-shrink-0 bg-[#F7F7F5] flex flex-col transition-all duration-300 ${
        isSidebarOpen ? 'w-60' : 'w-12'
      } overflow-hidden`}
    >
      <div className="h-12 flex items-center px-4 hover:bg-gray-200/50 cursor-pointer transition-colors m-2 rounded">
        <div
          className={`font-bold text-xs text-gray-800 flex items-center gap-2 truncate ${
            !isSidebarOpen && 'hidden'
          }`}
        >
          <div className="w-5 h-5 bg-gray-800 rounded flex items-center justify-center text-white text-[10px]">
            P
          </div>
          我的工作區
        </div>
        <button
          onClick={() => setIsSidebarOpen(!isSidebarOpen)}
          className={`ml-auto p-1 text-gray-400 hover:text-gray-600 rounded ${
            !isSidebarOpen && 'w-full flex justify-center'
          }`}
        >
          {isSidebarOpen ? <ChevronRight size={16} className="rotate-180" /> : <ChevronRight size={16} />}
        </button>
      </div>

      <nav className="flex-1 px-2 py-2 overflow-y-auto custom-scrollbar">
        <SectionHeader label="Library" isCollapsed={!isSidebarOpen} />
        <NavItem
          icon={Layout}
          label="資料庫"
          isActive={currentSection === 'library'}
          isCollapsed={!isSidebarOpen}
          onClick={() => onSectionChange('library')}
        />

        <SectionHeader label="Inbox" isCollapsed={!isSidebarOpen} />
        <NavItem
          icon={Inbox}
          label="暫存區"
          isActive={currentSection === 'inbox'}
          isCollapsed={!isSidebarOpen}
          onClick={() => onSectionChange('inbox')}
        />

        <SectionHeader label="Storage" isCollapsed={!isSidebarOpen} />
        <NavItem
          icon={Trash2}
          label="回收站"
          isActive={currentSection === 'trash'}
          isCollapsed={!isSidebarOpen}
          onClick={() => onSectionChange('trash')}
        />
        <NavItem
          icon={Archive}
          label="封存"
          isActive={currentSection === 'archive'}
          isCollapsed={!isSidebarOpen}
          onClick={() => onSectionChange('archive')}
        />

        <SectionHeader label="Tools" isCollapsed={!isSidebarOpen} />
        <NavItem
          icon={History}
          label="歷史記錄"
          isActive={currentSection === 'history'}
          isCollapsed={!isSidebarOpen}
          onClick={() => onSectionChange('history')}
        />
        <NavItem
          icon={Clipboard}
          label="剪貼簿"
          isActive={false}
          isCollapsed={!isSidebarOpen}
          onClick={() => {}}
        />
        <NavItem
          icon={Settings}
          label="設定"
          isActive={currentSection === 'settings'}
          isCollapsed={!isSidebarOpen}
          onClick={() => onSectionChange('settings')}
        />
      </nav>
    </aside>
  );
}

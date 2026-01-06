type SidebarSection = 'library' | 'inbox' | 'trash' | 'archive' | 'history' | 'settings';

interface SidebarProps {
  currentSection: SidebarSection;
  onSectionChange: (section: SidebarSection) => void;
}

export function Sidebar({ currentSection, onSectionChange }: SidebarProps) {
  const sections: { id: SidebarSection; label: string; icon: string }[] = [
    { id: 'library', label: '資料庫', icon: '📚' },
    { id: 'inbox', label: '暫存區', icon: '📥' },
    { id: 'trash', label: '回收站', icon: '🗑️' },
    { id: 'archive', label: '封存', icon: '📦' },
    { id: 'history', label: '歷史記錄', icon: '🕐' },
    { id: 'settings', label: '設定', icon: '⚙️' },
  ];

  return (
    <div className="w-60 border-r border-subtle bg-subtle flex flex-col h-full">
      {/* Header */}
      <div className="p-4 border-b border-subtle">
        <h1 className="text-lg font-semibold">Prompt Asset Hub</h1>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-2">
        {sections.map((section) => (
          <button
            key={section.id}
            onClick={() => onSectionChange(section.id)}
            className={`
              w-full px-3 py-2 rounded-md text-left flex items-center gap-2
              transition-colors
              ${
                currentSection === section.id
                  ? 'bg-white shadow-sm font-medium'
                  : 'hover:bg-hover text-secondary'
              }
            `}
          >
            <span className="text-base">{section.icon}</span>
            <span className="text-sm">{section.label}</span>
          </button>
        ))}
      </nav>

      {/* Footer */}
      <div className="p-4 border-t border-subtle text-xs text-tertiary">
        <div>版本 0.1.0</div>
      </div>
    </div>
  );
}

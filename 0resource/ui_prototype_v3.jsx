/**
 * 專案與提示詞管理工具 (Project & Prompt Manager)
 * * 開發環境安裝指南 (Setup Guide):
 * 1. 建立專案: npm create vite@latest my-prompt-manager -- --template react
 * 2. 安裝依賴: npm install lucide-react tailwindcss postcss autoprefixer
 * 3. 初始化 Tailwind: npx tailwindcss init -p
 * 4. 設定 Tailwind: 修改 tailwind.config.js 的 content 欄位，加入 src 目錄下所有 js/jsx/ts/tsx 檔案。
 * 5. 設定 CSS: 在 src/index.css 加入 base, components, utilities 指令。
 * 6. 執行: npm run dev
 */

import React, { useState, useEffect, useRef } from 'react';
import { 
  Layout, 
  FileText, 
  Kanban, 
  Clipboard, 
  Settings, 
  Plus, 
  Search, 
  MoreHorizontal, 
  X, 
  ChevronRight, 
  ChevronDown, 
  Tag, 
  Calendar,
  Save,
  Copy,
  FolderOpen,
  Trash2,
  CheckCircle,
  Archive,
  RotateCcw,
  List as ListIcon,
  Maximize2,
  Minimize2,
  Link as LinkIcon,
  Cpu,
  File as FileIcon,
  Edit2,
  ExternalLink
} from 'lucide-react';

// --- Global Styles for Animations & Scrollbar ---
const GlobalStyles = () => (
  <style>{`
    @keyframes fade-in-up {
      from { opacity: 0; transform: translate(-50%, 20px); }
      to { opacity: 1; transform: translate(-50%, 0); }
    }
    .animate-fade-in-up {
      animation: fade-in-up 0.3s ease-out forwards;
    }
    @keyframes slide-in-right {
      from { transform: translateX(100%); }
      to { transform: translateX(0); }
    }
    .animate-slide-in-right {
      animation: slide-in-right 0.3s ease-out forwards;
    }
    .custom-scrollbar::-webkit-scrollbar {
      width: 6px;
      height: 6px;
    }
    .custom-scrollbar::-webkit-scrollbar-track {
      background: transparent;
    }
    .custom-scrollbar::-webkit-scrollbar-thumb {
      background: #E5E7EB;
      border-radius: 3px;
    }
    .custom-scrollbar::-webkit-scrollbar-thumb:hover {
      background: #D1D5DB;
    }
  `}</style>
);

// --- Utility Functions ---
const generateId = () => Math.random().toString(36).substr(2, 9);
const getNowString = () => new Date().toISOString().split('T')[0];

// --- Constants ---
const PROJECT_TYPES = [
  '對外簡報',
  '內部工具',
  '客戶專案',
  '教學課程',
  '個人研究',
  '其他'
];

const PROMPT_MODELS = [
  'GPT-4o',
  'GPT-4 Turbo',
  'Claude 3.5 Sonnet',
  'Claude 3 Opus',
  'Gemini 1.5 Pro',
  'Gemini 1.5 Flash',
  'Llama 3',
  'Midjourney',
  'Other'
];

const TAG_CATEGORIES = {
  platform: '平台標籤',
  deliverable: '交付物標籤',
  audience: '受眾標籤',
  common: '共通標籤'
};

// --- Initial Data ---
const INITIAL_PROJECTS = [
  { 
    id: 'p1', 
    title: 'AI 客服自動化 Agent', 
    status: 'in_progress', 
    projectType: '內部工具',
    summary: '利用 LLM 技術，針對公司內部常見的 IT 報修問題，建立自動化的初步診斷與回覆系統，目標減少 30% 人力負荷。',
    description: '詳細規格書與流程圖請參考附件。',
    tags: [
      { text: 'RAG', category: 'common' }, 
      { text: 'Line', category: 'platform' },
      { text: 'IT人員', category: 'audience' }
    ],
    files: [
      { id: 'f1', name: '需求規格書_v1.0.pdf' },
      { id: 'f2', name: '流程架構圖.png' }
    ],
    updatedAt: '2024-01-02',
    archived: false
  },
  { 
    id: 'p2', 
    title: '2024 Q1 行銷文案助手', 
    status: 'planned', 
    projectType: '教學課程',
    summary: '為行銷部門設計的一套提示詞模板庫，包含社群貼文、EDM 與廣告短語。',
    description: '',
    tags: [
      { text: 'Marketing', category: 'common' }, 
      { text: 'Instagram', category: 'platform' }
    ],
    files: [],
    updatedAt: '2023-12-28',
    archived: false
  },
  { 
    id: 'p3', 
    title: '2023 舊版知識庫 (已封存)', 
    status: 'done', 
    projectType: '個人研究',
    summary: '舊版資料封存。',
    description: '舊版資料，僅供參考。',
    tags: [{ text: 'Legacy', category: 'common' }],
    files: [],
    updatedAt: '2023-01-01',
    archived: true
  },
];

const INITIAL_PROMPTS = [
  { 
    id: 'pr1', 
    projectId: 'p1', 
    title: '客服情緒分析', 
    status: 'ready', 
    tags: [{ text: 'Analysis', category: 'common' }], 
    priority: 'high',
    model: 'GPT-4o',
    link: 'https://chatgpt.com/share/xxxx-xxxx',
    note: '測試結果：對於諷刺語氣的辨識度在 GPT-4 上表現最好。',
    content: '# 角色設定\n你是一位資深的客戶服務專家，擅長情緒分析。\n\n# 任務\n分析以下客戶對話的情緒極性，並給出 1-5 分的評分。\n\n# 輸出格式\n- 分數: <score>\n- 原因: <reason>',
    updatedAt: '2024-01-02',
    archived: false
  },
  { 
    id: 'pr2', 
    projectId: 'p1', 
    title: '自動回覆生成 - 退貨', 
    status: 'draft', 
    tags: [{ text: 'Generation', category: 'common' }], 
    priority: 'medium',
    model: 'Claude 3.5 Sonnet',
    link: '',
    note: '還需要調整語氣，目前太過生硬。',
    content: '# 任務\n根據公司的退貨政策，生成一封委婉但堅定的拒絕退貨信件。\n\n# 限制\n語氣必須保持禮貌。',
    updatedAt: '2024-01-01',
    archived: false
  },
  { 
    id: 'pr3', 
    projectId: 'p2', 
    title: 'Instagram 貼文生成', 
    status: 'ready', 
    tags: [{ text: 'Social', category: 'common' }], 
    priority: 'high',
    model: 'Gemini 1.5 Flash',
    link: '',
    note: '',
    content: '# 平台\nInstagram\n\n# 風格\n輕鬆、活潑、多用 emoji。',
    updatedAt: '2023-12-30',
    archived: false
  },
  { 
    id: 'pr4', 
    projectId: 'p3', 
    title: '舊版摘要提示詞', 
    status: 'deprecated', 
    tags: [], 
    priority: 'low',
    model: 'Other',
    link: '',
    note: '',
    content: '這是舊的。',
    updatedAt: '2023-01-01',
    archived: true
  },
];

const INITIAL_SNIPPETS = [
  { id: 's1', title: '角色：資深工程師', category: '角色設定', content: '你是一位擁有 10 年經驗的資深全端工程師，精通 React 與 Node.js。' },
  { id: 's2', title: '格式：Markdown 表格', category: '格式要求', content: '請以 Markdown 表格格式輸出結果，包含以下欄位：' },
  { id: 's3', title: '限制：繁體中文', category: '限制條件', content: '請使用台灣繁體中文回答，避免使用中國大陸用語。' },
];

// --- Components ---

// Button: Notion-style Ghost Button
const GhostButton = ({ children, onClick, className = "", icon: Icon, title, active }) => (
  <button 
    onClick={onClick}
    title={title}
    className={`flex items-center gap-2 px-2 py-1 rounded-[3px] text-sm transition-colors duration-200 
      ${active 
        ? 'bg-gray-200 text-gray-900 font-medium' 
        : 'text-gray-500 hover:bg-gray-100 hover:text-gray-900'} 
      ${className}`}
  >
    {Icon && <Icon size={16} />}
    {children}
  </button>
);

const Badge = ({ children, color = 'gray' }) => {
  const colors = {
    gray: 'bg-gray-100 text-gray-600',
    blue: 'bg-blue-50 text-blue-700',
    green: 'bg-green-50 text-green-700',
    yellow: 'bg-yellow-50 text-yellow-700',
    red: 'bg-red-50 text-red-700',
    purple: 'bg-purple-50 text-purple-700',
  };
  return (
    <span className={`px-1.5 py-0.5 rounded-[3px] text-xs font-medium ${colors[color] || colors.gray}`}>
      {children}
    </span>
  );
};

const StatusBadge = ({ status }) => {
  const styles = {
    in_progress: 'text-blue-700 bg-blue-50',
    planned: 'text-gray-600 bg-gray-100',
    paused: 'text-yellow-700 bg-yellow-50',
    ready: 'text-green-700 bg-green-50',
    draft: 'text-gray-500 bg-gray-50 border border-dashed border-gray-300',
    needs_review: 'text-orange-700 bg-orange-50',
    done: 'text-purple-700 bg-purple-50',
    deprecated: 'text-gray-400 bg-gray-100 line-through',
  };

  const labels = {
    in_progress: '進行中',
    planned: '規劃中',
    paused: '暫停',
    ready: '可用',
    draft: '草稿',
    needs_review: '待優化',
    done: '完成',
    deprecated: '停用',
  };

  return (
    <span className={`text-xs px-2 py-0.5 rounded-[3px] ${styles[status] || styles.planned}`}>
      {labels[status] || status}
    </span>
  );
};

const NavItem = ({ icon: Icon, label, isActive, onClick, isCollapsed }) => (
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

const SectionHeader = ({ label, isCollapsed }) => {
    if (isCollapsed) return <div className="h-4"></div>;
    return (
        <div className="px-3 py-2 mt-4 mb-1 text-xs font-bold text-gray-500 uppercase tracking-wide">
            {label}
        </div>
    )
}

// Search Component with Expand Logic
const ExpandableSearch = ({ value, onChange, placeholder }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const inputRef = useRef(null);

  useEffect(() => {
    if (isExpanded && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isExpanded]);

  const handleBlur = () => {
    if (!value) {
      setIsExpanded(false);
    }
  };

  return (
    <div className={`relative flex items-center transition-all duration-300 ${isExpanded ? 'w-48' : 'w-8'}`}>
      {isExpanded ? (
        <div className="absolute right-0 flex items-center bg-gray-100 rounded px-2 z-20">
           <Search size={14} className="text-gray-500 flex-shrink-0" />
           <input 
             ref={inputRef}
             type="text" 
             value={value}
             onChange={onChange}
             onBlur={handleBlur}
             className="w-full bg-transparent border-none text-sm text-gray-700 focus:ring-0 px-2 py-1 placeholder-gray-400"
             placeholder={placeholder}
           />
           <button onClick={() => { onChange({target: {value: ''}}); setIsExpanded(false); }} className="text-gray-400 hover:text-gray-600">
             <X size={12} />
           </button>
        </div>
      ) : (
        <button 
          onClick={() => setIsExpanded(true)} 
          className="p-1.5 text-gray-500 hover:bg-gray-100 rounded hover:text-gray-900 transition-colors"
          title="搜尋"
        >
          <Search size={18} />
        </button>
      )}
    </div>
  );
};


// --- Main Application ---

export default function App() {
  // Navigation State
  const [activeSection, setActiveSection] = useState('projects'); 
  const [projectSubView, setProjectSubView] = useState('list'); 
  const [promptSubView, setPromptSubView] = useState('list'); 
  const [selectedItem, setSelectedItem] = useState(null); 
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  
  // Data State
  const [projects, setProjects] = useState(INITIAL_PROJECTS);
  const [prompts, setPrompts] = useState(INITIAL_PROMPTS);
  const [snippets, setSnippets] = useState(INITIAL_SNIPPETS);
  const [expandedProjects, setExpandedProjects] = useState(INITIAL_PROJECTS.map(p => p.id));
  const [searchQuery, setSearchQuery] = useState('');
  const [notification, setNotification] = useState(null);

  // Derived Data Helpers
  const getFilteredProjects = (archivedOnly = false) => {
    let result = projects.filter(p => p.archived === archivedOnly);
    if (searchQuery) {
      const lowerQ = searchQuery.toLowerCase();
      result = result.filter(p => p.title.toLowerCase().includes(lowerQ) || p.tags.some(t => t.text.toLowerCase().includes(lowerQ)));
    }
    return result;
  };

  const getFilteredPrompts = (archivedOnly = false) => {
    let result = prompts.filter(p => p.archived === archivedOnly);
    if (searchQuery) {
      const lowerQ = searchQuery.toLowerCase();
      result = result.filter(p => p.title.toLowerCase().includes(lowerQ) || p.tags.some(t => t.text.toLowerCase().includes(lowerQ)));
    }
    return result;
  };

  const getGroupedPrompts = (projectList) => {
    const groups = {};
    projectList.forEach(p => {
      groups[p.id] = prompts.filter(pr => pr.projectId === p.id && pr.archived === p.archived);
    });
    return groups;
  };

  // --- Actions ---

  const showNotification = (message) => {
    setNotification(message);
    setTimeout(() => setNotification(null), 3000);
  };

  const handleToggleProject = (pid) => {
    setExpandedProjects(prev => 
      prev.includes(pid) ? prev.filter(id => id !== pid) : [...prev, pid]
    );
  };

  const handleSelectItem = (type, id) => {
    setSelectedItem({ type, id });
  };

  const handleNavigate = (section, subView = 'list') => {
    setActiveSection(section);
    if (section === 'projects') setProjectSubView(subView);
    if (section === 'prompts') setPromptSubView(subView);
    setSelectedItem(null); 
  };

  const closePanel = () => setSelectedItem(null);

  // CRUD Actions
  const handleCreateProject = () => {
    const newId = generateId();
    const newProject = {
      id: newId,
      title: '未命名專案',
      status: 'planned',
      projectType: '對外簡報',
      summary: '',
      description: '',
      tags: [],
      files: [],
      updatedAt: getNowString(),
      archived: false
    };
    setProjects([newProject, ...projects]);
    setExpandedProjects(prev => [...prev, newId]);
    setSelectedItem({ type: 'project', id: newId });
    showNotification('已新增專案');
  };

  const handleCreatePrompt = (projectId = null) => {
    const newId = generateId();
    const activeProjects = projects.filter(p => !p.archived);
    const targetProjectId = projectId || (activeProjects[0]?.id);
    
    if (!targetProjectId) {
      showNotification('無可用專案，請先建立專案');
      return;
    }

    const newPrompt = {
      id: newId,
      projectId: targetProjectId,
      title: '新提示詞',
      status: 'draft',
      tags: [],
      priority: 'medium',
      model: 'GPT-4o',
      link: '',
      note: '',
      content: '',
      updatedAt: getNowString(),
      archived: false
    };
    setPrompts([newPrompt, ...prompts]);
    setSelectedItem({ type: 'prompt', id: newId });
    showNotification('已新增提示詞');
  };

  const handleCreateSnippet = () => {
    const newId = generateId();
    const newSnippet = {
      id: newId,
      title: '新常用片語',
      category: '未分類',
      content: ''
    };
    setSnippets([newSnippet, ...snippets]);
    setSelectedItem({ type: 'snippet', id: newId });
    showNotification('已新增片語');
  };

  const handleUpdateItem = (type, updatedData) => {
    const now = getNowString();
    if (type === 'project') {
      setProjects(prev => prev.map(p => p.id === updatedData.id ? { ...updatedData, updatedAt: now } : p));
    } else if (type === 'prompt') {
      setPrompts(prev => prev.map(p => p.id === updatedData.id ? { ...updatedData, updatedAt: now } : p));
    } else if (type === 'snippet') {
      setSnippets(prev => prev.map(s => s.id === updatedData.id ? updatedData : s));
    }
    showNotification('儲存成功');
  };

  const handleToggleArchive = (type, id, currentArchivedStatus) => {
    const newStatus = !currentArchivedStatus;
    const now = getNowString();
    
    if (type === 'project') {
      setProjects(prev => prev.map(p => p.id === id ? { ...p, archived: newStatus, updatedAt: now } : p));
    } else if (type === 'prompt') {
      setPrompts(prev => prev.map(p => p.id === id ? { ...p, archived: newStatus, updatedAt: now } : p));
    }
    setSelectedItem(null);
    showNotification(newStatus ? '已封存' : '已還原');
  };

  const handleDeleteItem = (type, id) => {
    if (confirm('確定要永久刪除嗎？此動作無法復原。')) {
      if (type === 'project') {
        setProjects(prev => prev.filter(p => p.id !== id));
        setPrompts(prev => prev.filter(p => p.projectId !== id));
      } else if (type === 'prompt') {
        setPrompts(prev => prev.filter(p => p.id !== id));
      } else if (type === 'snippet') {
        setSnippets(prev => prev.filter(s => s.id !== id));
      }
      setSelectedItem(null);
      showNotification('已刪除');
    }
  };

  // --- View Components ---

  const ProjectSection = () => {
    const isArchivedView = projectSubView === 'archive';
    const displayProjects = getFilteredProjects(isArchivedView);
    const displayPromptsMap = getGroupedPrompts(displayProjects);

    return (
      <div className="w-full h-full flex flex-col bg-white">
        {/* Header & Tabs */}
        <div className="px-8 pt-8 pb-4 flex-shrink-0">
          <div className="flex justify-between items-end mb-6">
            <h1 className="text-3xl font-bold text-gray-900">
               {isArchivedView ? '已封存專案' : '專案管理'}
            </h1>
          </div>
          
          <div className="flex justify-between items-center border-b border-gray-100 pb-1">
            <div className="flex gap-1">
                <GhostButton active={projectSubView === 'list'} onClick={() => setProjectSubView('list')} icon={ListIcon}>列表</GhostButton>
                <GhostButton active={projectSubView === 'board'} onClick={() => setProjectSubView('board')} icon={Kanban}>看板</GhostButton>
                <GhostButton active={projectSubView === 'archive'} onClick={() => setProjectSubView('archive')} icon={Archive}>已封存</GhostButton>
            </div>
            
            <div className="flex items-center gap-1">
                <ExpandableSearch 
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="搜尋專案..."
                />
                {!isArchivedView && (
                    <button 
                        onClick={handleCreateProject}
                        className="bg-blue-600 text-white hover:bg-blue-700 flex items-center gap-1 px-2 py-1 rounded text-sm transition-colors shadow-sm ml-2"
                    >
                    <Plus size={14} /> 新增
                    </button>
                )}
            </div>
          </div>
        </div>

        {/* Content */}
        <div className={`flex-1 overflow-y-auto overflow-x-hidden ${projectSubView === 'board' ? 'bg-[#F7F7F5] p-0' : 'bg-white px-8'} custom-scrollbar`}>
          {projectSubView === 'board' ? (
             <ProjectBoard projects={displayProjects} />
          ) : (
             <ProjectList projects={displayProjects} promptsMap={displayPromptsMap} />
          )}
        </div>
      </div>
    );
  };

  const ProjectList = ({ projects, promptsMap }) => (
    <div className="pb-20 pt-2">
      {/* Table Header */}
      <div className="flex text-xs font-medium text-gray-400 border-b border-gray-200 bg-white sticky top-0 z-10">
        <div className="flex-[2] py-2 px-3 border-r border-gray-100">名稱</div>
        <div className="w-28 py-2 px-3 border-r border-gray-100">狀態</div>
        <div className="w-24 py-2 px-3 border-r border-gray-100">優先級</div>
        <div className="flex-1 py-2 px-3 border-r border-gray-100">標籤</div>
        <div className="w-28 py-2 px-3 text-right">更新</div>
      </div>

      {projects.length === 0 ? (
        <div className="text-center py-10 text-gray-400">沒有符合的專案</div>
      ) : projects.map(project => (
        <div key={project.id} className="group mb-6"> {/* Increased margin-bottom */}
          {/* Project Row - Updated: No Status, No Updated At, No Vertical Borders */}
          <div 
             className="flex items-center hover:bg-gray-50 cursor-pointer select-none transition-colors border-b border-gray-200" // Added bottom border
             onClick={() => handleSelectItem('project', project.id)}
          >
             <div className="flex-[2] flex items-center py-2 px-3 overflow-hidden relative"> {/* Removed border-r */}
                {/* Expand Toggle */}
                <button 
                    onClick={(e) => { e.stopPropagation(); handleToggleProject(project.id); }}
                    className="p-0.5 hover:bg-gray-200 rounded text-gray-400 transition-colors mr-2 flex-shrink-0"
                >
                    {expandedProjects.includes(project.id) ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
                </button>
                <FolderOpen size={16} className="text-gray-500 flex-shrink-0 mr-2" />
                <span className="font-medium text-gray-900 text-sm truncate">{project.title}</span>
                
                <div className="opacity-0 group-hover:opacity-100 absolute right-2 flex items-center gap-1">
                    <button className="text-gray-400 hover:text-gray-600 p-1 hover:bg-gray-200 rounded"><Maximize2 size={12} /></button>
                </div>
             </div>
             
             {/* Empty/Hidden columns for Project row based on request: No status, no updated at, no vertical borders */}
             <div className="w-28 py-2 px-3 flex items-center"></div> {/* Removed border-r */}
             <div className="w-24 py-2 px-3"></div>  {/* Removed border-r */}
             <div className="flex-1 py-2 px-3"></div> {/* Removed border-r */}
             <div className="w-28 py-2 px-3 text-right text-xs text-gray-400 flex items-center justify-end"></div>
          </div>

          {/* Prompts Nested List */}
          {expandedProjects.includes(project.id) && (
            <div className="bg-gray-50/30">
              {promptsMap[project.id]?.length > 0 ? (
                <div className="flex flex-col">
                    {promptsMap[project.id].map(prompt => (
                      <div 
                        key={prompt.id} 
                        onClick={() => handleSelectItem('prompt', prompt.id)}
                        className="flex items-center hover:bg-gray-100 cursor-pointer border-b border-gray-100 transition-colors relative group/row"
                      >
                         <div className="flex-[2] flex items-center py-1.5 px-3 border-r border-gray-100 overflow-hidden pl-10">
                           <FileText size={14} className="text-gray-400 flex-shrink-0 mr-2" />
                           <span className="truncate text-gray-600 text-sm group-hover/row:text-gray-900 transition-colors">{prompt.title}</span>
                         </div>

                         <div className="w-28 py-1.5 px-3 border-r border-gray-100 flex items-center"><StatusBadge status={prompt.status} /></div>

                         <div className="w-24 py-1.5 px-3 border-r border-gray-100 text-gray-500 text-xs flex items-center">{prompt.priority}</div>

                         <div className="flex-1 py-1.5 px-3 border-r border-gray-100 flex gap-1 overflow-hidden items-center">
                            {prompt.tags.slice(0,2).map((t, i) => <span key={i} className="text-[10px] text-gray-500 bg-white border border-gray-200 px-1 rounded">{t.text}</span>)}
                         </div>

                         <div className="w-28 py-1.5 px-3 text-right text-xs text-gray-400 flex items-center justify-end">{prompt.updatedAt}</div>

                         <div className="absolute right-2 opacity-0 group-hover/row:opacity-100 flex gap-1">
                             <button className="text-gray-400 hover:text-gray-600 p-1 hover:bg-gray-200 rounded"><Maximize2 size={12} /></button>
                         </div>
                      </div>
                    ))}
                </div>
              ) : (
                <div className="text-gray-400 text-xs py-2 pl-10 border-b border-gray-100 italic flex items-center">
                   {project.archived ? '無關聯提示詞' : '尚無提示詞'}
                </div>
              )}
              
              {!project.archived && (
                <div className="py-1 pl-10 border-b border-gray-100 hover:bg-gray-100 cursor-pointer transition-colors" onClick={() => handleCreatePrompt(project.id)}>
                    <button className="text-gray-400 text-xs hover:text-gray-700 flex items-center gap-1">
                    <Plus size={12} /> 新增提示詞
                    </button>
                </div>
              )}
            </div>
          )}
        </div>
      ))}
    </div>
  );

  const ProjectBoard = ({ projects }) => {
    const columns = [
      { id: 'planned', label: '規劃中', color: 'bg-gray-100' },
      { id: 'in_progress', label: '進行中', color: 'bg-blue-50' },
      { id: 'paused', label: '暫停', color: 'bg-yellow-50' },
      { id: 'done', label: '完成', color: 'bg-green-50' },
    ];

    return (
      <div className="flex gap-4 h-full min-w-[800px] overflow-x-auto p-8 bg-[#F7F7F5]">
        {columns.map(col => (
          <div key={col.id} className="flex-1 flex flex-col min-w-[260px]">
            <div className="flex items-center justify-between px-1 mb-2">
              <span className="font-semibold text-gray-500 text-xs uppercase tracking-wide">{col.label}</span>
              <span className="text-xs text-gray-400 font-mono">
                {projects.filter(p => p.status === col.id).length}
              </span>
            </div>
            <div className="flex-1 overflow-y-auto space-y-2.5 pb-20 custom-scrollbar">
              {projects.filter(p => p.status === col.id).map(project => (
                <div 
                  key={project.id}
                  onClick={() => handleSelectItem('project', project.id)}
                  className="bg-white p-3 rounded-[3px] shadow-sm hover:shadow-md cursor-pointer transition-all border border-gray-200/50 hover:border-gray-300 group"
                >
                  <div className="flex items-start justify-between mb-2">
                    <span className="font-medium text-gray-800 leading-tight flex items-center gap-1.5">
                      <FolderOpen size={14} className="text-gray-400" />
                      {project.title}
                    </span>
                  </div>
                  {project.summary && (
                      <div className="text-xs text-gray-500 mb-3 line-clamp-2 h-8 leading-relaxed">
                        {project.summary}
                      </div>
                  )}
                  <div className="flex justify-between items-center pt-2 border-t border-gray-50">
                    <div className="flex flex-wrap gap-1">
                      {project.tags.slice(0, 2).map((tag, i) => (
                        <span key={i} className="text-[10px] px-1 py-0.5 bg-gray-50 text-gray-500 rounded border border-gray-100">{tag.text}</span>
                      ))}
                    </div>
                    <span className="text-[10px] text-gray-300">{project.updatedAt}</span>
                  </div>
                </div>
              ))}
              <button 
                onClick={handleCreateProject}
                className="w-full py-1.5 text-gray-400 text-xs hover:bg-gray-200/50 rounded flex items-center justify-center gap-1 transition-colors"
              >
                <Plus size={12} /> 新增
              </button>
            </div>
          </div>
        ))}
      </div>
    );
  };

  const PromptSection = () => {
    const isArchivedView = promptSubView === 'archive';
    const displayPrompts = getFilteredPrompts(isArchivedView);

    return (
      <div className="w-full h-full flex flex-col bg-white">
        {/* Header & Tabs */}
        <div className="px-8 pt-8 pb-4 flex-shrink-0">
          <div className="flex justify-between items-end mb-6">
            <h1 className="text-3xl font-bold text-gray-900">
               {isArchivedView ? '已封存提示詞' : '提示詞管理'}
            </h1>
          </div>
          
          <div className="flex justify-between items-center border-b border-gray-100 pb-1">
            <div className="flex gap-1">
                <GhostButton active={promptSubView === 'list'} onClick={() => setPromptSubView('list')} icon={ListIcon}>列表</GhostButton>
                <GhostButton active={promptSubView === 'board'} onClick={() => setPromptSubView('board')} icon={Kanban}>看板</GhostButton>
                <GhostButton active={promptSubView === 'archive'} onClick={() => setPromptSubView('archive')} icon={Archive}>已封存</GhostButton>
            </div>
            
            <div className="flex items-center gap-1">
                <ExpandableSearch 
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="搜尋提示詞..."
                />
                {!isArchivedView && (
                    <button 
                        onClick={() => handleCreatePrompt()}
                        className="bg-blue-600 text-white hover:bg-blue-700 flex items-center gap-1 px-2 py-1 rounded text-sm transition-colors shadow-sm ml-2"
                    >
                    <Plus size={14} /> 新增
                    </button>
                )}
            </div>
          </div>
        </div>

        {/* Content */}
        <div className={`flex-1 overflow-y-auto overflow-x-hidden ${promptSubView === 'board' ? 'bg-[#F7F7F5] p-0' : 'bg-white px-8'} custom-scrollbar`}>
          {promptSubView === 'board' ? (
             <PromptBoard prompts={displayPrompts} />
          ) : (
             <PromptList prompts={displayPrompts} />
          )}
        </div>
      </div>
    );
  };

  const PromptList = ({ prompts }) => (
    <div className="pb-20 pt-2">
      <div className="flex text-xs font-medium text-gray-400 border-b border-gray-200 pb-2 mb-2 px-2 select-none sticky top-0 bg-white z-10">
        <div className="flex-[2] py-2 px-3 border-r border-gray-100">名稱</div>
        <div className="flex-1 py-2 px-3 border-r border-gray-100">所屬專案</div>
        <div className="w-28 py-2 px-3 border-r border-gray-100">狀態</div>
        <div className="w-24 py-2 px-3 border-r border-gray-100">優先級</div>
        <div className="flex-1 py-2 px-3 border-r border-gray-100">標籤</div>
        <div className="w-28 py-2 px-3 text-right">更新</div>
      </div>

      {prompts.length === 0 ? (
        <div className="text-center py-10 text-gray-400">無資料</div>
      ) : prompts.map(prompt => {
        const project = projects.find(p => p.id === prompt.projectId);
        return (
          <div 
            key={prompt.id} 
            onClick={() => handleSelectItem('prompt', prompt.id)}
            className="flex items-center hover:bg-gray-50 cursor-pointer border-b border-gray-100 transition-colors relative group"
          >
             {/* Name */}
            <div className="flex-[2] flex items-center py-1.5 px-3 border-r border-gray-100 overflow-hidden">
                <FileText size={16} className="text-gray-400 flex-shrink-0 mr-2" />
                <span className="text-gray-700 font-medium text-sm group-hover:underline decoration-gray-300 underline-offset-2 truncate">{prompt.title}</span>
            </div>
            {/* Project */}
            <div className="flex-1 py-1.5 px-3 border-r border-gray-100 text-sm text-gray-500 truncate flex items-center">
               {project ? <span className="flex items-center gap-1"><FolderOpen size={12} className="text-gray-300" />{project.title}</span> : <span className="text-gray-300">-</span>}
            </div>
            {/* Status */}
            <div className="w-28 py-1.5 px-3 border-r border-gray-100 flex items-center"><StatusBadge status={prompt.status} /></div>
            {/* Priority */}
            <div className="w-24 py-1.5 px-3 border-r border-gray-100 text-sm text-gray-500 flex items-center">{prompt.priority}</div>
            {/* Tags */}
            <div className="flex-1 py-1.5 px-3 border-r border-gray-100 flex gap-1 overflow-hidden items-center">
              {prompt.tags.slice(0,2).map((t, i) => <span key={i} className="text-[10px] text-gray-500 bg-white border border-gray-200 px-1 rounded">{t.text}</span>)}
            </div>
            {/* Updated */}
            <div className="w-28 py-1.5 px-3 text-right text-xs text-gray-400 font-mono flex items-center justify-end">{prompt.updatedAt}</div>
            
            <div className="absolute right-2 opacity-0 group-hover:opacity-100 flex gap-1">
                <button className="text-gray-400 hover:text-gray-600 p-1 hover:bg-gray-200 rounded"><Maximize2 size={12} /></button>
            </div>
          </div>
        );
      })}
    </div>
  );

  const PromptBoard = ({ prompts }) => {
    const columns = [
      { id: 'draft', label: '草稿', color: 'bg-gray-100' },
      { id: 'needs_review', label: '待優化', color: 'bg-yellow-50' },
      { id: 'ready', label: '可用', color: 'bg-green-50' },
    ];

    return (
      <div className="flex gap-4 h-full min-w-[800px] overflow-x-auto p-8 bg-[#F7F7F5]">
        {columns.map(col => (
          <div key={col.id} className="flex-1 flex flex-col min-w-[260px]">
            <div className="flex items-center justify-between px-1 mb-2">
              <span className="font-semibold text-gray-500 text-xs uppercase tracking-wide">{col.label}</span>
              <span className="text-xs text-gray-400 font-mono">
                {prompts.filter(p => p.status === col.id).length}
              </span>
            </div>
            <div className="flex-1 overflow-y-auto space-y-2.5 pb-20 custom-scrollbar">
              {prompts.filter(p => p.status === col.id).map(prompt => {
                const proj = projects.find(pj => pj.id === prompt.projectId);
                return (
                  <div 
                    key={prompt.id}
                    onClick={() => handleSelectItem('prompt', prompt.id)}
                    className="bg-white p-3 rounded-[3px] shadow-sm hover:shadow-md cursor-pointer transition-all border border-gray-200/50 hover:border-gray-300 group"
                  >
                    <div className="flex items-start justify-between mb-2">
                      <span className="font-medium text-gray-800 leading-tight">{prompt.title}</span>
                      {prompt.priority === 'high' && <div className="w-1.5 h-1.5 rounded-full bg-red-400 mt-1" title="High Priority" />}
                    </div>
                    <div className="text-xs text-gray-400 mb-3 flex items-center gap-1">
                      <FolderOpen size={10} />
                      {proj?.title || "未指定"}
                    </div>
                    <div className="flex flex-wrap gap-1">
                      {prompt.tags.slice(0, 3).map((tag, i) => (
                        <span key={tag} className="text-[10px] px-1.5 py-0.5 bg-gray-50 text-gray-500 rounded-[2px] border border-gray-100">
                          {tag.text}
                        </span>
                      ))}
                    </div>
                  </div>
                );
              })}
               <button 
                onClick={() => handleCreatePrompt()}
                className="w-full py-1.5 text-gray-400 text-xs hover:bg-gray-200/50 rounded flex items-center justify-center gap-1 transition-colors"
               >
                <Plus size={12} /> 新增
              </button>
            </div>
          </div>
        ))}
      </div>
    );
  };

  const ClipboardView = () => (
    <div className="h-full p-8 max-w-4xl mx-auto overflow-y-auto bg-white">
      <h1 className="text-3xl font-bold text-gray-900 mb-8 flex items-center gap-2">
        <Clipboard className="text-gray-400" /> 剪貼簿與常用片語
      </h1>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="bg-[#F7F7F5] p-6 rounded-lg h-fit">
           <div className="flex justify-between items-center mb-4">
             <h3 className="font-semibold text-gray-600 text-sm uppercase tracking-wide">分類瀏覽</h3>
             <GhostButton icon={Plus} onClick={handleCreateSnippet}>新增</GhostButton>
           </div>
           <div className="space-y-1">
             {['角色設定', '格式要求', '限制條件', '風格指令'].map(cat => (
               <div key={cat} className="flex items-center justify-between hover:bg-gray-200/50 px-3 py-2 rounded cursor-pointer transition-colors text-gray-700">
                 <span className="text-sm font-medium">{cat}</span>
                 <ChevronRight size={14} className="text-gray-400" />
               </div>
             ))}
             <div className="flex items-center justify-between hover:bg-gray-200/50 px-3 py-2 rounded cursor-pointer transition-colors text-gray-500">
                 <span className="text-sm">未分類</span>
                 <ChevronRight size={14} className="text-gray-400" />
             </div>
           </div>
        </div>

        <div className="space-y-4">
          <div className="flex justify-between items-end border-b border-gray-100 pb-2">
            <h3 className="font-semibold text-gray-600 text-sm uppercase tracking-wide">最近使用</h3>
          </div>
          
          {snippets.map(snippet => (
            <div 
              key={snippet.id} 
              onClick={() => handleSelectItem('snippet', snippet.id)}
              className="bg-white p-4 rounded-lg border border-gray-200 hover:border-gray-300 hover:shadow-sm cursor-pointer transition-all group"
            >
              <div className="flex justify-between items-start mb-2">
                <div className="flex flex-col">
                  <span className="font-medium text-gray-800">{snippet.title}</span>
                  <span className="text-[10px] text-gray-500 bg-[#F7F7F5] px-1.5 py-0.5 rounded w-fit mt-1">{snippet.category}</span>
                </div>
                <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button 
                    onClick={(e) => { e.stopPropagation(); navigator.clipboard.writeText(snippet.content); showNotification('已複製'); }}
                    className="text-gray-400 hover:text-blue-600 p-1 hover:bg-blue-50 rounded" 
                    title="複製"
                  >
                    <Copy size={14} />
                  </button>
                  <button 
                    onClick={(e) => { e.stopPropagation(); handleDeleteItem('snippet', snippet.id); }}
                    className="text-gray-400 hover:text-red-600 p-1 hover:bg-red-50 rounded" 
                    title="刪除"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
              <p className="text-sm text-gray-500 line-clamp-2 font-mono bg-[#F7F7F5] p-2 rounded border border-gray-100">
                {snippet.content || '(無內容)'}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  // --- Render Layout ---

  return (
    <div className="flex h-screen bg-white font-sans text-gray-900 selection:bg-[#CDE8F0] relative">
      <GlobalStyles />
      
      {/* Sidebar - Notion Style */}
      <aside className={`flex-shrink-0 bg-[#F7F7F5] flex flex-col transition-all duration-300 ${isSidebarOpen ? 'w-60' : 'w-12'} overflow-hidden`}>
        <div className="h-12 flex items-center px-4 hover:bg-gray-200/50 cursor-pointer transition-colors m-2 rounded">
          <div className={`font-bold text-sm text-gray-800 flex items-center gap-2 truncate ${!isSidebarOpen && 'hidden'}`}>
             <div className="w-5 h-5 bg-gray-800 rounded flex items-center justify-center text-white text-[10px]">P</div>
             我的工作區
          </div>
          <button onClick={() => setIsSidebarOpen(!isSidebarOpen)} className={`ml-auto p-1 text-gray-400 hover:text-gray-600 rounded ${!isSidebarOpen && 'w-full flex justify-center'}`}>
            {isSidebarOpen ? <ChevronRight size={16} className="rotate-180" /> : <ChevronRight size={16} />}
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

      {/* Main Content */}
      <main className="flex-1 relative overflow-hidden bg-white flex flex-col">
        {activeSection === 'projects' && <ProjectSection />}
        {activeSection === 'prompts' && <PromptSection />}
        {activeSection === 'clipboard' && <ClipboardView />}
        {activeSection === 'settings' && (
             <div className="h-full p-20 text-center text-gray-400 flex flex-col items-center justify-center">
                <Settings size={48} className="mb-4 text-gray-200" />
                <p>設定頁面尚未實作</p>
             </div>
        )}
      </main>

      {/* Side Detail Panel (Overlay) - Notion Page Style */}
      {selectedItem && (
        <>
            <div className="absolute inset-0 bg-black/10 z-40" onClick={closePanel}></div>
            <SidePanel 
              item={selectedItem} 
              onClose={closePanel} 
              projects={projects}
              prompts={prompts}
              snippets={snippets}
              onUpdate={handleUpdateItem}
              onDelete={handleDeleteItem}
              onArchive={handleToggleArchive}
              onNavigate={handleNavigate}
              onSwitchItem={handleSelectItem}
            />
        </>
      )}

      {/* Notification Toast */}
      {notification && (
        <div className="absolute bottom-6 left-1/2 transform -translate-x-1/2 bg-gray-900 text-white px-4 py-2.5 rounded shadow-xl flex items-center gap-3 text-sm animate-fade-in-up z-50">
          <CheckCircle size={16} className="text-green-400" />
          {notification}
        </div>
      )}

    </div>
  );
}

// --- Sub-components ---

const SidePanel = ({ item, onClose, projects, prompts, snippets, onUpdate, onDelete, onArchive, onNavigate, onSwitchItem }) => {
  const isProject = item.type === 'project';
  const isSnippet = item.type === 'snippet';
  
  const [formData, setFormData] = useState(null);
  const [isExpanded, setIsExpanded] = useState(false); 

  useEffect(() => {
    let data;
    if (isProject) {
      data = projects.find(p => p.id === item.id);
    } else if (isSnippet) {
      data = snippets.find(s => s.id === item.id);
    } else {
      data = prompts.find(p => p.id === item.id);
    }
    setFormData(data);
  }, [item, projects, prompts, snippets]);

  if (!formData) return null;

  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSave = () => {
    onUpdate(item.type, formData);
  };

  const handleAddFile = () => {
    const fileName = prompt("請輸入檔案名稱:");
    if (fileName) {
      const newFile = { id: generateId(), name: fileName };
      const newFiles = [...(formData.files || []), newFile];
      handleChange('files', newFiles);
      onUpdate(item.type, { ...formData, files: newFiles });
    }
  };

  const handleDeleteFile = (fileId) => {
    if (confirm("確定要刪除此檔案嗎?")) {
      const newFiles = formData.files.filter(f => f.id !== fileId);
      handleChange('files', newFiles);
      onUpdate(item.type, { ...formData, files: newFiles });
    }
  };

  const handleRenameFile = (fileId, oldName) => {
    const newName = prompt("重新命名檔案:", oldName);
    if (newName && newName !== oldName) {
      const newFiles = formData.files.map(f => f.id === fileId ? { ...f, name: newName } : f);
      handleChange('files', newFiles);
      onUpdate(item.type, { ...formData, files: newFiles });
    }
  };

  const handleAddTag = (category) => {
    const tagName = prompt(`新增 ${TAG_CATEGORIES[category]} :`);
    if (tagName) {
      const newTag = { text: tagName, category };
      const newTags = [...formData.tags, newTag];
      handleChange('tags', newTags);
      onUpdate(item.type, { ...formData, tags: newTags });
    }
  };

  const handleRemoveTag = (indexToRemove) => {
    const newTags = formData.tags.filter((_, index) => index !== indexToRemove);
    handleChange('tags', newTags);
    onUpdate(item.type, { ...formData, tags: newTags });
  };

  const parentProject = !isProject && !isSnippet ? projects.find(p => p.id === formData.projectId) : null;
  const relatedPrompts = isProject ? prompts.filter(p => p.projectId === item.id) : [];

  return (
    <div className={`absolute top-0 right-0 h-full bg-white shadow-2xl z-50 flex flex-col transform transition-all duration-300 animate-slide-in-right ${isExpanded ? 'w-full' : 'w-[600px]'}`}>
      
      {/* Top Bar */}
      <div className="h-12 flex items-center justify-between px-4 hover:bg-transparent">
         {/* Breadcrumbs */}
         <div className="flex items-center gap-2 text-sm text-gray-400 transition-colors">
            <button 
              onClick={() => setIsExpanded(!isExpanded)} 
              className="p-1 hover:bg-gray-100 hover:text-gray-600 rounded text-gray-400 transition-colors"
              title={isExpanded ? "還原" : "展開為全頁"}
            >
               {isExpanded ? <Minimize2 size={14} /> : <Maximize2 size={14} className="rotate-45" />}
            </button>

            <div className="flex items-center gap-2 cursor-default">
                {isProject ? (
                    <span onClick={() => onNavigate('projects', 'list')} className="hover:text-gray-900 hover:underline decoration-gray-300 underline-offset-2 cursor-pointer">專案列表</span>
                ) : isSnippet ? (
                    <span onClick={() => onNavigate('clipboard')} className="hover:text-gray-900 hover:underline decoration-gray-300 underline-offset-2 cursor-pointer">剪貼簿</span>
                ) : (
                    <>
                       <span onClick={() => onNavigate('prompts', 'list')} className="hover:text-gray-900 hover:underline decoration-gray-300 underline-offset-2 cursor-pointer">提示詞列表</span>
                        {parentProject && (
                            <>
                                <span>/</span>
                                <span onClick={() => onSwitchItem('project', parentProject.id)} className="hover:text-gray-900 hover:underline decoration-gray-300 underline-offset-2 cursor-pointer">{parentProject.title}</span>
                            </>
                        )}
                    </>
                )}
                <span>/</span>
                <span className="truncate max-w-[200px] text-gray-800 font-medium">{formData.title}</span>
            </div>
         </div>

         {/* Actions */}
         <div className="flex items-center gap-1">
            {formData.archived && <span className="bg-orange-100 text-orange-600 px-2 py-0.5 rounded text-xs mr-2">已封存</span>}
            <div className="relative group">
               <button className="p-1.5 hover:bg-gray-100 rounded text-gray-500 transition-colors"><MoreHorizontal size={18} /></button>
               <div className="absolute right-0 top-full mt-1 w-48 bg-white border border-gray-200 rounded shadow-lg hidden group-hover:block z-50 py-1">
                 {!isSnippet && (
                   <button onClick={() => onArchive(item.type, item.id, formData.archived)} className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2">
                     {formData.archived ? <RotateCcw size={14} /> : <Archive size={14} />} {formData.archived ? '還原專案' : '封存專案'}
                   </button>
                 )}
                 <button onClick={() => onDelete(item.type, item.id)} className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 flex items-center gap-2 border-t border-gray-100 mt-1">
                   <Trash2 size={14} /> 永久刪除
                 </button>
               </div>
            </div>
            <button onClick={onClose} className="p-1.5 hover:bg-gray-100 rounded text-gray-500 transition-colors"><ChevronRight size={20} /></button>
         </div>
      </div>

      {/* Content Area */}
      <div className="flex-1 overflow-y-auto px-12 py-8 custom-scrollbar">
        <div className={`mx-auto ${isExpanded ? 'max-w-4xl' : ''}`}>
            
            {/* Title & Summary */}
            <div className="mb-6">
                <input 
                    type="text" 
                    value={formData.title}
                    onChange={(e) => handleChange('title', e.target.value)}
                    onBlur={handleSave}
                    className="w-full text-4xl font-bold text-gray-900 placeholder-gray-300 border-none focus:ring-0 focus:outline-none p-0 bg-transparent leading-tight mb-2"
                    placeholder="Untitled"
                />
                {isProject && (
                    <textarea 
                        className="w-full text-gray-500 placeholder-gray-300 bg-transparent border-none focus:ring-0 resize-none p-0 text-lg leading-relaxed h-auto"
                        value={formData.summary}
                        onChange={(e) => handleChange('summary', e.target.value)}
                        onBlur={handleSave}
                        placeholder="請輸入專案摘要..."
                        rows={2}
                    />
                )}
            </div>

            {/* Properties */}
            {!isSnippet && (
            <div className="space-y-1 mb-8">
                {/* Common: Status */}
                <PropertyRow label="狀態" icon={<CheckCircle size={14} className="text-gray-400"/>}>
                    <select 
                        value={formData.status}
                        onChange={(e) => { handleChange('status', e.target.value); handleSave(); }} 
                        className="bg-transparent hover:bg-gray-100 rounded px-1.5 py-0.5 text-sm text-gray-700 border-none focus:ring-0 cursor-pointer w-full"
                    >
                        {isProject ? (
                        <>
                            <option value="planned">規劃中</option>
                            <option value="in_progress">進行中</option>
                            <option value="paused">暫停</option>
                            <option value="done">完成</option>
                        </>
                        ) : (
                        <>
                            <option value="draft">草稿</option>
                            <option value="needs_review">待優化</option>
                            <option value="ready">可用</option>
                            <option value="deprecated">停用</option>
                        </>
                        )}
                    </select>
                </PropertyRow>

                {/* Project Specific */}
                {isProject && (
                    <PropertyRow label="專案類型" icon={<Tag size={14} className="text-gray-400"/>}>
                        <select 
                            value={formData.projectType}
                            onChange={(e) => { handleChange('projectType', e.target.value); handleSave(); }} 
                            className="bg-transparent hover:bg-gray-100 rounded px-1.5 py-0.5 text-sm text-gray-700 border-none focus:ring-0 cursor-pointer w-full"
                        >
                            {PROJECT_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
                        </select>
                    </PropertyRow>
                )}

                {/* Prompt Specific */}
                {!isProject && (
                    <>
                        <PropertyRow label="專案" icon={<FolderOpen size={14} className="text-gray-400"/>}>
                            <select 
                                value={formData.projectId} 
                                onChange={(e) => { handleChange('projectId', e.target.value); onUpdate(item.type, { ...formData, projectId: e.target.value }); }}
                                className="bg-transparent hover:bg-gray-100 rounded px-1.5 py-0.5 text-sm text-blue-600 underline decoration-blue-200 underline-offset-2 border-none focus:ring-0 cursor-pointer w-full"
                            >
                                {projects.map(p => <option key={p.id} value={p.id}>{p.title}</option>)}
                            </select>
                        </PropertyRow>
                        <PropertyRow label="模型" icon={<Cpu size={14} className="text-gray-400"/>}>
                            <select 
                                value={formData.model}
                                onChange={(e) => { handleChange('model', e.target.value); handleSave(); }} 
                                className="bg-transparent hover:bg-gray-100 rounded px-1.5 py-0.5 text-sm text-gray-700 border-none focus:ring-0 cursor-pointer w-full"
                            >
                                {PROMPT_MODELS.map(m => <option key={m} value={m}>{m}</option>)}
                            </select>
                        </PropertyRow>
                        <PropertyRow label="連結" icon={<LinkIcon size={14} className="text-gray-400"/>}>
                            <div className="flex items-center w-full gap-2">
                                <input 
                                    type="text"
                                    value={formData.link}
                                    onChange={(e) => handleChange('link', e.target.value)}
                                    onBlur={handleSave}
                                    className="bg-transparent hover:bg-gray-100 rounded px-1.5 py-0.5 text-sm text-blue-600 underline decoration-blue-200 underline-offset-2 border-none focus:ring-0 w-full placeholder-gray-300"
                                    placeholder="https://..."
                                />
                                {formData.link && (
                                    <a href={formData.link} target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-blue-600">
                                        <ExternalLink size={14} />
                                    </a>
                                )}
                            </div>
                        </PropertyRow>
                    </>
                )}

                {/* Tags Section - Project Only (Categorized) */}
                {isProject && (
                    Object.entries(TAG_CATEGORIES).map(([key, label]) => (
                        <PropertyRow key={key} label={label} icon={<Tag size={14} className="text-gray-400"/>}>
                            <div className="flex flex-wrap gap-1.5 px-1.5">
                                {formData.tags.filter(t => t.category === key).map((t, idx) => {
                                    // Calculate global index for removal
                                    const globalIndex = formData.tags.indexOf(t);
                                    return (
                                        <span key={idx} className="flex items-center gap-1 px-1.5 py-0.5 bg-gray-100 text-gray-600 text-xs rounded-[3px]">
                                            {t.text}
                                            <button onClick={() => handleRemoveTag(globalIndex)} className="hover:text-red-500">×</button>
                                        </span>
                                    );
                                })}
                                <button onClick={() => handleAddTag(key)} className="text-gray-400 hover:text-gray-600 text-xs px-1 hover:bg-gray-100 rounded">+ Add</button>
                            </div>
                        </PropertyRow>
                    ))
                )}

                {/* Tags Section - Prompt (Simple) */}
                {!isProject && (
                    <PropertyRow label="標籤" icon={<Tag size={14} className="text-gray-400"/>}>
                        <div className="flex flex-wrap gap-1.5 px-1.5">
                            {formData.tags.map((t, idx) => (
                                <span key={idx} className="flex items-center gap-1 px-1.5 py-0.5 bg-gray-100 text-gray-600 text-xs rounded-[3px]">
                                    {t.text}
                                    <button onClick={() => handleRemoveTag(idx)} className="hover:text-red-500">×</button>
                                </span>
                            ))}
                            <button onClick={() => handleAddTag('common')} className="text-gray-400 hover:text-gray-600 text-xs px-1 hover:bg-gray-100 rounded">+ Add</button>
                        </div>
                    </PropertyRow>
                )}

                <PropertyRow label="更新時間" icon={<Calendar size={14} className="text-gray-400"/>}>
                    <span className="text-sm text-gray-500 px-1.5">{formData.updatedAt}</span>
                </PropertyRow>
            </div>
            )}

            <hr className="border-gray-100 mb-8" />

            {/* Note Section (Prompt Only) */}
            {!isProject && !isSnippet && (
                <div className="mb-8">
                    <h3 className="text-sm font-bold text-gray-900 mb-2">備註</h3>
                    <textarea 
                        className="w-full min-h-[60px] p-3 bg-gray-50 rounded border border-transparent focus:bg-white focus:border-blue-200 focus:ring-0 text-gray-700 text-sm leading-relaxed resize-none transition-all placeholder-gray-400"
                        value={formData.note}
                        onChange={(e) => handleChange('note', e.target.value)}
                        onBlur={handleSave}
                        placeholder="輸入備註..."
                    />
                </div>
            )}

            {/* Project Content: Description + Files + Prompts */}
            {isProject && (
            <div className="space-y-8">
                <section>
                    <h3 className="text-sm font-bold text-gray-900 mb-2">專案描述</h3>
                    <textarea 
                        className="w-full min-h-[80px] p-0 bg-transparent border-none focus:ring-0 text-gray-700 text-sm leading-relaxed resize-none placeholder-gray-300"
                        value={formData.description}
                        onChange={(e) => handleChange('description', e.target.value)}
                        onBlur={handleSave}
                        placeholder="輸入詳細專案描述..."
                    />
                </section>

                <section>
                    <div className="flex justify-between items-center mb-2">
                        <h3 className="text-sm font-bold text-gray-900">檔案列表</h3>
                        <button onClick={handleAddFile} className="text-xs text-gray-400 hover:text-gray-600 flex items-center gap-1"><Plus size={12}/> Upload</button>
                    </div>
                    <div className="space-y-1">
                        {formData.files && formData.files.length > 0 ? (
                            formData.files.map(file => (
                                <div key={file.id} className="flex items-center justify-between py-1.5 px-2 -ml-2 rounded hover:bg-gray-50 group transition-colors">
                                    <div className="flex items-center gap-2">
                                        <FileIcon size={14} className="text-gray-400" />
                                        <span className="text-sm text-gray-700">{file.name}</span>
                                    </div>
                                    <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                        <button onClick={() => handleRenameFile(file.id, file.name)} className="text-gray-400 hover:text-blue-500 p-1"><Edit2 size={12} /></button>
                                        <button onClick={() => handleDeleteFile(file.id)} className="text-gray-400 hover:text-red-500 p-1"><Trash2 size={12} /></button>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <div className="text-gray-300 text-sm italic px-2">無檔案</div>
                        )}
                    </div>
                </section>
                
                <section>
                    <h3 className="text-sm font-bold text-gray-900 mb-3 flex items-center gap-2">
                        關聯提示詞 <span className="text-gray-400 font-normal text-xs">{relatedPrompts.length}</span>
                    </h3>
                    <div className="space-y-1">
                        {relatedPrompts.map(p => (
                        <div key={p.id} className="flex items-center justify-between py-1.5 px-2 -ml-2 rounded hover:bg-gray-50 cursor-pointer group transition-colors">
                            <div className="flex items-center gap-2">
                                <FileText size={16} className="text-gray-400" />
                                <span className="text-sm text-gray-700 underline decoration-gray-200 underline-offset-2 group-hover:text-gray-900">{p.title}</span>
                            </div>
                            <StatusBadge status={p.status} />
                        </div>
                        ))}
                        {relatedPrompts.length === 0 && <div className="text-gray-300 text-sm italic">無關聯提示詞</div>}
                    </div>
                </section>
            </div>
            )}

            {/* Prompt/Snippet Editor */}
            {(isSnippet || !isProject && !isSnippet) && (
            <div className="h-full flex flex-col">
                <div className="flex justify-between items-center mb-4 border-t border-gray-100 pt-6">
                    <h3 className="text-sm font-bold text-gray-900">內容編輯</h3>
                    <button onClick={handleSave} className="text-xs text-gray-400 hover:text-gray-600 flex items-center gap-1"><Save size={12} /> Saved</button>
                </div>
                <textarea 
                    className="w-full min-h-[400px] bg-transparent border-none focus:ring-0 font-mono text-sm leading-relaxed text-gray-700 resize-none p-0 placeholder-gray-300"
                    value={formData.content}
                    onChange={(e) => handleChange('content', e.target.value)}
                    onBlur={handleSave}
                    placeholder={isSnippet ? "輸入片語內容..." : "# 開始撰寫提示詞..."}
                />
            </div>
            )}

            <div className="h-20"></div> {/* Bottom Spacer */}
        </div>
      </div>
    </div>
  );
};

const PropertyRow = ({ label, icon, children }) => (
    <div className="grid grid-cols-[120px_1fr] items-start py-1 group">
        <div className="flex items-center gap-2 text-sm text-gray-400 pt-1">
            {icon}
            <span className="truncate">{label}</span>
        </div>
        <div className="min-h-[28px] flex items-center w-full">
            {children}
        </div>
    </div>
);
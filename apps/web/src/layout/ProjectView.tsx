import { FolderOpen, ChevronDown, ChevronRight, Maximize2, Plus } from 'lucide-react';
import { useUiStore } from '../../state/uiStore';

// Mock Data (從 Prototype 移植)
const MOCK_PROJECTS = [
  {
    id: 'p1',
    title: 'AI 客服自動化 Agent',
    status: 'in_progress',
    summary: '利用 LLM 技術，針對公司內部常見的 IT 報修問題，建立自動化的初步診斷與回覆系統。',
    tags: ['RAG', 'Line', 'IT人員'],
    updatedAt: '2024-01-02',
  },
  {
    id: 'p2',
    title: '2024 Q1 行銷文案助手',
    status: 'planned',
    summary: '為行銷部門設計的一套提示詞模板庫。',
    tags: ['Marketing', 'Instagram'],
    updatedAt: '2023-12-28',
  },
];

export function ProjectView() {
  const { projectSubView } = useUiStore();

  if (projectSubView === 'board') {
    return <ProjectBoard projects={MOCK_PROJECTS} />;
  }
  return <ProjectList projects={MOCK_PROJECTS} />;
}

function ProjectList({ projects }: { projects: any[] }) {
  const { expandedProjects, toggleProjectExpanded, setSelectedItem } = useUiStore();

  return (
    <div className="pb-20 pt-2">
      <div className="flex text-xs font-medium text-gray-400 border-b border-gray-200 bg-white sticky top-0 z-10">
        <div className="flex-[2] py-2 px-3 border-r border-gray-100">名稱</div>
        <div className="w-28 py-2 px-3 border-r border-gray-100">狀態</div>
        <div className="w-24 py-2 px-3 border-r border-gray-100">優先級</div>
        <div className="flex-1 py-2 px-3 border-r border-gray-100">標籤</div>
        <div className="w-28 py-2 px-3 text-right">更新</div>
      </div>

      {projects.map((project) => (
        <div key={project.id} className="group mb-6">
          <div
            className="flex items-center hover:bg-gray-50 cursor-pointer select-none transition-colors border-b border-gray-200"
            onClick={() => setSelectedItem({ type: 'project', id: project.id })}
          >
            <div className="flex-[2] flex items-center py-2 px-3 overflow-hidden relative">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  toggleProjectExpanded(project.id);
                }}
                className="p-0.5 hover:bg-gray-200 rounded text-gray-400 transition-colors mr-2 flex-shrink-0"
              >
                {expandedProjects.includes(project.id) ? (
                  <ChevronDown size={14} />
                ) : (
                  <ChevronRight size={14} />
                )}
              </button>
              <FolderOpen size={16} className="text-gray-500 flex-shrink-0 mr-2" />
              <span className="font-medium text-gray-900 text-sm truncate">{project.title}</span>
            </div>
            <div className="w-28 py-2 px-3 flex items-center text-xs text-gray-500">{project.status}</div>
            <div className="w-24 py-2 px-3"></div>
            <div className="flex-1 py-2 px-3 flex gap-1">
                {project.tags.map((t: string) => <span key={t} className="text-[10px] bg-gray-100 px-1 rounded">{t}</span>)}
            </div>
            <div className="w-28 py-2 px-3 text-right text-xs text-gray-400">{project.updatedAt}</div>
          </div>

          {expandedProjects.includes(project.id) && (
            <div className="bg-gray-50/30 py-2 pl-10 text-xs text-gray-400 italic border-b border-gray-100">
              (關聯提示詞列表 - 待實作)
            </div>
          )}
        </div>
      ))}
    </div>
  );
}

function ProjectBoard({ projects }: { projects: any[] }) {
  const { setSelectedItem } = useUiStore();
  const columns = [
    { id: 'planned', label: '規劃中' },
    { id: 'in_progress', label: '進行中' },
    { id: 'done', label: '完成' },
  ];

  return (
    <div className="flex gap-4 h-full min-w-[800px] overflow-x-auto p-8 bg-[#F7F7F5]">
      {columns.map((col) => (
        <div key={col.id} className="flex-1 flex flex-col min-w-[260px]">
          <div className="flex items-center justify-between px-1 mb-2">
            <span className="font-semibold text-gray-500 text-xs uppercase tracking-wide">
              {col.label}
            </span>
            <span className="text-xs text-gray-400 font-mono">
              {projects.filter((p) => p.status === col.id).length}
            </span>
          </div>
          <div className="flex-1 overflow-y-auto space-y-2.5 pb-20 custom-scrollbar">
            {projects
              .filter((p) => p.status === col.id)
              .map((project) => (
                <div
                  key={project.id}
                  onClick={() => setSelectedItem({ type: 'project', id: project.id })}
                  className="bg-white p-3 rounded-[3px] shadow-sm hover:shadow-md cursor-pointer transition-all border border-gray-200/50 hover:border-gray-300 group"
                >
                  <div className="flex items-start justify-between mb-2">
                    <span className="font-medium text-gray-800 leading-tight flex items-center gap-1.5">
                      <FolderOpen size={14} className="text-gray-400" />
                      {project.title}
                    </span>
                  </div>
                  <div className="text-xs text-gray-500 mb-3 line-clamp-2 h-8 leading-relaxed">
                    {project.summary}
                  </div>
                  <div className="flex flex-wrap gap-1">
                    {project.tags.map((tag: string) => (
                        <span key={tag} className="text-[10px] px-1 py-0.5 bg-gray-50 text-gray-500 rounded border border-gray-100">{tag}</span>
                    ))}
                  </div>
                </div>
              ))}
          </div>
        </div>
      ))}
    </div>
  );
}
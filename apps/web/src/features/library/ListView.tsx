import { useState, useEffect, useMemo } from 'react';
import type { PromptEntity, ProjectEntity } from '@pah/contracts';
import { FileText, Folder, Plus } from 'lucide-react';
import { Badge, StatusBadge } from '../../ui/PrototypeBadges';
import { formatDate } from '../../utils/date';

type ViewMode = 'list' | 'board';
import { getPrompts, getProjects } from './api';

interface ListViewProps {
  viewMode: ViewMode;
  searchQuery: string;
  onSelectPrompt: (prompt: PromptEntity | null) => void;
  selectedPromptId: string | null;
}

export function ListView({
  viewMode,
  searchQuery,
  onSelectPrompt,
  selectedPromptId,
}: ListViewProps) {
  const [prompts, setPrompts] = useState<PromptEntity[]>([]);
  const [projects, setProjects] = useState<ProjectEntity[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch prompts from server
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [promptsData, projectsData] = await Promise.all([
          getPrompts(),
          getProjects()
        ]);
        setPrompts(promptsData);
        setProjects(projectsData);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load data');
      } finally {
        setLoading(false);
      }
    };

    fetchData();

    // Listen for global updates (from SidePanel)
    const handleEntityChange = () => fetchData();
    window.addEventListener('entity-change', handleEntityChange);
    return () => window.removeEventListener('entity-change', handleEntityChange);
  }, []);

  // Filter prompts by search query
  const filteredPrompts = useMemo(() => {
    return prompts.filter((prompt) => {
      if (!searchQuery) return true;
      const query = searchQuery.toLowerCase();
      return (
        prompt.title.toLowerCase().includes(query) ||
        prompt.body.toLowerCase().includes(query) ||
        prompt.tags?.some(tag => tag.toLowerCase().includes(query))
      );
    });
  }, [prompts, searchQuery]);

  // Group prompts by project
  const groupedData = useMemo(() => {
    const groups: { project: ProjectEntity | null; prompts: PromptEntity[] }[] = [];

    // 1. Projects
    projects.forEach(proj => {
      const projectPrompts = filteredPrompts.filter(p => p.projectId === proj.id);
      // If searching, only show project if it has matching prompts (or force show all? typically show matches)
      // But user wants hierarchy. Let's show project if it handles prompts.
      // If no prompts match in search mode, maybe hide project? 
      // For now, if search is active, we might want flat list or still grouped. Let's keep grouped.
      if (searchQuery && projectPrompts.length === 0) return;

      groups.push({
        project: proj,
        prompts: projectPrompts
      });
    });

    // 2. Uncategorized (No project or project not found)
    const uncategorizedPrompts = filteredPrompts.filter(p => !p.projectId || !projects.find(proj => proj.id === p.projectId));
    if (uncategorizedPrompts.length > 0) {
      groups.push({
        project: null,
        prompts: uncategorizedPrompts
      });
    }

    return groups;
  }, [filteredPrompts, projects, searchQuery]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-400 text-xs">載入中...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-8 text-center">
        <div className="text-red-600 mb-2 text-xs">載入失敗</div>
        <div className="text-xs text-gray-500">{error}</div>
      </div>
    );
  }

  if (filteredPrompts.length === 0) {
    return (
      <div className="p-8 text-center text-gray-400 text-xs">
        {searchQuery ? '找不到符合的提示詞' : '尚無提示詞'}
      </div>
    );
  }

  if (viewMode === 'board') {
    return <BoardView prompts={filteredPrompts} onSelectPrompt={onSelectPrompt} selectedPromptId={selectedPromptId} />;
  }

  return (
    <div className="pb-20 pt-2">
      <div className="flex text-xs font-medium text-gray-400 border-b border-gray-200 pb-2 mb-2 px-2 select-none sticky top-0 bg-white z-10">
        <div className="flex-[2] py-2 px-3 border-r border-gray-100">名稱</div>
        <div className="w-28 py-2 px-3 border-r border-gray-100">狀態</div>
        <div className="w-24 py-2 px-3 border-r border-gray-100">優先級</div>
        <div className="flex-1 py-2 px-3 border-r border-gray-100">標籤</div>
        <div className="w-28 py-2 px-3 text-right">更新</div>
      </div>

      {groupedData.map((group, _groupIndex) => (
        <div key={group.project ? group.project.id : 'uncategorized'} className="mb-0">
          {/* Project Header Row */}
          {group.project && (
            <div className="flex items-center py-2 px-3 bg-white group hover:bg-gray-50 border-b border-gray-100">
              <div className="flex-[2] flex items-center gap-2">
                <Folder size={16} className="text-gray-400 fill-gray-50" />
                <span className="font-semibold text-sm text-gray-800">{group.project.title}</span>
              </div>
              <div className="w-28 text-xs text-gray-400">
                {/* Project Status or Meta */}
              </div>
              <div className="w-24"></div>
              <div className="flex-1"></div>
              <div className="w-28 text-right text-xs text-gray-400 font-mono">
                {formatDate(group.project.updatedAt)}
              </div>
            </div>
          )}

          {/* Prompt Rows */}
          {group.prompts.map((prompt, _index) => {
            const _isLast = _index === group.prompts.length - 1;
            // Indent logic mainly applies if there is a project
            const hasIndent = !!group.project;

            return (
              <div
                key={prompt.id}
                onClick={() => onSelectPrompt(prompt)}
                className={`flex items-center hover:bg-gray-50 cursor-pointer border-b border-gray-100 transition-colors relative group prompt-row ${selectedPromptId === prompt.id ? 'bg-blue-50' : ''}`}
              >
                <div className="flex-[2] flex items-center py-1.5 px-3 border-r-0 border-gray-100 overflow-hidden relative">
                  {/* Connector Line for Project Children - REMOVED per user feedback */}

                  {/* Icon & Title - Indent if projected */}
                  <div className={`${hasIndent ? 'pl-6' : ''} flex items-center overflow-hidden`}>
                    <FileText size={16} className="text-gray-400 flex-shrink-0 mr-2" />
                    <span className="text-gray-700 font-medium text-xs group-hover:underline decoration-gray-300 underline-offset-2 truncate">
                      {prompt.title}
                    </span>
                  </div>
                </div>

                <div className="w-28 py-1.5 px-3 border-r-0 border-gray-100 flex items-center">
                  <StatusBadge status={prompt.status} labels={{ draft: '草稿', tuning: '調整中', ready: '就緒', disabled: '停用', deprecated: '已廢棄', needs_review: '待審閱' }} />
                </div>

                <div className="w-24 py-1.5 px-3 border-r-0 border-gray-100 text-xs text-gray-500 flex items-center">
                  {prompt.priority}
                </div>

                <div className="flex-1 py-1.5 px-3 border-r-0 border-gray-100 flex gap-1 overflow-hidden items-center">
                  {(prompt.tags ?? []).slice(0, 2).map((t, i) => (
                    <Badge key={i} color="gray">{t}</Badge>
                  ))}
                </div>

                <div className="w-28 py-1.5 px-3 text-right text-xs text-gray-400 font-mono flex items-center justify-end">
                  {formatDate(prompt.updatedAt)}
                </div>
              </div>
            );
          })}

          {/* New Prompt Row (Only for Projects) */}
          {group.project && (
            <div className="flex items-center py-1.5 px-3 border-b border-gray-100 hover:bg-gray-50 cursor-pointer text-gray-500 hover:text-blue-600 transition-colors"
              onClick={() => {
                // Mock create action or open create modal with projectId preset
                console.log('Create new prompt for project:', group.project?.id);
                const _newId = 'new_' + Date.now();
                // Ideally call a prop function here
              }}
            >
              <div className="flex-[2] flex items-center relative pl-6">
                <Plus size={14} className="mr-2" />
                <span className="text-xs">新增提示詞...</span>
              </div>
              <div className="w-28"></div>
              <div className="w-24"></div>
              <div className="flex-1"></div>
              <div className="w-28"></div>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}

function BoardView({
  prompts,
  onSelectPrompt,
  selectedPromptId,
}: {
  prompts: PromptEntity[];
  onSelectPrompt: (prompt: PromptEntity) => void;
  selectedPromptId: string | null;
}) {
  const columns = [
    { id: 'draft', label: '草稿' },
    { id: 'tuning', label: '調整中' },
    { id: 'ready', label: '就緒' },
    { id: 'disabled', label: '停用' },
  ] as const;

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
            {prompts
              .filter(p => p.status === col.id)
              .map(prompt => (
                <div
                  key={prompt.id}
                  onClick={() => onSelectPrompt(prompt)}
                  className={`bg-white p-3 rounded-[3px] shadow-sm hover:shadow-md cursor-pointer transition-all border border-gray-200/50 hover:border-gray-300 group ${selectedPromptId === prompt.id ? 'ring-2 ring-blue-500' : ''
                    }`}
                >
                  <div className="flex items-start justify-between mb-2">
                    <span className="font-medium text-gray-800 leading-tight text-xs">{prompt.title}</span>
                    {prompt.priority === 'high' && (
                      <div className="w-1.5 h-1.5 rounded-full bg-red-400 mt-1" title="High Priority" />
                    )}
                  </div>
                  <div className="flex flex-wrap gap-1">
                    {(prompt.tags ?? []).slice(0, 3).map((tag, i) => (
                      <span
                        key={`${prompt.id}:${tag}:${i}`}
                        className="text-[10px] px-1.5 py-0.5 bg-gray-50 text-gray-500 rounded-[2px] border border-gray-100"
                      >
                        {tag}
                      </span>
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

// StatusBadge 使用 PrototypeBadges.tsx，以確保樣式映射與 prototype 一致

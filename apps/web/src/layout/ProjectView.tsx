import { useState, useEffect, useCallback } from 'react';
import { FolderOpen, ChevronDown, ChevronRight, ChevronUp, Plus } from 'lucide-react';
import { useUiStore } from '../state/uiStore';
import { getProjects, createProject, updateProject, createPrompt } from '../features/library/api';
import { ProjectEntity } from '@pah/contracts';
import { formatDateOnly } from '../utils/date';
import { DragDropContext, Droppable, Draggable, DropResult } from '@hello-pangea/dnd';

export function ProjectView() {
  const { projectSubView, searchQuery } = useUiStore();
  const [projects, setProjects] = useState<ProjectEntity[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchProjects = useCallback(async (isInitialLoad: boolean = false) => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await getProjects(); // Backend doesn't support q yet, so we fetch all
      setProjects(data);
      // Only expand all projects on initial load, preserve user's state on subsequent refreshes
      if (isInitialLoad) {
        useUiStore.getState().setExpandedProjects(data.map(p => p.id));
      }
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Failed to fetch projects');
    } finally {
      setIsLoading(false);
    }
  }, []); // Only fetch once (refresh on entity-change)

  const filteredProjects = projects.filter(p => {
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    return (
      p.title.toLowerCase().includes(q) ||
      p.tags.some(t => t.toLowerCase().includes(q)) ||
      (p.summary || '').toLowerCase().includes(q)
    );
  });

  useEffect(() => {
    fetchProjects(true); // Initial load - expand all projects

    // Listen for entity changes to refresh list (preserve expanded state)
    const handleEntityChange = () => fetchProjects(false);
    window.addEventListener('entity-change', handleEntityChange);
    return () => window.removeEventListener('entity-change', handleEntityChange);
  }, [fetchProjects]);



  if (isLoading && projects.length === 0) {
    return <div className="p-8 text-gray-400">Loading projects...</div>;
  }

  if (error) {
    return <div className="p-8 text-red-500">Error: {error}</div>;
  }

  return (
    <div className="h-full flex flex-col">
      <div className="flex-1 overflow-hidden">
        {projectSubView === 'board' ? (
          <ProjectBoard projects={filteredProjects} />
        ) : (
          <ProjectList projects={filteredProjects} />
        )}
      </div>
    </div>
  );
}


// --- Constitutional Components ---

const StatusBadge = ({ status }: { status: string }) => {
  const styles: Record<string, string> = {
    in_progress: 'text-blue-700 bg-blue-50 border border-blue-100', // Blue: Rational/Active
    planned: 'text-green-700 bg-green-50 border border-green-100', // Green: Now Planned (User Request)
    done: 'text-gray-600 bg-gray-100 border border-gray-200',    // Gray: Now Done (User Request)
    paused: 'text-yellow-700 bg-yellow-50 border border-yellow-100', // Yellow: Paused
  };

  const labels: Record<string, string> = {
    in_progress: '進行中',
    planned: '規劃中',
    paused: '暫停',
    done: '完成',
  };

  return (
    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${styles[status] || styles.planned}`}>
      {labels[status] || status}
    </span>
  );
};

const TagPill = ({ text }: { text: string }) => (
  // Colored pills for tags
  <span className="text-xs px-2 py-0.5 bg-gray-50 text-gray-600 rounded-md border border-gray-200 truncate">
    {text}
  </span>
);

// --- Nested Prompts Component ---
import { getPrompts } from '../features/library/api';
import { PromptEntity } from '@pah/contracts';
import { FileText } from 'lucide-react';

const promptStatusLabels: Record<string, string> = {
  draft: '草稿',
  needs_review: '待審閱',
  ready: '可用',
  deprecated: '已棄用',
  tuning: '調整中',
  disabled: '停用',
};
function ProjectPrompts({ projectId }: { projectId: string }) {
  const [prompts, setPrompts] = useState<PromptEntity[]>([]);
  const [loading, setLoading] = useState(true);
  const { setSelectedItem } = useUiStore();

  useEffect(() => {
    const fetchData = () => {
      setLoading(true);
      getPrompts({ project: projectId })
        .then(setPrompts)
        .catch(console.error)
        .finally(() => setLoading(false));
    };

    fetchData();

    // Listen for entity changes to refresh prompts list
    const handleEntityChange = () => fetchData();
    window.addEventListener('entity-change', handleEntityChange);
    return () => window.removeEventListener('entity-change', handleEntityChange);
  }, [projectId]);

  if (loading) return <div className="py-2 pl-12 text-xs text-gray-400">Loading prompts...</div>;

  if (prompts.length === 0) {
    return (
      <div className="py-2 pl-12 text-xs text-gray-400 italic">
        No prompts in this project.
      </div>
    );
  }

  return (
    <div className="w-full">
      {prompts.map(prompt => (
        <div
          key={prompt.id}
          className="w-full grid grid-cols-[0.3fr_3fr_0.8fr_1.2fr_1fr] gap-2 items-center hover:bg-gray-50 cursor-pointer border-b border-gray-50 h-10 group/prompt"
          onClick={(e) => {
            e.stopPropagation();
            setSelectedItem({ type: 'prompt', id: prompt.id });
          }}
        >
          {/* Empty first column for alignment */}
          <div className="py-2 px-1"></div>

          {/* Indented Name Column */}
          <div className="flex items-center py-2 px-2 overflow-hidden pl-6">
            <div className="mr-2 text-gray-400 flex-shrink-0">
              <FileText size={14} />
            </div>
            <span className="text-gray-900 text-base truncate group-hover/prompt:text-blue-600 transition-colors">
              {prompt.title}
            </span>
          </div>

          <div className="py-2 px-2 flex items-center">
            <span className={`text-base px-1.5 py-0.5 rounded border ${prompt.status === 'draft' ? 'bg-green-50 text-green-700 border-green-100' :
              prompt.status === 'needs_review' ? 'bg-blue-50 text-blue-700 border-blue-100' :
                prompt.status === 'ready' ? 'bg-gray-50 text-gray-600 border-gray-100' :
                  prompt.status === 'deprecated' ? 'bg-yellow-50 text-yellow-700 border-yellow-100' :
                    'bg-gray-50 text-gray-500 border-gray-200'
              }`}>
              {promptStatusLabels[prompt.status] || prompt.status}
            </span>
          </div>

          <div className="py-2 px-2 flex gap-1 overflow-hidden items-center flex-wrap">
            {prompt.tags.slice(0, 2).map(t => (
              <span key={t} className="text-sm text-gray-400 bg-white border border-gray-100 px-1 rounded truncate max-w-[80px]">
                {t}
              </span>
            ))}
            {prompt.tags.length > 2 && <span className="text-sm text-gray-400">+{prompt.tags.length - 2}</span>}
          </div>

          <div className="py-2 px-2 text-right text-base text-gray-400 font-mono">
            {formatDateOnly(prompt.updatedAt)}
          </div>
        </div>
      ))}

      {/* New Prompt Row */}
      <div
        className="w-full grid grid-cols-[0.3fr_3fr_0.8fr_1.2fr_1fr] gap-2 items-center hover:bg-gray-50 cursor-pointer border-b border-gray-50 h-10 text-gray-500 hover:text-blue-600 transition-colors"
        onClick={() => {
          createPrompt({
            title: '新增提示詞',
            projectId: projectId,
            tags: [],
            status: 'draft',
            priority: 'medium',
            category: ''
          })
            .then((newPrompt) => {
              setSelectedItem({ type: 'prompt', id: newPrompt.id });
              window.dispatchEvent(new CustomEvent('entity-change'));
            })
            .catch((err) => console.error('Failed to create prompt:', err));
        }}
      >
        <div className="py-2 px-1"></div>
        <div className="flex items-center py-2 px-2 overflow-hidden pl-6">
          <Plus size={14} className="mr-2" />
          <span className="text-base">新增提示詞...</span>
        </div>
        <div></div>
        <div></div>
        <div></div>
      </div>
    </div>
  );
}

function ProjectList({ projects }: { projects: ProjectEntity[] }) {
  const { expandedProjects, toggleProjectExpanded, setSelectedItem } = useUiStore();

  // Sorting state
  const [sortField, setSortField] = useState<'title' | 'status' | 'updatedAt'>('updatedAt');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');

  const handleSort = (field: typeof sortField) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  const sortedProjects = [...projects].sort((a, b) => {
    let cmp = 0;
    switch (sortField) {
      case 'title':
        cmp = a.title.localeCompare(b.title);
        break;
      case 'status':
        cmp = a.status.localeCompare(b.status);
        break;
      case 'updatedAt':
        cmp = new Date(a.updatedAt).getTime() - new Date(b.updatedAt).getTime();
        break;
    }
    return sortDirection === 'asc' ? cmp : -cmp;
  });

  const SortIndicator = ({ field }: { field: typeof sortField }) => {
    if (sortField !== field) return null;
    return sortDirection === 'asc' ? <ChevronUp size={12} className="ml-0.5" /> : <ChevronDown size={12} className="ml-0.5" />;
  };

  return (
    // Full width layout - matching PromptList
    <div className="h-full w-full overflow-y-auto overflow-x-auto pb-20 pt-2 custom-scrollbar px-4">
      <div className="w-full grid grid-cols-[0.3fr_3fr_0.8fr_1.2fr_1fr] gap-2 text-base font-medium text-gray-400 border-b border-gray-100 bg-white sticky top-0 z-10 items-center">
        <div className="py-2 px-1"></div>
        <div className="py-2 px-2 flex items-center cursor-pointer hover:text-gray-600 select-none" onClick={() => handleSort('title')}>
          名稱<SortIndicator field="title" />
        </div>
        <div className="py-2 px-2 flex items-center cursor-pointer hover:text-gray-600 select-none" onClick={() => handleSort('status')}>
          狀態<SortIndicator field="status" />
        </div>
        <div className="py-2 px-2">標籤</div>
        <div className="py-2 px-2 flex items-center justify-end cursor-pointer hover:text-gray-600 select-none" onClick={() => handleSort('updatedAt')}>
          更新<SortIndicator field="updatedAt" />
        </div>
      </div>

      {sortedProjects.map((project) => (
        <div key={project.id} className="group relative border-b border-gray-100 last:border-0">
          <div
            className="w-full flex items-center hover:bg-gray-50 cursor-pointer select-none transition-colors h-12 bg-white z-10 relative border-b border-gray-100"
            onClick={() => setSelectedItem({ type: 'project', id: project.id })}
          >
            <div className="w-[3%] flex justify-center flex-shrink-0 min-w-[30px]">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  toggleProjectExpanded(project.id);
                }}
                className="p-1 hover:bg-gray-200 rounded text-gray-400 transition-colors"
              >
                {expandedProjects.includes(project.id) ? (
                  <ChevronDown size={14} />
                ) : (
                  <ChevronRight size={14} />
                )}
              </button>
            </div>

            <div className="flex items-center py-2 px-2 overflow-hidden flex-1">
              <div className="mr-2 p-1 bg-gray-50 rounded border border-gray-100 text-gray-500 flex-shrink-0">
                <FolderOpen size={14} />
              </div>
              <span className="font-medium text-gray-900 text-base truncate group-hover:text-blue-600 transition-colors" title={project.title}>{project.title}</span>
            </div>
          </div>

          {
            expandedProjects.includes(project.id) && (
              <div className="bg-gray-50/30 border-t border-gray-100">
                <ProjectPrompts projectId={project.id} />
              </div>
            )
          }
        </div>
      ))
      }

      {
        projects.length === 0 && (
          <div className="p-16 text-center text-gray-400 text-sm italic">
            No projects found. Create one to get started.
          </div>
        )
      }
    </div >
  );
}

function ProjectBoard({ projects }: { projects: ProjectEntity[] }) {
  const { setSelectedItem } = useUiStore();
  const columns = [
    { id: 'planned', label: '規劃中' },
    { id: 'in_progress', label: '進行中' },
    { id: 'paused', label: '暫停' },
    { id: 'done', label: '完成' },
  ];

  const onDragEnd = (result: DropResult) => {
    const { destination, source, draggableId } = result;

    if (!destination) {
      return;
    }

    if (
      destination.droppableId === source.droppableId &&
      destination.index === source.index
    ) {
      return;
    }

    const newStatus = destination.droppableId as any;

    updateProject(draggableId, { status: newStatus })
      .then(() => {
        window.dispatchEvent(new CustomEvent('entity-change'));
      })
      .catch((err) => {
        console.error('Failed to move project', err);
        alert('Failed to move project');
      });
  };

  return (
    <DragDropContext onDragEnd={onDragEnd}>
      <div className="flex gap-4 h-full w-full overflow-x-auto bg-white p-0 pt-2">
        {columns.map((col) => (
          <div key={col.id} className="flex-1 flex flex-col min-w-[280px]">
            <div className="flex items-center justify-between px-2 py-2">
              <div className={`px-2 py-1 rounded text-[15px] font-semibold flex items-center gap-2 ${col.id === 'planned' ? 'bg-green-50 text-green-600' :
                col.id === 'in_progress' ? 'bg-blue-50 text-blue-600' :
                  col.id === 'paused' ? 'bg-yellow-50 text-yellow-600' :
                    col.id === 'done' ? 'bg-gray-100 text-gray-600' : 'bg-gray-100 text-gray-600'
                }`}>
                {/* Status Dot (Notion style: small colored text, or actual dot) */}
                {/* Trying actual dot */}
                <span className={`w-1.5 h-1.5 rounded-full ${col.id === 'planned' ? 'bg-green-400' :
                  col.id === 'in_progress' ? 'bg-blue-400' :
                    col.id === 'paused' ? 'bg-yellow-400' :
                      col.id === 'done' ? 'bg-gray-400' : 'bg-gray-400'
                  }`}></span>
                {col.label}
              </div>
              <span className="text-sm text-gray-400 font-mono pr-2">
                {projects.filter((p) => p.status === col.id).length}
              </span>
            </div>

            <Droppable droppableId={col.id}>
              {(provided, snapshot) => (
                <div
                  {...provided.droppableProps}
                  ref={provided.innerRef}
                  className={`flex-1 overflow-y-auto px-2 pb-2 custom-scrollbar transition-colors rounded mx-1.5 ${col.id === 'planned' ? 'bg-green-50/50' :
                    col.id === 'in_progress' ? 'bg-blue-50/50' :
                      col.id === 'paused' ? 'bg-yellow-50/50' :
                        col.id === 'done' ? 'bg-gray-50/50' : 'bg-gray-50/50'
                    } ${snapshot.isDraggingOver ? 'bg-opacity-100 brightness-95' : ''}`}
                >
                  <div className="h-2"></div>
                  {projects
                    .filter((p) => p.status === col.id)
                    .map((project, index) => (
                      <Draggable key={project.id} draggableId={project.id} index={index}>
                        {(provided, snapshot) => (
                          <div
                            ref={provided.innerRef}
                            {...provided.draggableProps}
                            {...provided.dragHandleProps}
                            style={{ ...provided.draggableProps.style }}
                            onClick={() => setSelectedItem({ type: 'project', id: project.id })}
                            className={`bg-white p-3 rounded shadow-sm hover:shadow-md cursor-pointer transition-all border border-gray-200/40 hover:border-gray-300 group relative flex flex-col min-h-[120px] mb-2 ${snapshot.isDragging ? 'shadow-lg rotate-1 ring-2 ring-blue-500/20' : ''}`}
                          >
                            <div className="flex items-start justify-between mb-2">
                              <span className="font-medium text-gray-800 leading-tight flex items-center gap-1.5 break-all">
                                <FolderOpen size={14} className="text-gray-800/70 flex-shrink-0" />
                                {project.title}
                              </span>
                            </div>
                            <div className="flex items-center text-xs text-gray-400 mb-2 truncate">
                              <span className="truncate">{project.summary || ''}</span>
                            </div>
                            <div className="flex items-end justify-between gap-2 mt-auto">
                              <div className="flex flex-wrap gap-1 flex-1 overflow-hidden">
                                {project.tags.slice(0, 2).map((tag: string) => (
                                  <span key={tag} className="text-[10px] px-1 py-0.5 bg-gray-50 text-gray-500 rounded border border-gray-100 truncate max-w-[70px]">{tag}</span>
                                ))}
                                {project.tags.length > 2 && <span className="text-[10px] text-gray-400">+{project.tags.length - 2}</span>}
                              </div>
                              <span className="text-sm text-gray-400 font-mono flex-shrink-0">
                                {formatDateOnly(project.updatedAt)}
                              </span>
                            </div>
                          </div>
                        )}
                      </Draggable>
                    ))}
                  {provided.placeholder}

                  {/* Add New Button inside scrollable area, after cards - Notion Style */}
                  <button
                    onClick={() => {
                      createProject({ title: '新增專案', status: col.id as any })
                        .then((newProject) => {
                          useUiStore.getState().setSelectedItem({ type: 'project', id: newProject.id });
                          window.dispatchEvent(new CustomEvent('entity-change'));
                        })
                        .catch((err) => {
                          // Handle slug/create errors gracefully
                          alert('Create failed: ' + err.message);
                        });
                    }}
                    className={`mt-1 w-full py-1.5 px-2 text-sm rounded transition-colors flex items-center justify-start gap-2 flex-shrink-0 ${col.id === 'planned' ? 'text-green-600 hover:bg-green-100' :
                      col.id === 'in_progress' ? 'text-blue-600 hover:bg-blue-100' :
                        col.id === 'paused' ? 'text-yellow-600 hover:bg-yellow-100' :
                          col.id === 'done' ? 'text-gray-500 hover:bg-gray-100' : 'text-gray-500 hover:bg-gray-100'
                      }`}
                  >
                    <Plus size={14} /> 新增
                  </button>
                </div>
              )}
            </Droppable>
          </div>
        ))}
      </div>
    </DragDropContext>
  );
}

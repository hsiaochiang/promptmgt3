import { useState, useEffect, useCallback } from 'react';
import { FolderOpen, ChevronDown, ChevronRight, Plus } from 'lucide-react';
import { useUiStore } from '../state/uiStore';
import { getProjects, createProject } from '../features/library/api';
import { ProjectEntity } from '@pah/contracts';
import { formatDate } from '../utils/date';

export function ProjectView() {
  const { projectSubView, searchQuery } = useUiStore();
  const [projects, setProjects] = useState<ProjectEntity[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchProjects = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await getProjects(); // Backend doesn't support q yet, so we fetch all
      setProjects(data);
      // Default expand all projects
      useUiStore.getState().setExpandedProjects(data.map(p => p.id));
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
    fetchProjects();

    // Listen for entity changes to refresh list
    const handleEntityChange = () => fetchProjects();
    window.addEventListener('entity-change', handleEntityChange);
    return () => window.removeEventListener('entity-change', handleEntityChange);
  }, [fetchProjects]);

  const handleCreateProject = async () => {
    try {
      await createProject({ title: 'New Project' });
      fetchProjects();
    } catch (err: any) {
      alert('Failed to create project: ' + err.message);
    }
  };

  if (isLoading && projects.length === 0) {
    return <div className="p-8 text-gray-400">Loading projects...</div>;
  }

  if (error) {
    return <div className="p-8 text-red-500">Error: {error}</div>;
  }

  return (
    <div className="h-full flex flex-col">
      <div className="flex-none px-4 py-2 flex justify-between items-center bg-white border-b border-gray-100">
        <h2 className="text-sm font-semibold text-gray-700">Projects</h2>
        <button
          onClick={handleCreateProject}
          className="flex items-center gap-1 text-xs bg-gray-900 text-white px-2 py-1 rounded hover:bg-gray-700 transition-colors"
        >
          <Plus size={14} /> New
        </button>
      </div>

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
    planned: 'text-gray-600 bg-gray-100 border border-gray-200',    // Gray: Planned
    paused: 'text-yellow-700 bg-yellow-50 border border-yellow-100', // Yellow: Warning/Paused
    done: 'text-green-700 bg-green-50 border border-green-100',    // Green: Life/Done
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
  <span className="text-[10px] px-1.5 py-0.5 bg-gray-50 text-gray-600 rounded-md border border-gray-200 truncate">
    {text}
  </span>
);

// --- Nested Prompts Component ---
import { getPrompts } from '../features/library/api';
import { PromptEntity } from '@pah/contracts';
import { FileText } from 'lucide-react';

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
    <div className="">
      {prompts.map(prompt => (
        <div
          key={prompt.id}
          className="grid grid-cols-[minmax(400px,4fr)_120px_minmax(200px,2fr)_120px_60px] gap-4 items-center hover:bg-gray-50 cursor-pointer border-b border-gray-50 h-10 group/prompt"
          onClick={(e) => {
            e.stopPropagation();
            setSelectedItem({ type: 'prompt', id: prompt.id });
          }}
        >
          {/* Indented Name Column */}
          <div className="flex items-center py-2 px-3 overflow-hidden relative pl-12">
            <div className="mr-3 text-gray-400 flex-shrink-0">
              <span className="inline-block w-4 border-l border-b border-gray-300 h-2.5 mr-2 -translate-y-1"></span>
              <FileText size={14} className="inline-block -translate-y-0.5" />
            </div>
            <span className="text-gray-600 text-sm truncate group-hover/prompt:text-blue-600 transition-colors">
              {prompt.title}
            </span>
          </div>

          <div className="py-2 px-3 flex items-center">
            <span className={`text-[10px] px-1.5 py-0.5 rounded border ${prompt.status === 'ready' ? 'bg-green-50 text-green-700 border-green-100' :
              prompt.status === 'draft' ? 'bg-gray-50 text-gray-500 border-gray-200' :
                'bg-yellow-50 text-yellow-700 border-yellow-100'
              }`}>
              {prompt.status}
            </span>
          </div>

          <div className="py-2 px-3 flex gap-1 overflow-hidden items-center">
            {prompt.tags.slice(0, 2).map(t => (
              <span key={t} className="text-[10px] text-gray-400 bg-white border border-gray-100 px-1 rounded truncate max-w-[80px]">
                {t}
              </span>
            ))}
            {prompt.tags.length > 2 && <span className="text-[10px] text-gray-300">+{prompt.tags.length - 2}</span>}
          </div>

          <div className="py-2 px-3 text-right text-xs text-gray-300 font-mono">
            {formatDate(prompt.updatedAt).split(' ')[0]}
          </div>

          <div className=""></div>
        </div>
      ))}
    </div>
  );
}

function ProjectList({ projects }: { projects: ProjectEntity[] }) {
  const { expandedProjects, toggleProjectExpanded, setSelectedItem } = useUiStore();

  return (
    <div className="h-full overflow-y-auto pb-20 pt-2 custom-scrollbar px-6">
      <div className="grid grid-cols-[minmax(400px,4fr)_120px_minmax(200px,2fr)_120px_60px] gap-4 text-xs font-medium text-gray-400 border-b border-gray-100 bg-white sticky top-0 z-10 items-center">
        <div className="py-2 px-3">名稱</div>
        <div className="py-2 px-3">狀態</div>
        <div className="py-2 px-3">標籤</div>
        <div className="py-2 px-3 text-right">更新</div>
        <div className=""></div>
      </div>

      {projects.map((project) => (
        <div key={project.id} className="group relative border-b border-gray-100 last:border-0">
          <div
            className="grid grid-cols-[minmax(400px,4fr)_120px_minmax(200px,2fr)_120px_60px] gap-4 items-center hover:bg-gray-50 cursor-pointer select-none transition-colors h-12 bg-white z-10 relative"
            onClick={() => setSelectedItem({ type: 'project', id: project.id })}
          >
            <div className="flex items-center py-2 px-3 overflow-hidden relative">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  toggleProjectExpanded(project.id);
                }}
                className="p-1 hover:bg-gray-200 rounded text-gray-400 transition-colors mr-2 flex-shrink-0"
              >
                {expandedProjects.includes(project.id) ? (
                  <ChevronDown size={14} />
                ) : (
                  <ChevronRight size={14} />
                )}
              </button>
              <div className="mr-3 p-1 bg-gray-50 rounded border border-gray-100 text-gray-500 flex-shrink-0">
                <FolderOpen size={16} />
              </div>
              <span className="font-medium text-gray-900 text-sm truncate" title={project.title}>{project.title}</span>
            </div>

            <div className="py-2 px-3 flex items-center">
              <StatusBadge status={project.status} />
            </div>

            <div className="py-2 px-3 flex gap-1 overflow-hidden items-center">
              {project.tags.map((t: string) => <TagPill key={t} text={t} />)}
            </div>

            <div className="py-2 px-3 text-right text-xs text-gray-400 font-mono">
              {formatDate(project.updatedAt)}
            </div>

            <div className="flex justify-center opacity-0 group-hover:opacity-100 transition-opacity">
              <button className="text-[10px] border border-gray-200 bg-white px-2 py-0.5 rounded shadow-sm hover:bg-gray-50 text-gray-600">
                OPEN
              </button>
            </div>
          </div>

          {expandedProjects.includes(project.id) && (
            <div className="bg-gray-50/30 border-t border-gray-100">
              <ProjectPrompts projectId={project.id} />
            </div>
          )}
        </div>
      ))}

      {projects.length === 0 && (
        <div className="p-16 text-center text-gray-400 text-sm italic">
          No projects found. Create one to get started.
        </div>
      )}
    </div>
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

  return (
    <div className="flex gap-4 h-full min-w-[1000px] overflow-x-auto p-4 bg-[#F7F7F5]">
      {columns.map((col) => (
        <div key={col.id} className="flex-1 flex flex-col min-w-[240px]">
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
                  className="bg-white p-3 rounded-[3px] shadow-sm hover:shadow-md cursor-pointer transition-all border border-gray-200/50 hover:border-gray-300 group relative"
                >
                  <div className="flex items-start justify-between mb-2">
                    <span className="font-medium text-gray-800 leading-tight flex items-center gap-2 break-all">
                      {/* Icon (Object Dignity) */}
                      <span className="p-0.5 bg-gray-50 rounded border border-gray-100 text-gray-400">
                        <FolderOpen size={12} />
                      </span>
                      {project.title}
                    </span>
                  </div>
                  <div className="text-xs text-gray-500 mb-3 line-clamp-2 h-8 leading-relaxed">
                    {project.summary || 'No summary'}
                  </div>
                  <div className="flex flex-wrap gap-1">
                    {project.tags.map((tag: string) => (
                      <span key={tag} className="text-[10px] px-1 py-0.5 bg-gray-50 text-gray-500 rounded border border-gray-100 truncate max-w-[100px]">{tag}</span>
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

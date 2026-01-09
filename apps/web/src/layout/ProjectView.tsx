import { useState, useEffect, useCallback } from 'react';
import { FolderOpen, ChevronDown, ChevronRight, Plus } from 'lucide-react';
import { useUiStore } from '../state/uiStore';
import { getProjects, createProject } from '../features/library/api';
import { ProjectEntity } from '@pah/contracts';

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

function ProjectList({ projects }: { projects: ProjectEntity[] }) {
  const { expandedProjects, toggleProjectExpanded, setSelectedItem } = useUiStore();

  return (
    <div className="h-full overflow-y-auto pb-20 pt-2 custom-scrollbar">
      <div className="flex text-xs font-medium text-gray-400 border-b border-gray-200 bg-white sticky top-0 z-10">
        <div className="flex-[2] py-2 px-3 border-r border-gray-100">名稱</div>
        <div className="w-28 py-2 px-3 border-r border-gray-100">狀態</div>
        <div className="w-24 py-2 px-3 border-r border-gray-100">優先級</div>
        <div className="flex-1 py-2 px-3 border-r border-gray-100">標籤</div>
        <div className="w-28 py-2 px-3 text-right">更新</div>
      </div>

      {projects.map((project) => (
        <div key={project.id} className="group mb-1">
          <div
            className="flex items-center hover:bg-gray-50 cursor-pointer select-none transition-colors border-b border-gray-100"
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
              <FolderOpen size={16} className="text-blue-500/70 flex-shrink-0 mr-2" />
              <span className="font-medium text-gray-900 text-sm truncate">{project.title}</span>
            </div>
            <div className="w-28 py-2 px-3 flex items-center text-xs text-gray-500">{project.status}</div>
            <div className="w-24 py-2 px-3"></div>
            <div className="flex-1 py-2 px-3 flex gap-1 overflow-hidden">
              {project.tags.map((t: string) => <span key={t} className="text-[10px] bg-gray-100 px-1 rounded truncate">{t}</span>)}
            </div>
            <div className="w-28 py-2 px-3 text-right text-xs text-gray-400 font-mono">
              {new Date(project.updatedAt).toLocaleDateString()}
            </div>
          </div>

          {expandedProjects.includes(project.id) && (
            <div className="bg-gray-50/50 py-2 pl-10 text-xs text-gray-400 italic border-b border-gray-100">
              {/* Later we can load prompts for this project here */}
              (Prompts list coming soon...)
            </div>
          )}
        </div>
      ))}

      {projects.length === 0 && (
        <div className="p-8 text-center text-gray-400 text-sm">
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
                  className="bg-white p-3 rounded-[3px] shadow-sm hover:shadow-md cursor-pointer transition-all border border-gray-200/50 hover:border-gray-300 group"
                >
                  <div className="flex items-start justify-between mb-2">
                    <span className="font-medium text-gray-800 leading-tight flex items-center gap-1.5 break-all">
                      <FolderOpen size={14} className="text-blue-500/70 flex-shrink-0" />
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

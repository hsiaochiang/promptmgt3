import { useState, useEffect, useCallback } from 'react';
import { FileText, Folder, Trash2, Plus, ChevronUp, ChevronDown } from 'lucide-react';
import { useUiStore } from '../state/uiStore';
import { getPrompts, getProjects, deletePrompt, createPrompt, updatePrompt } from '../features/library/api';
import { DragDropContext, Droppable, Draggable, DropResult } from '@hello-pangea/dnd';
import { PromptEntity } from '@pah/contracts';


export function PromptView() {
  const { promptSubView, searchQuery } = useUiStore();
  const [prompts, setPrompts] = useState<PromptEntity[]>([]);
  const [projectMap, setProjectMap] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Selection state
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

  const fetchData = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const [promptsData, projectsData] = await Promise.all([
        getPrompts(),
        getProjects()
      ]);
      setPrompts(promptsData);

      const map: Record<string, string> = {};
      projectsData.forEach(p => {
        map[p.id] = p.title;
      });
      setProjectMap(map);
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Failed to fetch data');
    } finally {
      setIsLoading(false);
    }
  }, []);

  const filteredPrompts = prompts.filter(p => {
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    const projectName = projectMap[p.projectId]?.toLowerCase() || '';
    return (
      p.title.toLowerCase().includes(q) ||
      p.tags.some(t => t.toLowerCase().includes(q)) ||
      projectName.includes(q)
    );
  });

  // Handle delete
  const handleDelete = async () => {
    if (selectedIds.size === 0) return;
    if (!confirm(`Are you sure you want to delete ${selectedIds.size} items?`)) return;

    try {
      await Promise.all(Array.from(selectedIds).map(id => deletePrompt(id)));
      setSelectedIds(new Set()); // Clear selection
      // CRITICAL: Refresh list to remove deleted items
      fetchData();
    } catch (err) {
      console.error('Delete failed', err);
      alert('Failed to delete some items');
    }
  };

  useEffect(() => {
    fetchData();

    // Listen for entity changes
    const handleEntityChange = () => fetchData();
    window.addEventListener('entity-change', handleEntityChange);
    return () => window.removeEventListener('entity-change', handleEntityChange);
  }, [fetchData]);

  if (isLoading && prompts.length === 0) {
    return <div className="p-8 text-gray-400">Loading prompts...</div>;
  }

  if (error) {
    return <div className="p-8 text-red-500">Error: {error}</div>;
  }

  return (
    <div className="h-full flex flex-col">
      {selectedIds.size > 0 && (
        <div className="flex-none px-4 py-2 flex justify-start items-center bg-white border-b border-gray-100 min-h-[50px]">
          <button
            onClick={handleDelete}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-red-50 text-red-600 rounded hover:bg-red-100 text-xs font-medium transition-colors"
            title="Move to Trash"
          >
            <Trash2 size={14} />
            Delete ({selectedIds.size})
          </button>
        </div>
      )}

      <div className="flex-1 overflow-hidden">
        {promptSubView === 'board' ? (
          <PromptBoard prompts={filteredPrompts} projectMap={projectMap} />
        ) : (
          <PromptList
            prompts={filteredPrompts}
            projectMap={projectMap}
            selectedIds={selectedIds}
            setSelectedIds={setSelectedIds}
          />
        )}
      </div>
    </div>
  );
}

const StatusBadge = ({ status }: { status: string }) => {
  const styles: Record<string, string> = {
    draft: 'text-green-700 bg-green-50 border border-green-100', // Green: Start
    needs_review: 'text-blue-700 bg-blue-50 border border-blue-100', // Blue: Active
    ready: 'text-gray-600 bg-gray-100 border border-gray-200',    // Gray: Finished
    deprecated: 'text-yellow-700 bg-yellow-50 border border-yellow-100', // Yellow: Paused
    tuning: 'text-blue-700 bg-blue-50 border border-blue-100',
    disabled: 'text-gray-400 bg-gray-50 border border-gray-200 dashed',
  };

  const labels: Record<string, string> = {
    draft: '草稿',
    needs_review: '待審閱',
    ready: '可用',
    deprecated: '已棄用',
    tuning: '調整中',
    disabled: '停用',
  };

  return (
    <span className={`text-base px-2 py-0.5 rounded-md font-medium ${styles[status] || styles.draft}`}>
      {labels[status] || status}
    </span>
  );
};

const TagPill = ({ text }: { text: string }) => (
  <span className="text-sm px-1.5 py-0.5 bg-gray-50 text-gray-400 rounded-md border border-gray-200 truncate">
    {text}
  </span>
);

interface PromptListProps {
  prompts: PromptEntity[];
  projectMap: Record<string, string>;
  selectedIds: Set<string>;
  setSelectedIds: (ids: Set<string>) => void;
}

function PromptList({ prompts, projectMap, selectedIds, setSelectedIds }: PromptListProps) {
  const { setSelectedItem } = useUiStore();

  // Sorting state - default sort by update date descending
  const [sortField, setSortField] = useState<'title' | 'project' | 'status' | 'priority' | 'updatedAt'>('updatedAt');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');

  const handleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.checked) {
      setSelectedIds(new Set(prompts.map(p => p.id)));
    } else {
      setSelectedIds(new Set());
    }
  };

  const handleSelectOne = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const newSet = new Set(selectedIds);
    if (newSet.has(id)) {
      newSet.delete(id);
    } else {
      newSet.add(id);
    }
    setSelectedIds(newSet);
  };

  // Helper to format date as YYYY-MM-DD
  const formatDateOnly = (d: string) => {
    if (!d) return '-';
    try {
      return new Date(d).toISOString().split('T')[0];
    } catch {
      return '-';
    }
  };

  // Handle column header click for sorting
  const handleSort = (field: typeof sortField) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  // Sort prompts
  const sortedPrompts = [...prompts].sort((a, b) => {
    let cmp = 0;
    switch (sortField) {
      case 'title':
        cmp = a.title.localeCompare(b.title);
        break;
      case 'project':
        cmp = (projectMap[a.projectId] || '').localeCompare(projectMap[b.projectId] || '');
        break;
      case 'status':
        cmp = a.status.localeCompare(b.status);
        break;
      case 'priority':
        const priorityOrder = { high: 0, medium: 1, low: 2 };
        cmp = (priorityOrder[a.priority as keyof typeof priorityOrder] || 1) - (priorityOrder[b.priority as keyof typeof priorityOrder] || 1);
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
    // Full width layout
    <div className="h-full w-full overflow-y-auto overflow-x-auto pb-20 pt-2 custom-scrollbar px-4">
      <div className="w-full grid grid-cols-[0.3fr_3fr_1.5fr_0.7fr_0.7fr_1.5fr_1fr] gap-2 text-base font-medium text-gray-400 border-b border-gray-100 bg-white sticky top-0 z-10 items-center">
        <div className="py-2 px-1 flex justify-center">
          <input
            type="checkbox"
            className="rounded border-gray-300 text-gray-600 focus:ring-0 cursor-pointer"
            checked={prompts.length > 0 && selectedIds.size === prompts.length}
            onChange={handleSelectAll}
          />
        </div>
        <div className="py-2 px-2 flex items-center cursor-pointer hover:text-gray-600 select-none" onClick={() => handleSort('title')}>
          名稱<SortIndicator field="title" />
        </div>
        <div className="py-2 px-2 flex items-center cursor-pointer hover:text-gray-600 select-none" onClick={() => handleSort('project')}>
          所屬專案<SortIndicator field="project" />
        </div>
        <div className="py-2 px-2 flex items-center cursor-pointer hover:text-gray-600 select-none" onClick={() => handleSort('status')}>
          狀態<SortIndicator field="status" />
        </div>
        <div className="py-2 px-2 flex items-center cursor-pointer hover:text-gray-600 select-none" onClick={() => handleSort('priority')}>
          優先級<SortIndicator field="priority" />
        </div>
        <div className="py-2 px-2">標籤</div>
        <div className="py-2 px-2 flex items-center justify-end cursor-pointer hover:text-gray-600 select-none" onClick={() => handleSort('updatedAt')}>
          更新<SortIndicator field="updatedAt" />
        </div>
      </div>

      {sortedPrompts.map((prompt) => {
        const isSelected = selectedIds.has(prompt.id);
        const projectName = projectMap[prompt.projectId] || '-';

        return (
          <div key={prompt.id} className={`group relative ${isSelected ? 'bg-blue-50/30' : ''}`}>
            <div
              className="w-full grid grid-cols-[0.3fr_3fr_1.5fr_0.7fr_0.7fr_1.5fr_1fr] gap-2 items-center hover:bg-gray-50 cursor-pointer select-none transition-colors border-b border-gray-100 h-12"
              onClick={() => setSelectedItem({ type: 'prompt', id: prompt.id })}
            >
              <div className="py-2 px-1 flex justify-center" onClick={(e) => e.stopPropagation()}>
                <input
                  type="checkbox"
                  className="rounded border-gray-300 text-gray-600 focus:ring-0 cursor-pointer"
                  checked={isSelected}
                  onChange={() => { }} // Controlled by onClick handler above
                  onClick={(e) => handleSelectOne(prompt.id, e)}
                />
              </div>

              <div className="flex items-center py-2 px-2 overflow-hidden relative">
                <div className="mr-2 p-1 bg-gray-50 rounded border border-gray-100 text-gray-500 flex-shrink-0">
                  <FileText size={14} />
                </div>
                <span className="font-medium text-gray-900 text-base truncate" title={prompt.title}>
                  {prompt.title}
                </span>
              </div>

              <div className="py-2 px-2 flex items-center overflow-hidden">
                <div className="flex items-center text-gray-600 text-base truncate max-w-full" title={projectName}>
                  <Folder size={14} className="mr-1.5 flex-shrink-0 text-gray-400" />
                  <span className="truncate">{projectName}</span>
                </div>
              </div>

              <div className="py-2 px-2 flex items-center">
                <StatusBadge status={prompt.status} />
              </div>

              <div className="py-2 px-2 flex items-center">
                <span className="text-gray-600 text-base capitalize">{prompt.priority || 'medium'}</span>
              </div>

              <div className="py-2 px-2 flex gap-1 overflow-hidden items-center">
                {prompt.tags.slice(0, 2).map((t: string) => <TagPill key={t} text={t} />)}
                {prompt.tags.length > 2 && <span className="text-base text-gray-300">+{prompt.tags.length - 2}</span>}
              </div>

              <div className="py-2 px-2 text-right text-base text-gray-400 font-mono">
                {formatDateOnly(prompt.updatedAt as string)}
              </div>
            </div>
          </div>
        );
      })}

      {prompts.length === 0 && (
        <div className="p-16 text-center text-gray-400 text-sm italic">
          No prompts found.
        </div>
      )}
    </div>
  );
}

function PromptBoard({ prompts, projectMap }: { prompts: PromptEntity[], projectMap: Record<string, string> }) {
  const { setSelectedItem } = useUiStore();
  const columns = [
    { id: 'draft', label: '草稿' },
    { id: 'needs_review', label: '待審閱' },
    { id: 'ready', label: '可用' },
    { id: 'deprecated', label: '已棄用' },
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

    // Optimistic update
    // In a real app with local state management (like Redux/Zustand for data), we'd update the store here.
    // For now, we trigger the API update and then refresh.
    // To make it feel responsive, we could locally mutate the prompts list, but since prompts is passed as prop, 
    // we rely on the parent's data fetching or global event.
    // Ideally: update local state -> call API -> revert if fail.

    // Call API
    updatePrompt(draggableId, { status: newStatus })
      .then(() => {
        window.dispatchEvent(new CustomEvent('entity-change'));
      })
      .catch((err) => {
        console.error('Failed to move prompt', err);
        alert('Failed to move prompt');
      });
  };

  return (
    <DragDropContext onDragEnd={onDragEnd}>
      <div className="flex gap-4 h-full w-full overflow-x-auto bg-white p-0 pt-2">
        {columns.map((col) => (
          <div key={col.id} className="flex-1 flex flex-col min-w-[280px]">
            <div className="flex items-center justify-between px-2 py-2">
              <div className={`px-2 py-1 rounded text-[15px] font-semibold flex items-center gap-2 ${col.id === 'draft' ? 'bg-green-50 text-green-600' :
                col.id === 'needs_review' ? 'bg-blue-50 text-blue-600' :
                  col.id === 'ready' ? 'bg-gray-100 text-gray-600' :
                    col.id === 'deprecated' ? 'bg-yellow-50 text-yellow-600' : 'bg-gray-100 text-gray-600'
                }`}>
                <span className={`w-1.5 h-1.5 rounded-full ${col.id === 'draft' ? 'bg-green-400' :
                  col.id === 'needs_review' ? 'bg-blue-400' :
                    col.id === 'ready' ? 'bg-gray-400' :
                      col.id === 'deprecated' ? 'bg-yellow-400' : 'bg-gray-400'
                  }`}></span>
                {col.label}
              </div>
              <span className="text-sm text-gray-400 font-mono pr-2">
                {prompts.filter((p) => p.status === col.id).length}
              </span>
            </div>

            <Droppable droppableId={col.id}>
              {(provided, snapshot) => (
                <div
                  {...provided.droppableProps}
                  ref={provided.innerRef}
                  className={`flex-1 overflow-y-auto px-2 pb-2 custom-scrollbar transition-colors rounded mx-1.5 ${col.id === 'draft' ? 'bg-green-50/50' :
                    col.id === 'needs_review' ? 'bg-blue-50/50' :
                      col.id === 'ready' ? 'bg-gray-50/50' :
                        col.id === 'deprecated' ? 'bg-yellow-50/50' : 'bg-gray-50/50'
                    } ${snapshot.isDraggingOver ? 'bg-opacity-100 brightness-95' : ''}`}
                >
                  <div className="h-2"></div>
                  {prompts
                    .filter((p) => p.status === col.id)
                    .map((prompt, index) => (
                      <Draggable key={prompt.id} draggableId={prompt.id} index={index}>
                        {(provided, snapshot) => (
                          <div
                            ref={provided.innerRef}
                            {...provided.draggableProps}
                            {...provided.dragHandleProps}
                            style={{ ...provided.draggableProps.style }}
                            onClick={() => setSelectedItem({ type: 'prompt', id: prompt.id })}
                            className={`bg-white p-3 rounded shadow-sm hover:shadow-md cursor-pointer transition-all border border-gray-200/40 hover:border-gray-300 group flex flex-col min-h-[120px] mb-2 ${snapshot.isDragging ? 'shadow-lg rotate-1 ring-2 ring-emerald-500/20' : ''}`}
                          >
                            <div className="flex items-start justify-between mb-2">
                              <span className="font-medium text-gray-800 leading-tight flex items-center gap-1.5 break-all">
                                <FileText size={14} className="text-gray-800/70 flex-shrink-0" />
                                {prompt.title}
                              </span>
                            </div>

                            <div className="flex items-center text-xs text-gray-400 mb-2 truncate" title={projectMap[prompt.projectId]}>
                              <Folder size={10} className="mr-1 flex-shrink-0" />
                              <span className="truncate">{projectMap[prompt.projectId] || '-'}</span>
                            </div>

                            <div className="flex items-end justify-between gap-2 mt-auto">
                              <div className="flex flex-wrap gap-1 flex-1 overflow-hidden">
                                {prompt.tags.slice(0, 2).map((tag: string) => (
                                  <span key={tag} className="text-[10px] px-1 py-0.5 bg-gray-50 text-gray-500 rounded border border-gray-100 truncate max-w-[70px]">{tag}</span>
                                ))}
                                {prompt.tags.length > 2 && <span className="text-[10px] text-gray-400">+{prompt.tags.length - 2}</span>}
                              </div>
                              <span className="text-sm text-gray-400 font-mono flex-shrink-0">
                                {new Date(prompt.updatedAt).toLocaleDateString('zh-TW')}
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
                      // Find a default project ID
                      const defaultProjectId = Object.keys(projectMap)[0];
                      if (!defaultProjectId) {
                        alert('Please create a project first.');
                        return;
                      }

                      createPrompt({ title: '新增提示詞', projectId: defaultProjectId, tags: [], status: col.id as any, priority: 'medium', category: '' })
                        .then((newPrompt) => {
                          setSelectedItem({ type: 'prompt', id: newPrompt.id });
                          window.dispatchEvent(new CustomEvent('entity-change'));
                        })
                        .catch((err) => console.error('Failed to create:', err));
                    }}
                    className={`mt-1 w-full py-1.5 px-2 text-sm rounded transition-colors flex items-center justify-start gap-2 flex-shrink-0 ${col.id === 'draft' ? 'text-green-600 hover:bg-green-100' :
                      col.id === 'needs_review' ? 'text-blue-600 hover:bg-blue-100' :
                        col.id === 'ready' ? 'text-gray-500 hover:bg-gray-100' :
                          col.id === 'deprecated' ? 'text-yellow-600 hover:bg-yellow-100' : 'text-gray-500 hover:bg-gray-100'
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

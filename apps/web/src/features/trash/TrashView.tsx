import { useState, useEffect, useCallback } from 'react';
import { Trash2, RotateCcw, X, AlertTriangle, File, Folder } from 'lucide-react';
import { fetchTrashList, purgeTrashItem, restoreTrashItem } from './api';
import type { TrashItem, RestoreConflict } from '@pah/contracts';

export function TrashView() {
  const [items, setItems] = useState<TrashItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  // Conflict handling state
  const [conflict, setConflict] = useState<{ id: string, data: RestoreConflict } | null>(null);

  const loadTrash = useCallback(async () => {
    setLoading(true);
    try {
      const data = await fetchTrashList({ page: 1, perPage: 100 });
      setItems(data.items);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadTrash();
  }, [loadTrash]);

  const handlePurge = async (id: string) => {
    if (!confirm('Permanently delete? This cannot be undone.')) return;
    try {
      await purgeTrashItem(id);
      await loadTrash();
    } catch (err: any) {
      alert(err.message);
    }
  };

  const handleRestore = async (id: string, strategy: 'rename' | 'overwrite' = 'rename') => {
    try {
      const res = await restoreTrashItem(id, { strategy });
      if (res.conflict) {
        setConflict({ id, data: res.conflict });
      } else {
        setConflict(null);
        await loadTrash();
        // Notify others
        window.dispatchEvent(new CustomEvent('entity-change'));
      }
    } catch (err: any) {
      alert(err.message);
    }
  };

  const EmptyState = () => (
    <div className="flex flex-col items-center justify-center p-12 text-gray-400">
      <Trash2 size={48} className="mb-4 opacity-20" />
      <p>回收站是空的</p>
    </div>
  );

  return (
    <div className="h-full flex flex-col relative">
      <div className="flex-none px-4 py-3 flex justify-between items-center bg-white border-b border-gray-100">
        <h2 className="text-sm font-semibold text-gray-700">Trash ({items.length})</h2>
        <button
          onClick={() => loadTrash()}
          className="text-xs text-blue-500 hover:underline"
        >
          Refresh
        </button>
      </div>

      {loading && items.length === 0 && (
        <div className="p-8 text-center text-gray-400">Loading...</div>
      )}

      {!loading && items.length === 0 && <EmptyState />}

      <div className="flex-1 overflow-y-auto custom-scrollbar p-0">
        <div className="divide-y divide-gray-100">
          {items.map((item) => (
            <div key={item.trashId} className="group flex items-center p-4 hover:bg-gray-50 transition-colors">
              <div className="mr-4 text-gray-400">
                {item.entityType === 'project' ? <Folder size={20} /> : <File size={20} />}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <span className="font-medium text-gray-900 truncate">{item.titleSnapshot}</span>
                  <span className="text-xs px-1.5 py-0.5 rounded bg-gray-100 text-gray-500 capitalize">
                    {item.entityType}
                  </span>
                </div>
                <div className="text-xs text-gray-400 truncate font-mono">
                  {item.originalRelativePath}
                </div>
                <div className="text-xs text-gray-400 mt-1">
                  Deleted: {new Date(item.deletedAt).toLocaleString()}
                </div>
              </div>

              <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                <button
                  onClick={() => handleRestore(item.trashId)}
                  className="p-1.5 hover:bg-green-50 text-gray-400 hover:text-green-600 rounded transition-colors"
                  title="Restore"
                >
                  <RotateCcw size={16} />
                </button>
                <button
                  onClick={() => handlePurge(item.trashId)}
                  className="p-1.5 hover:bg-red-50 text-gray-400 hover:text-red-600 rounded transition-colors"
                  title="Delete Permanently"
                >
                  <X size={16} />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Conflict Dialog Overlay */}
      {conflict && (
        <div className="absolute inset-0 bg-black/20 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg shadow-xl p-6 max-w-md w-full animate-fade-in-up">
            <div className="flex items-center gap-3 text-amber-600 mb-4">
              <AlertTriangle size={24} />
              <h3 className="font-bold text-lg">Restore Conflict</h3>
            </div>

            <p className="text-gray-600 text-sm mb-4">
              {conflict.data.message}
            </p>

            <div className="bg-gray-50 rounded p-3 mb-6 text-xs font-mono text-gray-500 max-h-32 overflow-y-auto">
              {conflict.data.conflicts.map((c, i) => (
                <div key={i} className="mb-1 last:mb-0">
                  [{c.kind}] {c.path}
                </div>
              ))}
            </div>

            <div className="flex justify-end gap-3">
              <button
                onClick={() => setConflict(null)}
                className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded text-sm"
              >
                Cancel
              </button>
              <button
                onClick={() => handleRestore(conflict.id, 'rename')}
                className="px-4 py-2 bg-blue-600 text-white hover:bg-blue-700 rounded text-sm font-medium"
              >
                Rename (Keep Both)
              </button>
              <button
                onClick={() => handleRestore(conflict.id, 'overwrite')}
                className="px-4 py-2 bg-red-100 text-red-700 hover:bg-red-200 rounded text-sm font-medium"
              >
                Overwrite
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

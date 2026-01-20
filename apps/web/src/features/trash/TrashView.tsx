import { useState, useEffect, useCallback } from 'react';
import { Trash2, RotateCcw, X, AlertTriangle, File, Folder } from 'lucide-react';
import { fetchTrashList, purgeTrashItem, restoreTrashItem } from './api';
import type { TrashItem, RestoreConflict } from '@pah/contracts';
import { formatDate } from '../../utils/date';

export function TrashView() {
  const [items, setItems] = useState<TrashItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

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
      <div className="flex-none px-6 py-2 flex justify-between items-center bg-white border-b border-gray-100">
        <h2 className="text-sm font-semibold text-gray-700">Trash ({items.length})</h2>
        <button
          onClick={() => loadTrash()}
          className="text-xs text-blue-500 hover:underline"
        >
          Refresh
        </button>
      </div>

      {error && (
        <div className="bg-red-50 text-red-600 px-4 py-2 text-sm border-b border-red-100 flex items-center justify-between">
          <span>{error}</span>
          <button onClick={() => setError(null)}><X size={14} /></button>
        </div>
      )}

      {loading && items.length === 0 && (
        <div className="p-8 text-center text-gray-400">Loading...</div>
      )}

      {!loading && items.length === 0 && <EmptyState />}

      <div className="flex-1 overflow-y-auto custom-scrollbar px-6 pt-2">
        <div className="grid grid-cols-[32px_minmax(360px,4fr)_1px_minmax(220px,3fr)_160px_minmax(120px,1fr)] gap-3 text-xs font-medium text-gray-400 border-b border-gray-100 bg-white sticky top-0 z-10 items-center">
          <div className="py-2 px-3"></div>
          <div className="py-2 px-3">名稱</div>
          <div className="h-4 border-r border-gray-100"></div>
          <div className="py-2 px-3">原始位置</div>
          <div className="py-2 px-3">刪除時間</div>
          <div className="py-2 px-3 text-right">動作</div>
        </div>

        {items.map((item) => (
          <div key={item.trashId} className="group relative">
              <div className="grid grid-cols-[32px_minmax(360px,4fr)_1px_minmax(220px,3fr)_160px_minmax(120px,1fr)] gap-3 items-center hover:bg-gray-50 transition-colors border-b border-gray-100 h-12">
              <div className="py-2 px-3 flex justify-center items-center text-gray-400">
                {item.entityType === 'project' ? <Folder size={14} /> : <File size={14} />}
              </div>
              <div className="py-2 px-3 font-medium text-sm text-gray-900 truncate">
                <div className="flex items-center gap-2">
                  <span className="truncate" title={item.titleSnapshot}>{item.titleSnapshot}</span>
                  <span className="text-[10px] px-1.5 py-0.5 rounded bg-gray-100 text-gray-500 capitalize flex-shrink-0">
                    {item.entityType}
                  </span>
                </div>
              </div>
              <div className="h-4 border-r border-gray-100"></div>
              <div className="py-2 px-3 text-sm text-gray-500 truncate font-mono" title={item.originalRelativePath}>
                {item.originalRelativePath}
              </div>
              <div className="py-2 px-3 text-sm text-gray-500 font-mono">
                {formatDate(item.deletedAt)}
              </div>
              <div className="py-2 px-3 flex justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                <button
                  onClick={() => handleRestore(item.trashId)}
                  className="p-1.5 hover:bg-green-50 text-gray-400 hover:text-green-600 rounded transition-colors"
                  title="Restore"
                >
                  <RotateCcw size={14} />
                </button>
                <button
                  onClick={() => handlePurge(item.trashId)}
                  className="p-1.5 hover:bg-red-50 text-gray-400 hover:text-red-600 rounded transition-colors"
                  title="Delete Permanently"
                >
                  <X size={14} />
                </button>
              </div>
            </div>
          </div>
        ))}
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

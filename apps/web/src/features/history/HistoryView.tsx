import { useState, useEffect } from 'react';
import { useUiStore } from '../../state/uiStore';
import { VersionNode } from '@pah/contracts';
import { Clock, RotateCcw, Plus } from 'lucide-react';
import { formatDate } from '../../utils/date';

export function HistoryView() {
  const { selectedItem } = useUiStore();

  // Resolve context from selectedItem if possible, otherwise rely on props if passed (but this is a standalone view usually)
  // Actually, HistoryView is likely rendered in SidePanel or MainContent when 'history' is active.
  // Let's assume it uses selectedItem to know what to show history FOR.

  const entityType = selectedItem?.type as 'project' | 'prompt' | undefined;
  const entityId = selectedItem?.id;
  // const projectSlug = (selectedItem as any)?.slug || (selectedItem as any)?.project; 
  // const promptSlug = (selectedItem as any)?.slug; 

  const [versions, setVersions] = useState<VersionNode[]>([]);
  const [loading, setLoading] = useState(false);
  const [creating, setCreating] = useState(false);
  const [versionName, setVersionName] = useState('');
  const [restoringId, setRestoringId] = useState<string | null>(null);

  const fetchHistory = async () => {
    if (!entityType || !entityId) return;
    try {
      setLoading(true);
      const res = await fetch(`/api/versions/${entityType}/${entityId}`);
      if (!res.ok) throw new Error('Failed to fetch history');
      const data = await res.json();
      setVersions(data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHistory();
  }, [entityId]);

  const handleCreateVersion = async () => {
    if (!versionName.trim() || !entityType || !entityId) return;

    try {
      setCreating(true);
      const res = await fetch('/api/versions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          entityType,
          entityId,
          projectSlug: entityType === 'project' ? (selectedItem as any).slug : (selectedItem as any).project,
          promptSlug: entityType === 'prompt' ? (selectedItem as any).slug : undefined,
          name: versionName,
          description: 'Manual version',
        }),
      });

      if (!res.ok) throw new Error('Failed to create version');

      setVersionName('');
      fetchHistory();
    } catch (error) {
      alert('Failed to create version');
    } finally {
      setCreating(false);
    }
  };

  const handleRestore = async (versionId: string) => {
    try {
      setRestoringId(versionId);
      const res = await fetch(`/api/versions/${versionId}/restore`, {
        method: 'POST',
      });

      if (!res.ok) throw new Error('Failed to restore');

      alert('Restored successfully! Please refresh the content.');
      window.location.reload(); // Simple reload to reflect changes
    } catch (error) {
      alert('Failed to restore version');
    } finally {
      setRestoringId(null);
    }
  };

  if (!selectedItem) {
    return (
      <div className="p-8 text-center text-gray-400 text-xs">
        請先選擇一個項目以檢視歷史記錄
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full bg-white">
      <div className="p-4 border-b border-gray-100">
        <h3 className="text-sm font-medium mb-3 flex items-center gap-2">
          <Clock size={16} /> 歷史記錄
        </h3>

        <div className="flex gap-2">
          <input
            type="text"
            value={versionName}
            onChange={e => setVersionName(e.target.value)}
            placeholder="新版本名稱..."
            className="flex-1 text-xs px-2 py-1.5 border border-gray-200 rounded"
          />
          <button
            onClick={handleCreateVersion}
            disabled={creating || !versionName.trim()}
            className="px-3 py-1.5 bg-blue-500 text-white rounded text-xs flex items-center gap-1 disabled:opacity-50"
          >
            {creating ? '...' : <><Plus size={14} /> 建立</>}
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {loading ? (
          <div className="text-center text-xs text-gray-400">載入中...</div>
        ) : versions.length === 0 ? (
          <div className="text-center text-xs text-gray-400">尚無歷史版本</div>
        ) : (
          versions.map((ver) => (
            <div key={ver.id} className="relative pl-4 border-l-2 border-gray-100 hover:border-blue-200 transition-colors group">
              <div className="absolute -left-[5px] top-2 w-2.5 h-2.5 rounded-full bg-gray-200 ring-2 ring-white group-hover:bg-blue-200 transition-colors"></div>

              <div className="rounded p-2 text-xs hover:bg-gray-50 transition-colors">
                <div className="flex justify-between items-start mb-1">
                  <span className="font-medium text-gray-700">{ver.name || '未命名版本'}</span>
                  <span className="text-gray-400 text-[10px] mono">
                    {formatDate(ver.timestamp)}
                  </span>
                </div>

                <div className="text-gray-500 mb-2 truncate leading-relaxed">
                  {ver.description}
                </div>

                <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button
                    onClick={() => handleRestore(ver.id)}
                    disabled={restoringId === ver.id}
                    className="flex-1 py-1 bg-white border border-gray-200 rounded text-gray-600 hover:border-blue-300 hover:text-blue-600 transition-colors flex items-center justify-center gap-1 shadow-sm"
                  >
                    {restoringId === ver.id ? (
                      '還原中...'
                    ) : (
                      <>
                        <RotateCcw size={12} /> 還原此版本
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

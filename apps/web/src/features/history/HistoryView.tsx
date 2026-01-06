import { useState, useEffect } from 'react';
import { MOCK_SNAPSHOTS, MOCK_VERSIONS } from '../../data/mockData';

const USE_MOCK_DATA = true; // Set to false to use real API

interface VersionEvent {
  id: string;
  type: string;
  scope: 'workspace' | 'project' | 'prompt';
  message?: string;
  createdAt: string;
  snapshotPath: string;
}

interface HistoryViewProps {
  entityType?: 'project' | 'prompt';
  entityId?: string;
}

export function HistoryView({ entityType, entityId }: HistoryViewProps) {
  const [versions, setVersions] = useState<VersionEvent[]>([]);
  const [snapshots, setSnapshots] = useState<VersionEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedVersion, setSelectedVersion] = useState<VersionEvent | null>(null);
  const [viewMode, setViewMode] = useState<'all' | 'versions' | 'snapshots'>('all');

  useEffect(() => {
    fetchHistory();
  }, [entityType, entityId]);

  const fetchHistory = async () => {
    try {
      setLoading(true);
      setError(null);

      if (USE_MOCK_DATA) {
        // Use mock data for visual comparison
        await new Promise(resolve => setTimeout(resolve, 300));
        setVersions(MOCK_VERSIONS);
        if (!entityType && !entityId) {
          setSnapshots(MOCK_SNAPSHOTS);
        }
      } else {
        // Use real API
        // Fetch versions (entity-specific or all)
        let versionsUrl = 'http://localhost:3001/api/versions';
        if (entityType && entityId) {
          versionsUrl = `http://localhost:3001/api/versions/${entityType}/${entityId}`;
        }
        
        const versionsResponse = await fetch(versionsUrl);
        if (!versionsResponse.ok) {
          throw new Error('Failed to fetch versions');
        }
        const versionsData = await versionsResponse.json();
        setVersions(versionsData);

        // Fetch snapshots (only if viewing all history)
        if (!entityType && !entityId) {
          const snapshotsResponse = await fetch('http://localhost:3001/api/snapshots');
          if (!snapshotsResponse.ok) {
            throw new Error('Failed to fetch snapshots');
          }
          const snapshotsData = await snapshotsResponse.json();
          setSnapshots(snapshotsData);
        }
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load history');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateSnapshot = async () => {
    try {
      const response = await fetch('http://localhost:3001/api/snapshots', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          scope: 'workspace',
          message: '手動建立快照',
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to create snapshot');
      }

      await fetchHistory();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create snapshot');
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString('zh-TW', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getTypeLabel = (type: string) => {
    switch (type) {
      case 'snapshot': return '快照';
      case 'version-node': return '版本節點';
      default: return type;
    }
  };

  const getScopeLabel = (scope: string) => {
    switch (scope) {
      case 'workspace': return '工作區';
      case 'project': return '專案';
      case 'prompt': return '提示詞';
      default: return scope;
    }
  };

  const allEvents = [...versions, ...snapshots].sort((a, b) => 
    a.createdAt < b.createdAt ? 1 : -1
  );

  const filteredEvents = viewMode === 'all' 
    ? allEvents 
    : viewMode === 'versions' 
    ? versions 
    : snapshots;

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-secondary">載入中...</div>
      </div>
    );
  }

  return (
    <div className="p-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-xl font-semibold">
              {entityType && entityId ? '版本歷史' : '備份與版本管理'}
            </h2>
            <p className="text-sm text-secondary mt-1">
              {entityType && entityId 
                ? `檢視 ${getScopeLabel(entityType)} 的所有版本節點`
                : '檢視所有快照與版本節點'}
            </p>
          </div>
          
          {!entityType && !entityId && (
            <button
              onClick={handleCreateSnapshot}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 text-sm font-medium"
            >
              建立立即快照
            </button>
          )}
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md text-sm text-red-700">
            {error}
          </div>
        )}

        {/* View Mode Filters */}
        {!entityType && !entityId && (
          <div className="flex gap-2 mb-4">
            <button
              onClick={() => setViewMode('all')}
              className={`px-3 py-1.5 rounded-md text-sm font-medium ${
                viewMode === 'all'
                  ? 'bg-blue-100 text-blue-700'
                  : 'bg-subtle text-secondary hover:bg-hover'
              }`}
            >
              全部 ({allEvents.length})
            </button>
            <button
              onClick={() => setViewMode('versions')}
              className={`px-3 py-1.5 rounded-md text-sm font-medium ${
                viewMode === 'versions'
                  ? 'bg-blue-100 text-blue-700'
                  : 'bg-subtle text-secondary hover:bg-hover'
              }`}
            >
              版本節點 ({versions.length})
            </button>
            <button
              onClick={() => setViewMode('snapshots')}
              className={`px-3 py-1.5 rounded-md text-sm font-medium ${
                viewMode === 'snapshots'
                  ? 'bg-blue-100 text-blue-700'
                  : 'bg-subtle text-secondary hover:bg-hover'
              }`}
            >
              快照 ({snapshots.length})
            </button>
          </div>
        )}

        {/* History List */}
        {filteredEvents.length === 0 ? (
          <div className="text-center py-12 text-secondary">
            <div className="text-4xl mb-2">📦</div>
            <div>尚無歷史記錄</div>
          </div>
        ) : (
          <div className="space-y-2">
            {filteredEvents.map((event) => (
              <button
                key={event.id}
                onClick={() => setSelectedVersion(event)}
                className={`w-full p-4 rounded-md border text-left transition-colors ${
                  selectedVersion?.id === event.id
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-subtle bg-white hover:bg-subtle'
                }`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-xs font-medium px-2 py-0.5 rounded bg-blue-100 text-blue-700">
                        {getTypeLabel(event.type)}
                      </span>
                      <span className="text-xs text-secondary">
                        {getScopeLabel(event.scope)}
                      </span>
                    </div>
                    {event.message && (
                      <div className="text-sm font-medium mb-1">{event.message}</div>
                    )}
                    <div className="text-xs text-secondary">
                      {formatDate(event.createdAt)}
                    </div>
                  </div>
                  {selectedVersion?.id === event.id && (
                    <div className="text-blue-600 text-sm">▶</div>
                  )}
                </div>
              </button>
            ))}
          </div>
        )}

        {/* Version Details Panel */}
        {selectedVersion && (
          <div className="mt-6 p-4 border border-subtle rounded-md bg-subtle">
            <h3 className="text-sm font-semibold mb-3">版本詳情</h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-secondary">ID:</span>
                <span className="font-mono text-xs">{selectedVersion.id}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-secondary">類型:</span>
                <span>{getTypeLabel(selectedVersion.type)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-secondary">範圍:</span>
                <span>{getScopeLabel(selectedVersion.scope)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-secondary">建立時間:</span>
                <span>{formatDate(selectedVersion.createdAt)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-secondary">儲存路徑:</span>
                <span className="font-mono text-xs truncate max-w-xs" title={selectedVersion.snapshotPath}>
                  {selectedVersion.snapshotPath}
                </span>
              </div>
            </div>
            
            <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded text-xs text-blue-800">
              <strong>提示：</strong>此版本為唯讀檢視。若需還原，請手動複製檔案內容或聯繫管理員。
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

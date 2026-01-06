import { useState, useEffect } from 'react';
import type { TrashItem, TrashEntityType, RestoreConflict } from '@pah/contracts';
import { fetchTrashList, purgeTrashItem, restoreTrashItem } from './api';
import { RestoreConflictDialog } from './RestoreConflictDialog';
import { MOCK_TRASH_ITEMS } from '../../data/mockData';

const USE_MOCK_DATA = true; // Set to false to use real API

export function TrashView() {
  const [items, setItems] = useState<TrashItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [entityTypeFilter, setEntityTypeFilter] = useState<TrashEntityType | undefined>();
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [hasMore, setHasMore] = useState(false);
  
  const [conflict, setConflict] = useState<{
    trashId: string;
    conflict: RestoreConflict;
  } | null>(null);

  const perPage = 20;

  const loadTrash = async () => {
    setLoading(true);
    try {
      if (USE_MOCK_DATA) {
        // Use mock data for visual comparison
        await new Promise(resolve => setTimeout(resolve, 300));
        let filtered = MOCK_TRASH_ITEMS;
        
        if (searchQuery) {
          const query = searchQuery.toLowerCase();
          filtered = filtered.filter(item => 
            item.titleSnapshot?.toLowerCase().includes(query) ||
            item.originalRelativePath.toLowerCase().includes(query)
          );
        }
        
        if (entityTypeFilter) {
          filtered = filtered.filter(item => item.entityType === entityTypeFilter);
        }
        
        setItems(filtered);
        setTotal(filtered.length);
        setHasMore(false);
      } else {
        // Use real API
        const response = await fetchTrashList({
          q: searchQuery || undefined,
          entityType: entityTypeFilter,
          page,
          perPage,
        });

        setItems(response.items);
        setTotal(response.total);
        setHasMore(response.hasMore);
      }
    } catch (error) {
      console.error('Failed to load trash:', error);
      alert('載入回收站失敗');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTrash();
  }, [searchQuery, entityTypeFilter, page]);

  const handleRestore = async (trashId: string) => {
    try {
      const result = await restoreTrashItem(trashId, { strategy: 'rename' });

      if (result.conflict) {
        // Show conflict dialog
        setConflict({ trashId, conflict: result.conflict });
      } else if (result.result) {
        // Success
        alert(`已復原: ${result.result.restoredRelativePath}`);
        loadTrash();
      }
    } catch (error) {
      console.error('Failed to restore:', error);
      alert('復原失敗');
    }
  };

  const handleResolveConflict = async (strategy: 'overwrite' | 'rename', newSlug?: string) => {
    if (!conflict) return;

    try {
      const result = await restoreTrashItem(conflict.trashId, {
        strategy,
        newSlug,
      });

      if (result.result) {
        alert(`已復原: ${result.result.restoredRelativePath}`);
        setConflict(null);
        loadTrash();
      } else if (result.conflict) {
        // Still conflict (shouldn't happen with overwrite/rename)
        alert('復原失敗：仍有衝突');
      }
    } catch (error) {
      console.error('Failed to resolve conflict:', error);
      alert('復原失敗');
    }
  };

  const handlePurge = async (trashId: string, titleSnapshot: string) => {
    if (!confirm(`確定要永久刪除「${titleSnapshot}」嗎？此操作無法復原。`)) {
      return;
    }

    try {
      await purgeTrashItem(trashId);
      alert('已永久刪除');
      loadTrash();
    } catch (error) {
      console.error('Failed to purge:', error);
      alert('永久刪除失敗');
    }
  };

  const formatDate = (isoString: string) => {
    return new Date(isoString).toLocaleString('zh-TW');
  };

  const entityTypeLabels: Record<TrashEntityType, string> = {
    project: '專案',
    prompt: '提示詞',
    inboxItem: '暫存項',
    snippet: '片段',
    unknown: '未知',
  };

  return (
    <div className="flex-1 flex flex-col h-full overflow-hidden">
      {/* Header */}
      <div className="p-4 border-b border-subtle bg-white">
        <h2 className="text-lg font-semibold mb-4">回收站</h2>
        
        <div className="flex gap-4 items-center">
          {/* Search */}
          <input
            type="text"
            placeholder="搜尋..."
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setPage(1);
            }}
            className="flex-1 max-w-md px-3 py-2 border border-subtle rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />

          {/* Entity Type Filter */}
          <select
            value={entityTypeFilter || ''}
            onChange={(e) => {
              setEntityTypeFilter(e.target.value ? (e.target.value as TrashEntityType) : undefined);
              setPage(1);
            }}
            className="px-3 py-2 border border-subtle rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">全部類型</option>
            <option value="project">專案</option>
            <option value="prompt">提示詞</option>
            <option value="inboxItem">暫存項</option>
            <option value="snippet">片段</option>
          </select>

          <button
            type="button"
            onClick={loadTrash}
            className="px-4 py-2 text-sm border border-subtle rounded-md hover:bg-hover"
          >
            重新整理
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-auto p-4">
        {loading ? (
          <div className="text-center text-secondary py-8">載入中...</div>
        ) : items.length === 0 ? (
          <div className="text-center text-secondary py-8">
            {searchQuery || entityTypeFilter ? '沒有符合的項目' : '回收站是空的'}
          </div>
        ) : (
          <div className="space-y-2">
            {items.map((item) => (
              <div
                key={item.trashId}
                className="p-4 border border-subtle rounded-md bg-white hover:shadow-sm transition-shadow"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-xs px-2 py-0.5 bg-subtle rounded">
                        {entityTypeLabels[item.entityType]}
                      </span>
                      {item.attachmentsMoved && (
                        <span className="text-xs px-2 py-0.5 bg-blue-100 text-blue-700 rounded">
                          含附件
                        </span>
                      )}
                    </div>
                    <div className="font-medium truncate">{item.titleSnapshot || '未命名'}</div>
                    <div className="text-xs text-secondary mt-1">
                      <div>路徑: {item.originalRelativePath}</div>
                      <div>刪除時間: {formatDate(item.deletedAt)}</div>
                      <div>將於 {formatDate(item.purgeAfter)} 自動清理</div>
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => handleRestore(item.trashId)}
                      className="px-3 py-1.5 text-sm bg-blue-600 text-white rounded-md hover:bg-blue-700"
                    >
                      復原
                    </button>
                    <button
                      type="button"
                      onClick={() => handlePurge(item.trashId, item.titleSnapshot || '未命名')}
                      className="px-3 py-1.5 text-sm border border-red-300 text-red-700 rounded-md hover:bg-red-50"
                    >
                      永久刪除
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Pagination */}
        {total > perPage && (
          <div className="flex items-center justify-between mt-4 pt-4 border-t border-subtle">
            <div className="text-sm text-secondary">
              顯示 {(page - 1) * perPage + 1} - {Math.min(page * perPage, total)} / 共 {total} 項
            </div>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
                className="px-3 py-1.5 text-sm border border-subtle rounded-md hover:bg-hover disabled:opacity-50 disabled:cursor-not-allowed"
              >
                上一頁
              </button>
              <button
                type="button"
                onClick={() => setPage((p) => p + 1)}
                disabled={!hasMore}
                className="px-3 py-1.5 text-sm border border-subtle rounded-md hover:bg-hover disabled:opacity-50 disabled:cursor-not-allowed"
              >
                下一頁
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Conflict Dialog */}
      {conflict && (
        <RestoreConflictDialog
          conflict={conflict.conflict}
          onResolve={handleResolveConflict}
          onCancel={() => setConflict(null)}
        />
      )}
    </div>
  );
}

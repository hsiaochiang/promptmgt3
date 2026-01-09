import { useEffect, useState } from 'react';
import type { InboxItemEntity } from '@pah/contracts';
import { fetchInboxItems, updateInboxItem, deleteInboxItem } from './api';
import { Trash2, AlertTriangle, Save, RefreshCw } from 'lucide-react';

export function InboxView() {
  const [items, setItems] = useState<InboxItemEntity[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [form, setForm] = useState<Pick<InboxItemEntity, 'title' | 'notes' | 'rawContent'>>({
    title: '',
    notes: '',
    rawContent: '',
  });

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  // Load items
  const load = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await fetchInboxItems();
      setItems(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : '載入暫存區失敗');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const handleSelect = (item: InboxItemEntity) => {
    setSelectedId(item.id);
    setForm({
      title: item.title,
      notes: item.notes || '',
      rawContent: item.rawContent,
    });
    setError(null);
    setSuccess(false);
  };

  const handleSave = async () => {
    if (!selectedId) return;
    try {
      setSaving(true);
      setError(null);
      setSuccess(false);

      const updated = await updateInboxItem(selectedId, {
        title: form.title,
        notes: form.notes,
        rawContent: form.rawContent,
      });

      setItems(prev => prev.map(i => (i.id === updated.id ? updated : i)));
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch (err) {
      setError(err instanceof Error ? err.message : '保存失敗');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!selectedId) return;
    if (!confirm('警告：此操作將永久刪除此檔案，無法復原！\n\n確定要刪除嗎？')) return;

    try {
      setDeleting(true);
      setError(null);
      await deleteInboxItem(selectedId);

      // Remove from list
      setItems(prev => prev.filter(i => i.id !== selectedId));
      setSelectedId(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : '刪除失敗');
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="h-full flex flex-col">
      {/* Alert Banner */}
      <div className="mb-4 p-3 bg-amber-50 border border-amber-200 rounded text-xs text-amber-900 flex items-start gap-2">
        <AlertTriangle size={14} className="mt-0.5 flex-shrink-0" />
        <div>
          <span className="font-bold">暫存區說明：</span>
          此處顯示由外部工具（如瀏覽器擴充）擷取的原始內容。在此您可以整理標題與內容，但<strong className="text-amber-700">正式歸檔（轉為 Project/Prompt）請使用外部工具</strong>操作。
        </div>
      </div>

      <div className="flex gap-4 flex-1 min-h-0">
        {/* List Column */}
        <div className="w-1/3 flex flex-col border border-gray-200 rounded bg-gray-50/50">
          <div className="p-2 border-b border-gray-200 flex justify-between items-center bg-gray-100/50">
            <span className="text-xs font-bold text-gray-600">匯入清單 ({items.length})</span>
            <button onClick={load} className="text-gray-500 hover:text-gray-800" title="重新整理">
              <RefreshCw size={14} />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto p-1 space-y-1">
            {loading && <div className="text-center py-4 text-xs text-gray-500">載入中...</div>}
            {!loading && items.length === 0 && (
              <div className="text-center py-8 text-xs text-gray-400">暫存區是空的</div>
            )}

            {items.map(item => (
              <button
                key={item.id}
                onClick={() => handleSelect(item)}
                className={`w-full text-left p-3 rounded border text-xs transition-all ${selectedId === item.id
                  ? 'bg-white border-amber-400 shadow-sm ring-1 ring-amber-400/30'
                  : 'bg-white border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                  }`}
              >
                <div className="font-medium text-gray-900 mb-1 truncate">{item.title}</div>
                <div className="flex justify-between items-center text-[10px] text-gray-500">
                  <span>{new Date(item.importedAt).toLocaleDateString()}</span>
                  <span className={`px-1.5 py-0.5 rounded-full ${item.cleanedState === 'cleaned' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'
                    }`}>
                    {item.cleanedState || 'new'}
                  </span>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Editor Column */}
        <div className="flex-1 flex flex-col border border-gray-200 rounded bg-white overflow-hidden shadow-sm">
          {!selectedId ? (
            <div className="flex-1 flex flex-col items-center justify-center text-gray-300">
              <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mb-2">
                <RefreshCw size={24} />
              </div>
              <p className="text-xs">請選擇項目以預覽或編輯</p>
            </div>
          ) : (
            <>
              {/* Toolbar */}
              <div className="h-10 border-b border-gray-200 flex items-center justify-between px-3 bg-gray-50/50">
                <span className="text-xs font-mono text-gray-400 truncate max-w-[200px]">{selectedId}</span>
                <div className="flex gap-2">
                  <button
                    onClick={handleDelete}
                    disabled={deleting}
                    className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-red-600 hover:bg-red-50 rounded transition-colors"
                  >
                    <Trash2 size={14} />
                    永久刪除
                  </button>
                  <button
                    onClick={handleSave}
                    disabled={saving}
                    className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium bg-gray-900 text-white hover:bg-gray-800 rounded shadow-sm transition-all"
                  >
                    <Save size={14} />
                    {saving ? '保存中...' : '保存變更'}
                  </button>
                </div>
              </div>

              {/* Edit Form */}
              <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {error && (
                  <div className="p-3 bg-red-50 text-red-700 text-xs rounded border border-red-100">
                    {error}
                  </div>
                )}
                {success && (
                  <div className="p-3 bg-green-50 text-green-700 text-xs rounded border border-green-100">
                    變更已保存
                  </div>
                )}

                <div className="space-y-1">
                  <label className="text-xs font-bold text-gray-700">標題</label>
                  <input
                    type="text"
                    value={form.title}
                    onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
                    className="w-full px-3 py-2 text-sm border border-gray-300 rounded focus:border-amber-500 focus:ring-1 focus:ring-amber-500 outline-none transition-all"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-gray-700">整理備註 (Notes)</label>
                  <textarea
                    rows={2}
                    value={form.notes}
                    onChange={e => setForm(f => ({ ...f, notes: e.target.value }))}
                    className="w-full px-3 py-2 text-xs border border-gray-300 rounded focus:border-amber-500 focus:ring-1 focus:ring-amber-500 outline-none transition-all"
                    placeholder="例如：需提取哪部分作為 Prompt..."
                  />
                </div>

                <div className="space-y-1 flex-1 flex flex-col min-h-[300px]">
                  <label className="text-xs font-bold text-gray-700">原始內容</label>
                  <div className="flex-1 relative">
                    <textarea
                      value={form.rawContent}
                      onChange={e => setForm(f => ({ ...f, rawContent: e.target.value }))}
                      className="absolute inset-0 w-full h-full p-4 font-mono text-xs leading-relaxed border border-gray-300 rounded focus:border-amber-500 focus:ring-1 focus:ring-amber-500 outline-none resize-none"
                    />
                  </div>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

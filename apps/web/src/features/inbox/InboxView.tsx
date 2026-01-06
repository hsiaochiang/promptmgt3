import { useEffect, useState } from 'react';
import type { InboxItemEntity } from '@pah/contracts';
import { MOCK_INBOX_ITEMS } from '../../data/mockData';

const USE_MOCK_DATA = true; // Set to false to use real API

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
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        
        if (USE_MOCK_DATA) {
          // Use mock data for visual comparison
          await new Promise(resolve => setTimeout(resolve, 300)); // Simulate loading
          setItems(MOCK_INBOX_ITEMS);
        } else {
          // Use real API
          const res = await fetch('http://localhost:3001/api/inbox');
          if (!res.ok) throw new Error('載入暫存項失敗');
          const data = await res.json();
          setItems(data);
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : '載入暫存區失敗');
      } finally {
        setLoading(false);
      }
    };
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
    const current = items.find(i => i.id === selectedId);
    if (!current) return;

    try {
      setSaving(true);
      setError(null);
      setSuccess(false);

      const updated: InboxItemEntity = {
        ...current,
        title: form.title,
        notes: form.notes,
        rawContent: form.rawContent,
      };

      const res = await fetch(`http://localhost:3001/api/inbox/${selectedId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updated),
      });

      if (!res.ok) {
        throw new Error('保存暫存項失敗');
      }

      const saved = (await res.json()) as InboxItemEntity;
      setItems(prev => prev.map(i => (i.id === saved.id ? saved : i)));
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch (err) {
      setError(err instanceof Error ? err.message : '保存暫存項失敗');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="pb-20 pt-2">
      <div className="mb-4 p-3 bg-amber-50 border border-amber-300 rounded text-xs text-amber-900">
        💡 <span className="font-medium">注意：</span>暫存區項目的歸檔功能由外部工具處理；此處僅提供標題、簡單備註與內容刪減等最小編修。
      </div>

      <div className="flex gap-4 min-h-[340px]">
        {/* List */}
        <div className="w-1/3 border border-amber-300 rounded overflow-hidden flex flex-col bg-amber-50/30">
          <div className="border-b border-amber-300 px-3 py-2 text-xs text-amber-900 flex justify-between">
            <span>匯入項目</span>
            <span>{items.length}</span>
          </div>
          <div className="flex-1 overflow-auto divide-y divide-amber-200">
            {loading && (
              <div className="p-4 text-[11px] text-amber-900/70 text-center">載入暫存區中...</div>
            )}
            {!loading && items.length === 0 && (
              <div className="p-4 text-[11px] text-amber-900/70 text-center">目前沒有暫存項。</div>
            )}
            {items.map(item => (
              <button
                key={item.id}
                type="button"
                onClick={() => handleSelect(item)}
                className={`w-full text-left px-3 py-2 text-[11px] hover:bg-amber-50/60 transition-colors ${
                  selectedId === item.id ? 'bg-amber-50 border-l-2 border-amber-400' : ''
                }`}
              >
                <div className="font-medium truncate text-gray-900">{item.title}</div>
                <div className="text-xs text-gray-500 truncate font-mono">
                  {new Date(item.importedAt).toLocaleString('zh-TW')}
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Detail */}
        <div className="flex-1 border border-gray-200 rounded p-4 flex flex-col bg-white">
            {error && (
              <div className="mb-3 p-2 bg-red-50 border border-red-200 rounded text-xs text-red-700">
                {error}
              </div>
            )}
            {success && (
              <div className="mb-3 p-2 bg-green-50 border border-green-200 rounded text-xs text-green-700">
                暫存項已保存
              </div>
            )}

            {!selectedId ? (
              <div className="flex-1 flex items-center justify-center text-gray-400 text-[11px]">
                請從左側選擇一個暫存項目進行編輯。
              </div>
            ) : (
              <>
                <div className="space-y-4 flex-1 overflow-auto">
                  <div>
                    <label className="block text-xs font-medium mb-1 text-gray-600">標題</label>
                    <input
                      type="text"
                      value={form.title}
                      onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-200 rounded text-[11px] focus:outline-none focus:ring-0"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-medium mb-1 text-gray-600">備註</label>
                    <textarea
                      rows={3}
                      value={form.notes}
                      onChange={e => setForm(f => ({ ...f, notes: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-200 rounded text-[11px] focus:outline-none focus:ring-0"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-medium mb-1 text-gray-600">原始內容（可刪減）</label>
                    <textarea
                      rows={8}
                      value={form.rawContent}
                      onChange={e => setForm(f => ({ ...f, rawContent: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-200 rounded text-[11px] focus:outline-none focus:ring-0 font-mono"
                    />
                    <p className="mt-1 text-xs text-gray-500">
                      僅建議做刪減與整理，不會執行歸檔；正式歸檔由外部工具處理。
                    </p>
                  </div>
                </div>

                <div className="mt-4 border-t border-gray-100 pt-3 flex justify-end">
                  <button
                    type="button"
                    onClick={handleSave}
                    disabled={saving}
                    className="px-4 py-2 bg-gray-900 text-white rounded text-[11px] hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {saving ? '保存中...' : '保存暫存項'}
                  </button>
                </div>
              </>
            )}
          </div>
      </div>
    </div>
  );
}

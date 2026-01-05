import { useEffect, useState } from 'react';
import type { InboxItemEntity } from '@pah/contracts';

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
        const res = await fetch('http://localhost:3001/api/inbox');
        if (!res.ok) throw new Error('載入暫存項失敗');
        const data = await res.json();
        setItems(data);
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

  if (loading) {
    return (
      <div className="p-8 flex items-center justify-center">
        <div className="text-secondary">載入暫存區中...</div>
      </div>
    );
  }

  return (
    <div className="p-8 flex h-full">
      <div className="max-w-5xl mx-auto flex-1 flex flex-col">
        <h2 className="text-xl font-semibold mb-4">暫存區</h2>
        <div className="bg-yellow-50 border border-yellow-200 rounded-md p-4 mb-4">
          <p className="text-sm text-yellow-800">
            💡 <strong>注意：</strong>暫存區項目的歸檔功能由外部工具處理。
            此處僅提供標題、簡單備註與內容刪減等最小編修。
          </p>
        </div>

        <div className="flex gap-4 flex-1 min-h-[300px]">
          {/* List */}
          <div className="w-1/3 border border-subtle rounded-md overflow-hidden flex flex-col">
            <div className="border-b border-subtle px-3 py-2 text-xs text-secondary flex justify-between">
              <span>匯入項目</span>
              <span>{items.length}</span>
            </div>
            <div className="flex-1 overflow-auto divide-y divide-subtle">
              {items.length === 0 && (
                <div className="p-4 text-sm text-secondary text-center">目前沒有暫存項。</div>
              )}
              {items.map(item => (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => handleSelect(item)}
                  className={`w-full text-left px-3 py-2 text-sm hover:bg-hover ${
                    selectedId === item.id ? 'bg-blue-50' : ''
                  }`}
                >
                  <div className="font-medium truncate">{item.title}</div>
                  <div className="text-xs text-tertiary truncate">
                    {new Date(item.importedAt).toLocaleString('zh-TW')}
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Detail */}
          <div className="flex-1 border border-subtle rounded-md p-4 flex flex-col">
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
              <div className="flex-1 flex items-center justify-center text-secondary text-sm">
                請從左側選擇一個暫存項目進行編輯。
              </div>
            ) : (
              <>
                <div className="space-y-4 flex-1 overflow-auto">
                  <div>
                    <label className="block text-sm font-medium mb-1">標題</label>
                    <input
                      type="text"
                      value={form.title}
                      onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
                      className="w-full px-3 py-2 border border-subtle rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-1">備註</label>
                    <textarea
                      rows={3}
                      value={form.notes}
                      onChange={e => setForm(f => ({ ...f, notes: e.target.value }))}
                      className="w-full px-3 py-2 border border-subtle rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-1">原始內容（可刪減）</label>
                    <textarea
                      rows={8}
                      value={form.rawContent}
                      onChange={e => setForm(f => ({ ...f, rawContent: e.target.value }))}
                      className="w-full px-3 py-2 border border-subtle rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono"
                    />
                    <p className="mt-1 text-xs text-secondary">
                      僅建議做刪減與整理，不會執行歸檔；正式歸檔由外部工具處理。
                    </p>
                  </div>
                </div>

                <div className="mt-4 border-t border-subtle pt-3 flex justify-end">
                  <button
                    type="button"
                    onClick={handleSave}
                    disabled={saving}
                    className="px-4 py-2 bg-blue-600 text-white rounded-md text-sm hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {saving ? '保存中...' : '保存暫存項'}
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

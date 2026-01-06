import { useEffect, useState } from 'react';
import { Copy, Plus, Trash2 } from 'lucide-react';
import type { SnippetEntity } from '@pah/contracts';

export function ClipboardView() {
  const [snippets, setSnippets] = useState<SnippetEntity[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [form, setForm] = useState<{ title: string; content: string; tags: string }>({
    title: '',
    content: '',
    tags: '',
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Load snippets
  useEffect(() => {
    loadSnippets();
  }, []);

  const loadSnippets = async () => {
    try {
      setLoading(true);
      const res = await fetch('http://localhost:3001/api/snippets');
      if (!res.ok) throw new Error('載入片段失敗');
      const data = await res.json();
      setSnippets(data.items || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : '載入片段失敗');
    } finally {
      setLoading(false);
    }
  };

  const handleSelect = (snippet: SnippetEntity) => {
    setSelectedId(snippet.id);
    setIsCreating(false);
    setForm({
      title: snippet.title,
      content: snippet.content,
      tags: snippet.tags.join(', '),
    });
    setError(null);
    setSuccess(null);
  };

  const handleNew = () => {
    setSelectedId(null);
    setIsCreating(true);
    setForm({ title: '', content: '', tags: '' });
    setError(null);
    setSuccess(null);
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      setError(null);
      setSuccess(null);

      const tags = form.tags
        .split(',')
        .map((t) => t.trim())
        .filter((t) => t);

      const payload = {
        title: form.title,
        content: form.content,
        tags,
      };

      if (isCreating) {
        // Create new snippet
        const res = await fetch('http://localhost:3001/api/snippets', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });

        if (!res.ok) throw new Error('建立片段失敗');

        const created = (await res.json()) as SnippetEntity;
        setSnippets((prev) => [...prev, created]);
        setSelectedId(created.id);
        setIsCreating(false);
        setSuccess('片段已建立');
      } else if (selectedId) {
        // Update existing snippet
        const res = await fetch(`http://localhost:3001/api/snippets/${selectedId}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });

        if (!res.ok) throw new Error('更新片段失敗');

        const updated = (await res.json()) as SnippetEntity;
        setSnippets((prev) => prev.map((s) => (s.id === updated.id ? updated : s)));
        setSuccess('片段已更新');
      }

      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      setError(err instanceof Error ? err.message : '保存片段失敗');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!selectedId) return;
    if (!confirm('確定要刪除此片段嗎？')) return;

    try {
      setSaving(true);
      setError(null);

      const res = await fetch(`http://localhost:3001/api/snippets/${selectedId}`, {
        method: 'DELETE',
      });

      if (!res.ok) throw new Error('刪除片段失敗');

      setSnippets((prev) => prev.filter((s) => s.id !== selectedId));
      setSelectedId(null);
      setIsCreating(false);
      setForm({ title: '', content: '', tags: '' });
      setSuccess('片段已刪除');
      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      setError(err instanceof Error ? err.message : '刪除片段失敗');
    } finally {
      setSaving(false);
    }
  };

  const handleCopy = async (content: string) => {
    try {
      await navigator.clipboard.writeText(content);
      setSuccess('已複製到剪貼簿');
      setTimeout(() => setSuccess(null), 2000);
    } catch (err) {
      setError('複製失敗');
      setTimeout(() => setError(null), 2000);
    }
  };

  return (
    <div className="pb-20 pt-2">
      <div className="mb-4 p-3 bg-blue-50 border border-blue-300 rounded text-xs text-blue-900">
        💡 <span className="font-medium">說明：</span>剪貼簿儲存可重複使用的文字片段或範本，方便快速插入常用內容。
      </div>

      <div className="flex gap-4 min-h-[400px]">
        {/* List */}
        <div className="w-1/3 border border-blue-300 rounded overflow-hidden flex flex-col bg-blue-50/30">
          <div className="border-b border-blue-300 px-3 py-2 text-xs text-blue-900 flex justify-between items-center">
            <span>片段列表</span>
            <button
              type="button"
              onClick={handleNew}
              className="p-1 hover:bg-blue-100 rounded transition-colors"
              title="新增片段"
            >
              <Plus size={14} />
            </button>
          </div>
          <div className="flex-1 overflow-auto divide-y divide-blue-200">
            {loading && (
              <div className="p-4 text-[11px] text-blue-900/70 text-center">載入片段中...</div>
            )}
            {!loading && snippets.length === 0 && (
              <div className="p-4 text-[11px] text-blue-900/70 text-center">
                目前沒有片段。點擊上方 + 按鈕新增。
              </div>
            )}
            {snippets.map((snippet) => (
              <button
                key={snippet.id}
                type="button"
                onClick={() => handleSelect(snippet)}
                className={`w-full text-left px-3 py-2 text-[11px] hover:bg-blue-50/60 transition-colors ${
                  selectedId === snippet.id ? 'bg-blue-50 border-l-2 border-blue-400' : ''
                }`}
              >
                <div className="font-medium truncate text-gray-900">{snippet.title}</div>
                {snippet.tags.length > 0 && (
                  <div className="flex gap-1 mt-1 flex-wrap">
                    {snippet.tags.map((tag) => (
                      <span
                        key={tag}
                        className="px-1.5 py-0.5 bg-blue-100 text-blue-700 rounded text-[10px]"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                )}
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
              {success}
            </div>
          )}

          {!selectedId && !isCreating ? (
            <div className="flex-1 flex items-center justify-center text-gray-400 text-[11px]">
              請從左側選擇一個片段進行編輯，或點擊 + 新增片段。
            </div>
          ) : (
            <>
              <div className="space-y-4 flex-1 overflow-auto">
                <div>
                  <label className="block text-xs font-medium mb-1 text-gray-600">標題</label>
                  <input
                    type="text"
                    value={form.title}
                    onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-200 rounded text-[11px] focus:outline-none focus:ring-0"
                    placeholder="片段標題"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium mb-1 text-gray-600">標籤</label>
                  <input
                    type="text"
                    value={form.tags}
                    onChange={(e) => setForm((f) => ({ ...f, tags: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-200 rounded text-[11px] focus:outline-none focus:ring-0"
                    placeholder="以逗號分隔，例如：sql, query, template"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium mb-1 text-gray-600">內容</label>
                  <textarea
                    rows={12}
                    value={form.content}
                    onChange={(e) => setForm((f) => ({ ...f, content: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-200 rounded text-[11px] focus:outline-none focus:ring-0 font-mono"
                    placeholder="片段內容..."
                  />
                </div>
              </div>

              <div className="mt-4 border-t border-gray-100 pt-3 flex justify-between">
                <div className="flex gap-2">
                  {!isCreating && selectedId && (
                    <>
                      <button
                        type="button"
                        onClick={() => handleCopy(form.content)}
                        className="px-3 py-2 bg-gray-100 text-gray-700 rounded text-[11px] hover:bg-gray-200 flex items-center gap-1"
                      >
                        <Copy size={12} />
                        複製內容
                      </button>
                      <button
                        type="button"
                        onClick={handleDelete}
                        disabled={saving}
                        className="px-3 py-2 bg-red-50 text-red-600 rounded text-[11px] hover:bg-red-100 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1"
                      >
                        <Trash2 size={12} />
                        刪除
                      </button>
                    </>
                  )}
                </div>
                <button
                  type="button"
                  onClick={handleSave}
                  disabled={saving || !form.title.trim()}
                  className="px-4 py-2 bg-gray-900 text-white rounded text-[11px] hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {saving ? '保存中...' : isCreating ? '建立片段' : '保存變更'}
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

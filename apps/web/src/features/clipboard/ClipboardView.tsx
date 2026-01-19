import { useEffect, useState } from 'react';
import { Copy, Plus, Trash2, FileText, Check, Search } from 'lucide-react';
import type { SnippetEntity } from '@pah/contracts';
import { Button } from '../../ui/Button';

export function ClipboardView() {
  const [snippets, setSnippets] = useState<SnippetEntity[]>([]);
  const [filteredSnippets, setFilteredSnippets] = useState<SnippetEntity[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [form, setForm] = useState<{ title: string; content: string; tags: string }>({
    title: '',
    content: '',
    tags: '',
  });
  const [loading, setLoading] = useState(true);
  const [savingStatus, setSavingStatus] = useState<'saved' | 'saving' | 'error' | 'idle'>('idle');
  const [lastSavedForm, setLastSavedForm] = useState<{ title: string; content: string; tags: string } | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Load snippets
  useEffect(() => {
    loadSnippets();
  }, []);

  // Search filter effect
  useEffect(() => {
    if (!searchQuery.trim()) {
      setFilteredSnippets(snippets);
    } else {
      const q = searchQuery.toLowerCase();
      setFilteredSnippets(snippets.filter(s =>
        s.title.toLowerCase().includes(q) ||
        s.tags.some(t => t.toLowerCase().includes(q))
      ));
    }
  }, [searchQuery, snippets]);

  const loadSnippets = async () => {
    try {
      setLoading(true);
      const res = await fetch('http://localhost:3001/api/snippets');
      if (!res.ok) throw new Error('載入片段失敗');
      const data = await res.json();
      setSnippets(data.items || []);
      setFilteredSnippets(data.items || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : '載入片段失敗');
    } finally {
      setLoading(false);
    }
  };

  const handleSelect = (snippet: SnippetEntity) => {
    setSelectedId(snippet.id);
    setIsCreating(false);
    const formData = {
      title: snippet.title,
      content: snippet.content,
      tags: snippet.tags.join(', '),
    };
    setForm(formData);
    setLastSavedForm(formData); // Initialize last saved state
    setSavingStatus('idle');
    setError(null);
    setSuccess(null);
  };

  const handleNew = () => {
    setSelectedId(null);
    setIsCreating(true);
    const formData = { title: '', content: '', tags: '' };
    setForm(formData);
    setLastSavedForm(formData);
    setSavingStatus('idle');
    setError(null);
    setSuccess(null);
  };

  // Auto-save logic
  useEffect(() => {
    // Skip initial load or if no change
    if (!lastSavedForm) return;

    // Check if form actually changed
    const isChanged =
      form.title !== lastSavedForm.title ||
      form.content !== lastSavedForm.content ||
      form.tags !== lastSavedForm.tags;

    if (!isChanged) return;

    if (!form.title.trim()) return; // Don't auto-save if title is empty

    const timer = setTimeout(() => {
      saveSnippet();
    }, 1000); // Debounce 1s

    setSavingStatus('saving');

    return () => clearTimeout(timer);
  }, [form, lastSavedForm]);

  const saveSnippet = async () => {
    try {
      setSavingStatus('saving');
      setError(null);

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
        // Update both form and lastSavedForm to match server response if needed, 
        // but typically just sync our mental model
        setLastSavedForm({ ...form });
        setSavingStatus('saved');
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
        setLastSavedForm({ ...form });
        setSavingStatus('saved');
      }

      // Reset status to idle after a while
      setTimeout(() => setSavingStatus('idle'), 2000);

    } catch (err) {
      setError(err instanceof Error ? err.message : '保存片段失敗');
      setSavingStatus('error');
    }
  };

  const handleDelete = async () => {
    if (!selectedId) return;
    if (!confirm('確定要刪除此片段嗎？')) return;

    try {
      setSavingStatus('saving');

      const res = await fetch(`http://localhost:3001/api/snippets/${selectedId}`, {
        method: 'DELETE',
      });

      if (!res.ok) throw new Error('刪除片段失敗');

      setSnippets((prev) => prev.filter((s) => s.id !== selectedId));
      setSelectedId(null);
      setIsCreating(false);
      setForm({ title: '', content: '', tags: '' });
      setLastSavedForm(null);
      setSuccess('片段已刪除');
      setTimeout(() => setSuccess(null), 3000);
      setSavingStatus('idle');
    } catch (err) {
      setError(err instanceof Error ? err.message : '刪除片段失敗');
      setSavingStatus('error');
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
    <div className="h-full flex flex-col bg-white">
      {/* Header - A1: Single H1, No CTA here (C1/C2 fixed) */}
      <div className="pt-8 pb-4 page-padding-x border-b border-subtle">
        <h1 className="text-page-title mb-2">剪貼簿</h1>
        <p className="text-muted">
          儲存常用的文字片段或範本，方便隨時調用。
        </p>
      </div>

      <div className="flex-1 flex overflow-hidden">
        {/* Sidebar List */}
        <div className="w-80 bg-sidebar border-r border-subtle flex flex-col">
          {/* List Header Toolbar - Integrated on single horizontal row (Notion-style) */}
          <div className="px-3 py-2 border-b border-subtle" role="toolbar" aria-label="Snippet List Toolbar">
            <div className="flex items-center justify-between gap-2 mb-1.5">
              <h2 className="text-section-title">片段列表</h2>
            </div>
            {/* Search and New Button on same horizontal line */}
            <div className="flex items-center gap-2">
              <div className="relative flex-1 group">
                <div className="absolute inset-y-0 left-2 flex items-center pointer-events-none">
                  <Search size={14} className="text-gray-400 group-hover:text-gray-500" />
                </div>
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="搜尋片段..."
                  className="w-full bg-white border border-subtle text-xs pl-7 pr-2 py-1.5 rounded-[3px] focus:outline-none focus:ring-2 focus:ring-blue-200 focus:border-blue-300 placeholder-gray-300 transition-colors"
                />
              </div>
              {/* Primary CTA - Notion blue */}
              <Button
                variant="primary"
                size="sm"
                onClick={handleNew}
                title="新增片段"
                className="flex-shrink-0"
              >
                <Plus size={14} className="mr-1" />
                新增
              </Button>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto p-2 custom-scrollbar">
            {loading ? (
              <div className="p-4 text-muted text-xs text-center">載入中...</div>
            ) : filteredSnippets.length === 0 ? (
              <div className="p-4 text-muted text-xs text-center">
                {searchQuery ? '無搜尋結果' : '尚無片段，請新增。'}
              </div>
            ) : (
              <div className="space-y-0.5" id="snippet-list">
                {filteredSnippets.map((snippet) => (
                  <button
                    key={snippet.id}
                    onClick={() => handleSelect(snippet)}
                    /* Enhanced states: hover, selected, and keyboard focus-visible */
                    className={`w-full text-left px-3 py-2 rounded-[3px] flex items-center gap-2 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-200 focus-visible:ring-offset-1 ${selectedId === snippet.id
                      ? 'bg-item-active text-gray-900'
                      : 'text-gray-600 hover:bg-item-hover'
                      }`}
                  >
                    <FileText size={14} className={selectedId === snippet.id ? 'text-gray-700' : 'text-gray-400'} />
                    <span className="truncate text-sm">{snippet.title}</span>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Main Content (Editor) */}
        <div className="flex-1 flex flex-col bg-white overflow-hidden">
          {!selectedId && !isCreating ? (
            /* Empty state: blank right panel when no snippet selected */
            <div className="flex-1 bg-white" data-testid="empty-state" />
          ) : (
            <div className="flex-1 flex flex-col h-full">
              {/* Toolbar */}
              <div className="h-10 border-b border-subtle flex items-center justify-between px-6 bg-white sticky top-0 z-10">
                {/* C4: Auto-save status indicator */}
                <div className="text-xs text-muted flex items-center gap-2">
                  {savingStatus === 'saving' && <span className="text-gray-400">Saving...</span>}
                  {savingStatus === 'saved' && <span className="text-gray-400 flex items-center gap-1"><Check size={12} /> Saved</span>}
                  {savingStatus === 'error' && <span className="text-red-500">Save Failed</span>}

                  {/* Separate success/error messages (e.g. copy) */}
                  {success && <span className="text-green-600 flex items-center gap-1 ml-2">✓ {success}</span>}
                  {error && <span className="text-red-600 flex items-center gap-1 ml-2">! {error}</span>}
                </div>

                <div className="flex items-center gap-1">
                  {!isCreating && selectedId && (
                    <>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleCopy(form.content)}
                        title="複製內容"
                        className="text-muted hover:text-gray-900"
                      >
                        <Copy size={14} className="mr-1" /> 複製
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={handleDelete}
                        title="刪除"
                        className="text-red-500 hover:text-red-700 hover:bg-red-50"
                      >
                        <Trash2 size={14} className="mr-1" /> 刪除
                      </Button>
                    </>
                  )}
                </div>
              </div>

              {/* Editor Form */}
              <div className="flex-1 overflow-y-auto px-16 py-10 custom-scrollbar">
                <div className="max-w-3xl mx-auto space-y-6">
                  {/* Title */}
                  <div>
                    <input
                      type="text"
                      value={form.title}
                      onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
                      className="w-full text-3xl font-bold text-gray-900 placeholder-gray-200 border-none p-0 focus:ring-0 bg-transparent leading-tight"
                      placeholder="Untitled"
                    />
                  </div>

                  {/* Properties - F2: Lightweight property value */}
                  <div className="flex items-center gap-4 text-sm group">
                    <div className="flex items-center gap-2 text-muted w-24 shrink-0 select-none">
                      <span className="text-xs opacity-70">🏷️</span> 標籤
                    </div>
                    <div className="flex-1">
                      <input
                        type="text"
                        value={form.tags}
                        onChange={(e) => setForm((f) => ({ ...f, tags: e.target.value }))}
                        className="w-full bg-transparent border-b border-transparent group-hover:border-gray-100 focus:border-blue-400 focus:outline-none py-1 text-gray-800 placeholder-gray-200 transition-colors text-sm"
                        placeholder="Empty"
                      />
                    </div>
                  </div>

                  {/* Divider - D1: Very subtle divider */}
                  <hr className="border-subtle my-8" />

                  {/* Content - F3: Breathable spacing */}
                  <div className="min-h-[500px]">
                    <textarea
                      value={form.content}
                      onChange={(e) => setForm((f) => ({ ...f, content: e.target.value }))}
                      className="w-full h-full min-h-[500px] resize-none border-none p-0 focus:ring-0 text-body font-mono text-gray-800 placeholder-gray-200 leading-relaxed"
                      placeholder="輸入片段內容..."
                    />
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

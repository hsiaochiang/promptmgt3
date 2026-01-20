import { useCallback, useEffect, useRef, useState } from 'react';
import { Copy, Plus, Trash2, FileText, Check, Tag, X } from 'lucide-react';
import type { SnippetEntity } from '@pah/contracts';
import { Button } from '../../ui/Button';
import { useUiStore } from '../../state/uiStore';

export function ClipboardView() {
  const rootRef = useRef<HTMLDivElement | null>(null);
  const titleInputRef = useRef<HTMLInputElement | null>(null);
  const { searchQuery } = useUiStore();
  const [snippets, setSnippets] = useState<SnippetEntity[]>([]);
  const [filteredSnippets, setFilteredSnippets] = useState<SnippetEntity[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [form, setForm] = useState<{ title: string; content: string; tags: string[] }>({
    title: '',
    content: '',
    tags: [],
  });
  const [tagInput, setTagInput] = useState('');
  const [loading, setLoading] = useState(true);
  const [savingStatus, setSavingStatus] = useState<'saved' | 'saving' | 'error' | 'idle'>('idle');
  const [lastSavedForm, setLastSavedForm] = useState<{ title: string; content: string; tags: string[] } | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const findOuterScrollContainer = useCallback(() => {
    let el = rootRef.current?.parentElement as HTMLElement | null;
    while (el) {
      if (el.classList?.contains('custom-scrollbar')) return el;
      el = el.parentElement;
    }
    return null;
  }, []);

  const preserveOuterScroll = useCallback((fn: () => void) => {
    const scroller = findOuterScrollContainer();
    const top = scroller?.scrollTop ?? 0;
    const docScroller = document.scrollingElement as HTMLElement | null;
    const docTop = docScroller?.scrollTop ?? 0;

    fn();

    requestAnimationFrame(() => {
      if (scroller) scroller.scrollTop = top;
      if (docScroller) docScroller.scrollTop = docTop;
    });
  }, [findOuterScrollContainer]);

  const focusTitle = useCallback(() => {
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        try {
          titleInputRef.current?.focus({ preventScroll: true });
        } catch {
          titleInputRef.current?.focus();
        }
      });
    });
  }, []);

  useEffect(() => {
    if (isCreating) focusTitle();
  }, [focusTitle, isCreating]);

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

  const handleSelect = (snippet: SnippetEntity) => preserveOuterScroll(() => {
    setSelectedId(snippet.id);
    setIsCreating(false);
    const formData = {
      title: snippet.title,
      content: snippet.content,
      tags: snippet.tags,
    };
    setForm(formData);
    setTagInput('');
    setLastSavedForm(formData); // Initialize last saved state
    setSavingStatus('idle');
    setError(null);
    setSuccess(null);
  });

  const handleNew = () => preserveOuterScroll(() => {
    setSelectedId(null);
    setIsCreating(true);
    const formData = { title: '', content: '', tags: [] };
    setForm(formData);
    setTagInput('');
    setLastSavedForm(formData);
    setSavingStatus('idle');
    setError(null);
    setSuccess(null);
  });

  // Auto-save logic
  useEffect(() => {
    // Skip initial load or if no change
    if (!lastSavedForm) return;

    // Check if form actually changed
    const isChanged =
      form.title !== lastSavedForm.title ||
      form.content !== lastSavedForm.content ||
      JSON.stringify(form.tags) !== JSON.stringify(lastSavedForm.tags);

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

      const payload = {
        title: form.title,
        content: form.content,
        tags: form.tags,
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

  const handleDelete = async (id?: string) => {
    const targetId = typeof id === 'string' ? id : selectedId;
    if (!targetId) return;
    if (!confirm('確定要刪除此片段嗎？')) return;

    try {
      setSavingStatus('saving');

      const res = await fetch(`http://localhost:3001/api/snippets/${targetId}`, {
        method: 'DELETE',
      });

      if (!res.ok) throw new Error('刪除片段失敗');

      setSnippets((prev) => prev.filter((s) => s.id !== targetId));
      
      if (selectedId === targetId) {
        setSelectedId(null);
        setIsCreating(false);
        setForm({ title: '', content: '', tags: [] });
        setLastSavedForm(null);
      }
      
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

  const handleRemoveTag = (tagToRemove: string) => {
    setForm(prev => ({ ...prev, tags: prev.tags.filter(t => t !== tagToRemove) }));
  };

  const handleTagInputKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      const newTags = tagInput.split(/[,，]/).map(t => t.trim()).filter(Boolean);
      if (newTags.length > 0) {
        const uniqueNewTags = newTags.filter(t => !form.tags.includes(t));
        if (uniqueNewTags.length > 0) {
          setForm(prev => ({ ...prev, tags: [...prev.tags, ...uniqueNewTags] }));
        }
        setTagInput('');
      }
    }
  };

  return (
    <div ref={rootRef} className="h-full min-h-0 flex flex-col bg-white">
      <div className="flex-1 min-h-0 flex overflow-hidden">
        {/* Sidebar List */}
        <div className="w-[340px] shrink-0 border-r border-gray-100 bg-white flex flex-col">
          {/* List Header Toolbar - Integrated on single horizontal row (Notion-style) */}
          <div className="h-10 px-3 flex items-center justify-between border-b border-gray-100 whitespace-nowrap leading-none" role="toolbar">
            <div className="flex items-center gap-2 min-w-0">
              <span className="text-xs text-gray-400 font-medium leading-none whitespace-nowrap">片段</span>
              <span className="text-xs text-gray-300 leading-none whitespace-nowrap">({filteredSnippets.length})</span>
            </div>
            <button
              onMouseDown={(e) => e.preventDefault()}
              onClick={(e) => {
                handleNew();
                (e.currentTarget as HTMLButtonElement).blur();
              }}
              className="flex items-center gap-1 text-sm bg-blue-500 hover:bg-blue-600 text-white px-3 py-1.5 rounded transition-colors shadow-sm leading-none focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-200 focus-visible:ring-offset-1"
              title="新增片段"
              type="button"
            >
              <Plus size={16} />
              <span className="font-medium">新增</span>
            </button>
          </div>

          <div
            className="flex-1 overflow-y-auto pt-2 px-2 pb-2 custom-scrollbar"
            style={{ scrollbarGutter: 'stable' } as any}
          >
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
                    className={`group w-full text-left h-9 px-2 rounded-md flex items-center gap-2 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-200 focus-visible:ring-offset-1 ${
                      selectedId === snippet.id
                        ? 'bg-blue-50 ring-1 ring-blue-100 text-gray-900'
                        : 'text-gray-700 hover:bg-gray-50'
                      }`}
                  >
                    <FileText size={16} className={selectedId === snippet.id ? 'text-gray-900' : 'text-gray-400'} />
                    <span className="truncate text-base">{snippet.title}</span>
                    
                    <div className="ml-auto flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button 
                        onClick={(e) => { e.stopPropagation(); handleCopy(snippet.content); }}
                        className="p-1.5 rounded hover:bg-gray-100 text-gray-500 hover:text-gray-900"
                        title="複製"
                      >
                        <Copy size={14} />
                      </button>
                      <button 
                        onClick={(e) => { e.stopPropagation(); handleDelete(snippet.id); }}
                        className="p-1.5 rounded hover:bg-gray-100 text-gray-500 hover:text-gray-900"
                        title="刪除"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Main Content (Editor) */}
        <div className="flex-1 flex flex-col min-w-0 bg-white">
          {!selectedId && !isCreating ? (
            <div className="flex-1 bg-white overflow-y-auto px-8 py-6">
              <div className="w-full max-w-none">
                <div className="border border-gray-100 rounded-md h-[260px] bg-white shadow-[0_1px_0_rgba(0,0,0,0.02)]" />
              </div>
            </div>
          ) : (
            <div className="flex-1 flex flex-col h-full">
              {/* Toolbar */}
              <div className="h-10 px-4 flex items-center justify-between border-b border-gray-100 bg-white sticky top-0 z-10">
                {/* C4: Auto-save status indicator */}
                <div className="text-sm text-gray-400 flex items-center gap-2 whitespace-nowrap overflow-hidden">
                  {savingStatus === 'saving' && <span>儲存中…</span>}
                  {savingStatus === 'saved' && <span className="flex items-center gap-1"><Check size={12} /> 已儲存</span>}
                  {savingStatus === 'error' && <span className="text-red-500">儲存失敗</span>}

                  {/* Separate success/error messages (e.g. copy) */}
                  {success && <span className="truncate max-w-[240px] text-green-600 flex items-center gap-1 ml-2">✓ {success}</span>}
                  {error && <span className="truncate max-w-[240px] text-red-600 flex items-center gap-1 ml-2">! {error}</span>}
                </div>

                <div className="flex items-center gap-1">
                  {!isCreating && selectedId && (
                    <>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleCopy(form.content)}
                        title="複製內容"
                        className="text-gray-500 hover:text-gray-900"
                      >
                        <Copy size={16} />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDelete()}
                        title="刪除"
                        className="text-gray-500 hover:text-red-600 hover:bg-red-50"
                      >
                        <Trash2 size={16} />
                      </Button>
                    </>
                  )}
                </div>
              </div>

              {/* Editor Form */}
              <div
                className="flex-1 min-h-0 overflow-y-auto px-8 py-6 custom-scrollbar"
                style={{ scrollbarGutter: 'stable' } as any}
              >
                <div className="w-full max-w-none mx-0 h-full min-h-0 flex flex-col gap-1">
                  {/* Title */}
                  <div>
                    <input
                      ref={titleInputRef}
                      type="text"
                      value={form.title}
                      onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
                      className="w-full text-2xl font-bold text-gray-900 placeholder-gray-300 border-none p-0 focus:ring-0 bg-transparent leading-tight"
                      placeholder="未命名"
                    />
                  </div>

                  {/* Properties - F2: Lightweight property value */}
                  <div className="grid grid-cols-[120px_1fr] items-center py-0.5">
                    <div className="text-xs text-gray-400 flex items-center gap-2 select-none">
                      <Tag size={14} /> 標籤
                    </div>
                    <div className="min-h-[28px] flex items-center gap-2 flex-wrap">
                      {form.tags.map(tag => (
                        <span key={tag} className="inline-flex items-center gap-1 px-2 py-0.5 bg-gray-100 text-gray-700 text-xs rounded">
                          {tag}
                          <button onClick={() => handleRemoveTag(tag)} className="hover:text-red-500"><X size={12} /></button>
                        </span>
                      ))}
                      <input
                        type="text"
                        value={tagInput}
                        onChange={(e) => setTagInput(e.target.value)}
                        onKeyDown={handleTagInputKeyDown}
                        className="h-7 w-32 bg-transparent hover:bg-gray-50 px-2 rounded text-base text-gray-700 outline-none border border-transparent hover:border-gray-100 focus:border-blue-200 placeholder-gray-400"
                        placeholder="新增標籤…"
                      />
                    </div>
                  </div>

                  {/* Divider - D1: Very subtle divider */}
                  <hr className="border-gray-100 my-1" />

                  {/* Content - F3: Breathable spacing */}
                  <div className="flex-1 min-h-[240px] flex flex-col">
                    <textarea
                      value={form.content}
                      onChange={(e) => setForm((f) => ({ ...f, content: e.target.value }))}
                      className="flex-1 min-h-0 w-full resize-none border-none p-0 focus:ring-0 font-mono text-base text-gray-800 placeholder-gray-300 leading-7"
                      placeholder="輸入片段內容…"
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

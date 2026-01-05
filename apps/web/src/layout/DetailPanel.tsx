import { useState, useEffect, useCallback } from 'react';
import { useAutosave } from '../hooks/useAutosave';
import { MarkdownEditor } from '../components/MarkdownEditor';
import type { PromptEntity } from '@pah/contracts';
import { useSyncStatus } from '../features/sync/SyncProvider';
import { ConflictBanner } from '../features/conflict/ConflictBanner';

interface DetailPanelProps {
  prompt: PromptEntity;
  onClose: () => void;
  onUpdate: (updated: PromptEntity) => void;
}

export function DetailPanel({ prompt, onClose, onUpdate }: DetailPanelProps) {
  const [formData, setFormData] = useState(prompt);
  const [isSaving, setIsSaving] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const [saveError, setSaveError] = useState<string | null>(null);

  // Update form data when prompt changes
  useEffect(() => {
    setFormData(prompt);
  }, [prompt.id]);

  // Autosave handler
  const saveToServer = useCallback(async (data: PromptEntity) => {
    setIsSaving(true);
    setSaveError(null);

    try {
      const response = await fetch(`http://localhost:3001/api/prompts/${data.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        throw new Error(`保存失敗: ${response.statusText}`);
      }

      const updated = await response.json();
      setLastSaved(new Date());
      onUpdate(updated);
    } catch (error) {
      setSaveError(error instanceof Error ? error.message : '保存失敗');
      console.error('Save error:', error);
    } finally {
      setIsSaving(false);
    }
  }, [onUpdate]);

  // Use autosave hook with 2-second debounce
  useAutosave(formData, saveToServer, 2000);

  const handleFieldChange = (field: keyof PromptEntity, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleRetry = () => {
    saveToServer(formData);
  };

  const handleCopyUnsaved = () => {
    const text = `Title: ${formData.title}\n\nBody:\n${formData.body}\n\nNotes:\n${formData.notes}`;
    navigator.clipboard.writeText(text);
    alert('未保存內容已複製到剪貼簿');
  };

  return (
    <div className="w-[600px] border-l border-subtle bg-white flex flex-col h-full">
      {/* Header */}
      <div className="border-b border-subtle p-4 flex items-center justify-between">
        <h2 className="font-semibold">編輯提示詞</h2>
        <button
          onClick={onClose}
          className="text-secondary hover:text-gray-900 text-xl leading-none"
        >
          ×
        </button>
      </div>

      {/* Save Status */}
      <div className="px-4 py-2 border-b border-subtle bg-subtle text-xs">
        {isSaving && <span className="text-blue-600">⏳ 保存中...</span>}
        {!isSaving && lastSaved && (
          <span className="text-green-600">
            ✓ 已保存 · {lastSaved.toLocaleTimeString('zh-TW')}
          </span>
        )}
        {saveError && (
          <div className="flex items-center gap-2 text-red-600">
            <span>✗ {saveError}</span>
            <button
              onClick={handleRetry}
              className="underline hover:no-underline"
            >
              重試
            </button>
            <button
              onClick={handleCopyUnsaved}
              className="underline hover:no-underline"
            >
              複製內容
            </button>
          </div>
        )}
      </div>

      {/* Form Content */}
      <div className="flex-1 overflow-auto p-4 space-y-4">
        {/* Title */}
        <div>
          <label className="block text-sm font-medium mb-1">標題</label>
          <input
            type="text"
            value={formData.title}
            onChange={(e) => handleFieldChange('title', e.target.value)}
            className="w-full px-3 py-2 border border-subtle rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {/* Status and Priority */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1">狀態</label>
            <select
              value={formData.status}
              onChange={(e) => handleFieldChange('status', e.target.value)}
              className="w-full px-3 py-2 border border-subtle rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="draft">草稿</option>
              <option value="tuning">調整中</option>
              <option value="ready">就緒</option>
              <option value="disabled">停用</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">優先級</label>
            <select
              value={formData.priority}
              onChange={(e) => handleFieldChange('priority', e.target.value)}
              className="w-full px-3 py-2 border border-subtle rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="P0">P0</option>
              <option value="P1">P1</option>
              <option value="P2">P2</option>
            </select>
          </div>
        </div>

        {/* Tags */}
        <div>
          <label className="block text-sm font-medium mb-1">標籤</label>
          <input
            type="text"
            value={formData.tags?.join(', ') || ''}
            onChange={(e) =>
              handleFieldChange(
                'tags',
                e.target.value.split(',').map(t => t.trim()).filter(Boolean)
              )
            }
            placeholder="以逗號分隔"
            className="w-full px-3 py-2 border border-subtle rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {/* Body - Markdown Editor */}
        <div>
          <label className="block text-sm font-medium mb-1">正文</label>
          <MarkdownEditor
            value={formData.body}
            onChange={(value) => handleFieldChange('body', value)}
          />
        </div>

        {/* Notes */}
        <div>
          <label className="block text-sm font-medium mb-1">備註</label>
          <textarea
            value={formData.notes}
            onChange={(e) => handleFieldChange('notes', e.target.value)}
            rows={4}
            className="w-full px-3 py-2 border border-subtle rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>
    </div>
  );
}

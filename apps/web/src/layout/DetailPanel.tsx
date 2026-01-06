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
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [unsavedSnapshot, setUnsavedSnapshot] = useState<PromptEntity | null>(null);
  const [lastKnownUpdatedAt, setLastKnownUpdatedAt] = useState<string | null>(prompt.updatedAt ?? null);
  const [creatingVersion, setCreatingVersion] = useState(false);

  const { lastStatus, setStatus } = useSyncStatus();
  const hasConflict = lastStatus.status === 'conflict';

  // Update form data when prompt changes
  useEffect(() => {
    setFormData(prompt);
    setLastKnownUpdatedAt(prompt.updatedAt ?? null);
    setLastSaved(null);
    setSaveError(null);
    setHasUnsavedChanges(false);
    setUnsavedSnapshot(null);
  }, [prompt]);

  // Autosave handler
  const saveToServer = useCallback(
    async (data: PromptEntity, options?: { skipConflictCheck?: boolean }) => {
      setIsSaving(true);
      setSaveError(null);

      try {
        // Optional conflict check based on updatedAt
        if (!options?.skipConflictCheck) {
          const currentResponse = await fetch(`http://localhost:3001/api/prompts/${data.id}`);
          if (currentResponse.ok) {
            const current = (await currentResponse.json()) as PromptEntity;
            const currentUpdatedAt = current.updatedAt ?? null;
            const knownUpdatedAt = lastKnownUpdatedAt;

            if (knownUpdatedAt && currentUpdatedAt && currentUpdatedAt !== knownUpdatedAt) {
              setUnsavedSnapshot(data);
              setHasUnsavedChanges(true);
              setStatus({
                status: 'conflict',
                message:
                  '偵測到檔案已在其他地方更新，請選擇「重新整理」或「覆寫儲存」。',
              });
              setSaveError('偵測到外部修改，已進入衝突狀態，請先處理衝突。');
              return;
            }

            // Keep server snapshot and known updatedAt in sync
            setLastKnownUpdatedAt(currentUpdatedAt);
          }
        }

        setStatus({ status: 'saving', message: '保存中…' });

        const response = await fetch(`http://localhost:3001/api/prompts/${data.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(data),
        });

        if (!response.ok) {
          throw new Error(`保存失敗: ${response.statusText}`);
        }

        const updated = (await response.json()) as PromptEntity;
        setLastSaved(new Date());
        setLastKnownUpdatedAt(updated.updatedAt ?? null);
        setHasUnsavedChanges(false);
        setUnsavedSnapshot(null);
        onUpdate(updated);
        setStatus({ status: 'idle' });
      } catch (error) {
        setSaveError(error instanceof Error ? error.message : '保存失敗');
        console.error('Save error:', error);
        setStatus({
          status: 'error',
          message: error instanceof Error ? error.message : '保存失敗',
        });
      } finally {
        setIsSaving(false);
      }
    },
    [lastKnownUpdatedAt, onUpdate, setStatus],
  );

  // Use autosave hook with 2-second debounce
  useAutosave(formData, saveToServer, 2000);

  const handleFieldChange = (field: keyof PromptEntity, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    setHasUnsavedChanges(true);
  };

  const handleRetry = () => {
    saveToServer(formData);
  };

  const handleCopyUnsaved = () => {
    const source = unsavedSnapshot ?? formData;
    const text = `標題：${source.title}\n\n正文：\n${source.body}\n\n備註：\n${source.notes}`;
    navigator.clipboard.writeText(text);
    alert('未保存內容已複製到剪貼簿');
  };

  const handleCreateVersion = async () => {
    const message = window.prompt('請輸入版本節點的說明（選填）：');
    if (message === null) return; // User cancelled

    try {
      setCreatingVersion(true);
      
      const response = await fetch('http://localhost:3001/api/snapshots', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          scope: 'prompt',
          message: message || undefined,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to create version node');
      }

      alert('版本節點建立成功！');
    } catch (error) {
      alert(`建立版本節點失敗：${error instanceof Error ? error.message : '未知錯誤'}`);
    } finally {
      setCreatingVersion(false);
    }
  };

  const handleRefresh = async () => {
    if (hasUnsavedChanges) {
      const confirmed = window.confirm(
        '重新整理會捨棄目前未保存的變更並載入檔案的最新版本，確定要繼續嗎？',
      );
      if (!confirmed) {
        return;
      }
    }

    try {
      const response = await fetch(`http://localhost:3001/api/prompts/${prompt.id}`);
      if (!response.ok) {
        throw new Error(`重新整理失敗: ${response.statusText}`);
      }

      const latest = (await response.json()) as PromptEntity;
      setFormData(latest);
      setLastKnownUpdatedAt(latest.updatedAt ?? null);
      setLastSaved(new Date());
      setSaveError(null);
      setHasUnsavedChanges(false);
      setUnsavedSnapshot(null);
      setStatus({ status: 'idle' });
    } catch (error) {
      setSaveError(error instanceof Error ? error.message : '重新整理失敗');
    }
  };

  const handleOverwrite = async () => {
    const confirmed = window.confirm(
      '這個動作會覆寫檔案上的外部變更且無法復原，確定要繼續嗎？',
    );
    if (!confirmed) {
      return;
    }

    const dataToSave = unsavedSnapshot ?? formData;
    await saveToServer(dataToSave, { skipConflictCheck: true });
  };

  return (
    <div className="w-[600px] border-l border-subtle bg-white flex flex-col h-full">
      {/* Header */}
      <div className="border-b border-subtle p-4 flex items-center justify-between">
        <h2 className="font-semibold">編輯提示詞</h2>
        <div className="flex items-center gap-2">
          <button
            onClick={handleCreateVersion}
            disabled={creatingVersion || hasUnsavedChanges}
            className="px-3 py-1 text-xs bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
            title={hasUnsavedChanges ? '請先保存變更再建立版本節點' : '建立版本節點'}
          >
            {creatingVersion ? '建立中...' : '📌 版本節點'}
          </button>
          <button
            onClick={onClose}
            className="text-secondary hover:text-gray-900 text-xl leading-none"
          >
            ×
          </button>
        </div>
      </div>

      {/* Conflict Banner */}
      {hasConflict && (
        <ConflictBanner
          message={lastStatus.message || '偵測到檔案已在其他地方更新，請選擇處理方式。'}
          onRefresh={handleRefresh}
          onOverwrite={handleOverwrite}
          onCopyUnsaved={handleCopyUnsaved}
        />
      )}

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
            entityType="prompt"
            entityId={formData.id}
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

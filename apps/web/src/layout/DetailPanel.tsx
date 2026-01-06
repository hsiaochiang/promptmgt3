import { useState, useEffect, useCallback, type ReactNode } from 'react';
import { useAutosave } from '../hooks/useAutosave';
import type { PromptEntity } from '@pah/contracts';
import { useSyncStatus } from '../features/sync/SyncProvider';
import { ConflictBanner } from '../features/conflict/ConflictBanner';
import { Calendar, CheckCircle, ChevronRight, Maximize2, Minimize2 } from 'lucide-react';

interface DetailPanelProps {
  prompt: PromptEntity;
  onClose: () => void;
  onUpdate: (updated: PromptEntity) => void;
  onNotify?: (message: string) => void;
}

export function DetailPanel({ prompt, onClose, onUpdate, onNotify }: DetailPanelProps) {
  const [formData, setFormData] = useState(prompt);
  const [isSaving, setIsSaving] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [unsavedSnapshot, setUnsavedSnapshot] = useState<PromptEntity | null>(null);
  const [lastKnownUpdatedAt, setLastKnownUpdatedAt] = useState<string | null>(prompt.updatedAt ?? null);
  const [creatingVersion, setCreatingVersion] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);

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
    async (
      data: PromptEntity,
      options?: { skipConflictCheck?: boolean; notifySuccess?: boolean },
    ) => {
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

        if (options?.notifySuccess) {
          onNotify?.('儲存成功');
        }
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
    [lastKnownUpdatedAt, onNotify, onUpdate, setStatus],
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

  const handleManualSave = () => {
    saveToServer(formData, { notifySuccess: true });
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
    <div className={`h-full bg-white shadow-2xl flex flex-col transform transition-all duration-300 animate-slide-in-right ${isExpanded ? 'w-full' : 'w-[600px]'}`}>
      {/* Top Bar - Prototype style */}
      <div className="h-12 flex items-center justify-between px-4 hover:bg-transparent">
        <div className="flex items-center gap-2 text-xs text-gray-400 transition-colors">
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="p-1 hover:bg-gray-100 hover:text-gray-600 rounded text-gray-400 transition-colors"
            title={isExpanded ? '還原' : '展開為全頁'}
          >
            {isExpanded ? <Minimize2 size={14} /> : <Maximize2 size={14} className="rotate-45" />}
          </button>

          <div className="flex items-center gap-2 cursor-default">
            <span className="hover:text-gray-900 hover:underline decoration-gray-300 underline-offset-2 cursor-pointer">
              資料庫
            </span>
            <span>/</span>
            <span className="truncate max-w-[200px] text-gray-800 font-medium">{formData.title}</span>
          </div>
        </div>

        <div className="flex items-center gap-1">
          <button
            onClick={handleCreateVersion}
            disabled={creatingVersion || hasUnsavedChanges}
            className="text-xs text-gray-400 hover:text-gray-600 flex items-center gap-1 disabled:opacity-50 disabled:cursor-not-allowed"
            title={hasUnsavedChanges ? '請先保存變更再建立版本節點' : '建立版本節點'}
          >
            {creatingVersion ? '建立中...' : '📌 版本節點'}
          </button>
          <button
            onClick={onClose}
            className="p-1.5 hover:bg-gray-100 rounded text-gray-500 transition-colors"
            title="關閉"
          >
            <ChevronRight size={20} />
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
      <div className="px-4 py-2 border-b border-gray-100 bg-[#F7F7F5] text-xs">
        {isSaving && <span className="text-blue-600">⏳ 保存中...</span>}
        {!isSaving && lastSaved && (
          <span className="text-green-600">✓ 已保存 · {lastSaved.toLocaleTimeString('zh-TW')}</span>
        )}
        {saveError && (
          <div className="flex items-center gap-2 text-red-600">
            <span>✗ {saveError}</span>
            <button onClick={handleRetry} className="underline hover:no-underline">
              重試
            </button>
            <button onClick={handleCopyUnsaved} className="underline hover:no-underline">
              複製內容
            </button>
          </div>
        )}
      </div>

      {/* Content Area */}
      <div className="flex-1 overflow-y-auto px-12 py-8 custom-scrollbar">
        <div className={`mx-auto ${isExpanded ? 'max-w-4xl' : ''}`}>
          <div className="mb-6">
            <input
              type="text"
              value={formData.title}
              onChange={(e) => handleFieldChange('title', e.target.value)}
              className="w-full text-4xl font-bold text-gray-900 placeholder-gray-300 border-none focus:ring-0 focus:outline-none p-0 bg-transparent leading-tight mb-2"
              placeholder="Untitled"
            />
          </div>

          <div className="space-y-1 mb-8">
            <PropertyRow label="狀態" icon={<CheckCircle size={14} className="text-gray-400" />}>
              <select
                value={formData.status}
                onChange={(e) => handleFieldChange('status', e.target.value)}
                className="bg-transparent hover:bg-gray-100 rounded px-1.5 py-0.5 text-[11px] text-gray-700 border-none focus:ring-0 cursor-pointer w-full"
              >
                <option value="draft">草稿</option>
                <option value="tuning">調整中</option>
                <option value="ready">就緒</option>
                <option value="disabled">停用</option>
              </select>
            </PropertyRow>

            <PropertyRow label="優先級" icon={<span className="text-gray-400 text-xs">⚑</span>}>
              <select
                value={formData.priority}
                onChange={(e) => handleFieldChange('priority', e.target.value)}
                className="bg-transparent hover:bg-gray-100 rounded px-1.5 py-0.5 text-xs text-gray-700 border-none focus:ring-0 cursor-pointer w-full"
              >
                <option value="P0">P0</option>
                <option value="P1">P1</option>
                <option value="P2">P2</option>
              </select>
            </PropertyRow>

            <PropertyRow label="標籤" icon={<span className="text-gray-400 text-xs">#</span>}>
              <input
                type="text"
                value={(formData.tags ?? []).join(', ')}
                onChange={(e) =>
                  handleFieldChange(
                    'tags',
                    e.target.value
                      .split(',')
                      .map(t => t.trim())
                      .filter(Boolean),
                  )
                }
                placeholder="以逗號分隔"
                className="bg-transparent hover:bg-gray-100 rounded px-1.5 py-0.5 text-xs text-gray-700 border-none focus:ring-0 w-full placeholder-gray-300"
              />
            </PropertyRow>

            <PropertyRow label="更新時間" icon={<Calendar size={14} className="text-gray-400" />}>
              <span className="text-xs text-gray-500 px-1.5">
                {new Date(formData.updatedAt).toLocaleString('zh-TW')}
              </span>
            </PropertyRow>
          </div>

          <hr className="border-gray-100 mb-8" />

          <div className="mb-8">
            <h3 className="text-sm font-bold text-gray-900 mb-2">備註</h3>
            <textarea
              className="w-full min-h-[60px] p-3 bg-gray-50 rounded border border-transparent focus:bg-white focus:border-blue-200 focus:ring-0 text-gray-700 text-[11px] leading-relaxed resize-none transition-all placeholder-gray-400"
              value={formData.notes ?? ''}
              onChange={(e) => handleFieldChange('notes', e.target.value)}
              placeholder="輸入備註..."
            />
          </div>

          <div className="h-full flex flex-col">
            <div className="flex justify-between items-center mb-4 border-t border-gray-100 pt-6">
              <h3 className="text-sm font-bold text-gray-900">內容編輯</h3>
              <button
                onClick={handleManualSave}
                className="text-xs text-gray-400 hover:text-gray-600 flex items-center gap-1"
              >
                Saved
              </button>
            </div>
            <textarea
              className="w-full min-h-[400px] bg-transparent border-none focus:ring-0 font-mono text-[11px] leading-relaxed text-gray-700 resize-none p-0 placeholder-gray-300"
              value={formData.body}
              onChange={(e) => handleFieldChange('body', e.target.value)}
              placeholder="# 開始撰寫提示詞..."
            />
          </div>

          <div className="h-20"></div>
        </div>
      </div>
    </div>
  );
}

function PropertyRow({
  label,
  icon,
  children,
}: {
  label: string;
  icon: ReactNode;
  children: ReactNode;
}) {
  return (
    <div className="grid grid-cols-[120px_1fr] items-start py-1 group">
      <div className="flex items-center gap-2 text-[11px] text-gray-400 pt-1">
        {icon}
        <span className="truncate">{label}</span>
      </div>
      <div className="min-h-[28px] flex items-center w-full">{children}</div>
    </div>
  );
}

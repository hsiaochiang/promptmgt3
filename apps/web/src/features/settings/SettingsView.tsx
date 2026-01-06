import { useState, useEffect } from 'react';
import type { WorkspaceSettings } from '@pah/contracts';
import { MOCK_SETTINGS } from '../../data/mockData';

const USE_MOCK_DATA = true; // Set to false to use real API

export function SettingsView() {
  const [settings, setSettings] = useState<WorkspaceSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      setLoading(true);
      
      if (USE_MOCK_DATA) {
        // Use mock data for visual comparison
        await new Promise(resolve => setTimeout(resolve, 300));
        setSettings(MOCK_SETTINGS);
      } else {
        // Use real API
        const response = await fetch('http://localhost:3001/api/workspace/settings');
        if (!response.ok) {
          throw new Error('Failed to load settings');
        }
        const data = await response.json();
        setSettings(data);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load settings');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!settings) return;

    try {
      setSaving(true);
      setError(null);
      setSuccess(false);

      const response = await fetch('http://localhost:3001/api/workspace/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(settings),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to save settings');
      }

      const updated = await response.json();
      setSettings(updated);
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save settings');
    } finally {
      setSaving(false);
    }
  };

  const handleFieldChange = (field: keyof WorkspaceSettings, value: any) => {
    setSettings(prev => prev ? { ...prev, [field]: value } : null);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-secondary">載入中...</div>
      </div>
    );
  }

  if (!settings) {
    return (
      <div className="p-8 text-center">
        <div className="text-red-600">Failed to load settings</div>
      </div>
    );
  }

  return (
    <div className="p-8">
      <div className="max-w-2xl mx-auto">
        <h2 className="text-xl font-semibold mb-6">工作區設定</h2>

        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md text-sm text-red-700">
            {error}
          </div>
        )}

        {success && (
          <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-md text-sm text-green-700">
            設定已保存
          </div>
        )}

        <div className="space-y-6">
          {/* Root Path */}
          <div>
            <label className="block text-sm font-medium mb-1">資料根目錄</label>
            <input
              type="text"
              value={settings.rootPath}
              onChange={(e) => handleFieldChange('rootPath', e.target.value)}
              className="w-full px-3 py-2 border border-subtle rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="例如: D:/data/prompts"
            />
            <p className="mt-1 text-xs text-secondary">
              存放專案和提示詞檔案的目錄
            </p>
          </div>

          {/* Attachment Path */}
          <div>
            <label className="block text-sm font-medium mb-1">附件目錄</label>
            <input
              type="text"
              value={settings.attachmentPath}
              onChange={(e) => handleFieldChange('attachmentPath', e.target.value)}
              className="w-full px-3 py-2 border border-subtle rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="例如: D:/data/attachments"
            />
            <p className="mt-1 text-xs text-secondary">
              存放附件檔案的目錄
            </p>
          </div>

          {/* Tags Dictionary */}
          <div className="border-t border-subtle pt-6">
            <h3 className="text-sm font-medium mb-3">標籤字典（tagsDict）</h3>
            <p className="text-xs text-secondary mb-2">
              用於建議/選單的全域標籤分類。重新命名類別時會將舊類別標籤合併到新類別。
            </p>
            <div className="space-y-3">
              {Object.entries(settings.tagsDict ?? {}).map(([category, tags]) => {
                const value = Array.isArray(tags) ? (tags as string[]).join(', ') : '';
                return (
                  <div key={category} className="border border-subtle rounded-md p-3">
                    <div className="flex items-center justify-between mb-2">
                      <div className="text-sm font-medium">{category}</div>
                      <div className="flex gap-2 text-xs">
                        <button
                          type="button"
                          className="text-secondary hover:text-primary"
                          onClick={() => {
                            const next = window.prompt('新的類別名稱', category)?.trim();
                            if (!next || next === category) return;
                            setSettings(prev => {
                              if (!prev) return prev;
                              const currentDict = prev.tagsDict ?? {};
                              const existing = Array.isArray(currentDict[category]) ? currentDict[category] as string[] : [];
                              const target = Array.isArray(currentDict[next]) ? currentDict[next] as string[] : [];
                              const merged = Array.from(new Set([...target, ...existing]));
                              const nextDict: Record<string, string[]> = { ...currentDict };
                              delete nextDict[category];
                              nextDict[next] = merged;
                              return { ...prev, tagsDict: nextDict };
                            });
                          }}
                        >
                          重新命名（合併）
                        </button>
                        <button
                          type="button"
                          className="text-secondary hover:text-red-600"
                          onClick={() => {
                            setSettings(prev => {
                              if (!prev) return prev;
                              const currentDict = prev.tagsDict ?? {};
                              const nextDict: Record<string, string[]> = { ...currentDict };
                              delete nextDict[category];
                              return { ...prev, tagsDict: Object.keys(nextDict).length ? nextDict : undefined };
                            });
                          }}
                        >
                          刪除
                        </button>
                      </div>
                    </div>
                    <input
                      type="text"
                      value={value}
                      onChange={(e) => {
                        const raw = e.target.value;
                        const parts = raw
                          .split(/[,\s]+/)
                          .map((t) => t.trim())
                          .filter(Boolean);
                        const unique = Array.from(new Set(parts));
                        setSettings(prev => {
                          if (!prev) return prev;
                          const currentDict = prev.tagsDict ?? {};
                          return {
                            ...prev,
                            tagsDict: {
                              ...currentDict,
                              [category]: unique,
                            },
                          };
                        });
                      }}
                      className="w-full px-3 py-2 border border-subtle rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="以逗號或空白分隔標籤，例如：twitter youtube github"
                    />
                  </div>
                );
              })}
              <button
                type="button"
                className="px-3 py-1.5 border border-dashed border-subtle rounded-md text-xs text-secondary hover:text-primary hover:border-primary"
                onClick={() => {
                  const key = window.prompt('新類別名稱（例如：platform/common）')?.trim();
                  if (!key) return;
                  setSettings(prev => {
                    if (!prev) return prev;
                    const currentDict = prev.tagsDict ?? {};
                    if (currentDict[key]) return prev;
                    return {
                      ...prev,
                      tagsDict: {
                        ...currentDict,
                        [key]: [],
                      },
                    };
                  });
                }}
              >
                新增標籤類別
              </button>
            </div>
          </div>

          {/* Common Options */}
          <div className="border-t border-subtle pt-6">
            <h3 className="text-sm font-medium mb-3">常用選項（commonOptions）</h3>
            <p className="text-xs text-secondary mb-2">
              例如模型、來源等常用選項。重複項目將自動去重。
            </p>
            <div className="space-y-3">
              {Object.entries(settings.commonOptions ?? {}).map(([key, raw]) => {
                const values = Array.isArray(raw) ? (raw as string[]) : [];
                const text = values.join('\n');
                return (
                  <div key={key} className="border border-subtle rounded-md p-3">
                    <div className="flex items-center justify-between mb-2">
                      <div className="text-sm font-medium">{key}</div>
                      <button
                        type="button"
                        className="text-secondary hover:text-red-600 text-xs"
                        onClick={() => {
                          setSettings(prev => {
                            if (!prev) return prev;
                            const current = prev.commonOptions ?? {};
                            const nextOpts: Record<string, string[]> = { ...current };
                            delete nextOpts[key];
                            return {
                              ...prev,
                              commonOptions: Object.keys(nextOpts).length ? nextOpts : undefined,
                            };
                          });
                        }}
                      >
                        刪除集合
                      </button>
                    </div>
                    <textarea
                      rows={3}
                      value={text}
                      onChange={(e) => {
                        const lines = e.target.value
                          .split(/\n+/)
                          .map((l) => l.trim())
                          .filter(Boolean);
                        const unique = Array.from(new Set(lines));
                        setSettings(prev => {
                          if (!prev) return prev;
                          const current = prev.commonOptions ?? {};
                          return {
                            ...prev,
                            commonOptions: {
                              ...current,
                              [key]: unique,
                            },
                          };
                        });
                      }}
                      className="w-full px-3 py-2 border border-subtle rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono"
                      placeholder={"每行一個選項，例如：\nGPT-4o\nClaude 3.5 Sonnet"}
                    />
                  </div>
                );
              })}
              <button
                type="button"
                className="px-3 py-1.5 border border-dashed border-subtle rounded-md text-xs text-secondary hover:text-primary hover:border-primary"
                onClick={() => {
                  const key = window.prompt('新增常用選項集合鍵（例如：models/sources）')?.trim();
                  if (!key) return;
                  setSettings(prev => {
                    if (!prev) return prev;
                    const current = prev.commonOptions ?? {};
                    if (current[key]) return prev;
                    return {
                      ...prev,
                      commonOptions: {
                        ...current,
                        [key]: [],
                      },
                    };
                  });
                }}
              >
                新增選項集合
              </button>
            </div>
          </div>

          {/* Backup Settings */}
          <div className="border-t border-subtle pt-6">
            <h3 className="text-sm font-medium mb-3">備份設定</h3>
            <div className="space-y-3">
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={settings.backup?.dailySnapshot || false}
                  onChange={(e) =>
                    handleFieldChange('backup', {
                      ...(settings.backup || { dailySnapshot: false }),
                      dailySnapshot: e.target.checked,
                    })
                  }
                  className="rounded border-gray-300"
                />
                <span className="text-sm">啟用每日自動快照</span>
              </label>
              <div>
                <label className="block text-sm font-medium mb-1">排程時間（HH:mm，本機時區）</label>
                <input
                  type="text"
                  value={settings.backup?.schedule ?? ''}
                  onChange={(e) =>
                    handleFieldChange('backup', {
                      ...(settings.backup || { dailySnapshot: false }),
                      schedule: e.target.value,
                    })
                  }
                  className="w-full px-3 py-2 border border-subtle rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="例如：03:00"
                />
                <p className="mt-1 text-xs text-secondary">
                  必須符合 HH:mm（24 小時制），例如 03:00 或 21:30；格式錯誤時後端會回傳 400。
                </p>
              </div>
            </div>
          </div>

          {/* Trash Settings */}
          <div className="border-t border-subtle pt-6">
            <h3 className="text-sm font-medium mb-3">回收站設定</h3>
            <div>
              <label className="block text-sm font-medium mb-1">回收站保留天數</label>
              <input
                type="number"
                min={1}
                value={settings.trashRetentionDays ?? 30}
                onChange={(e) =>
                  handleFieldChange(
                    'trashRetentionDays',
                    Math.max(1, Number(e.target.value || 30)),
                  )
                }
                className="w-full px-3 py-2 border border-subtle rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="30"
              />
              <p className="mt-1 text-xs text-secondary">
                到期後系統會自動清理回收站項目（預設 30 天）
              </p>
            </div>
          </div>

          {/* Save Button */}
          <div className="border-t border-subtle pt-6">
            <button
              onClick={handleSave}
              disabled={saving}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed text-sm font-medium"
            >
              {saving ? '保存中...' : '保存設定'}
            </button>
          </div>
        </div>

        {/* Info */}
        <div className="mt-8 p-4 bg-blue-50 border border-blue-200 rounded-md text-sm">
          <p className="text-blue-800">
            <strong>提示：</strong>變更路徑設定後，請確保目錄存在且具有讀寫權限。
            系統會自動驗證權限並在無法存取時提示錯誤。
          </p>
        </div>
      </div>
    </div>
  );
}

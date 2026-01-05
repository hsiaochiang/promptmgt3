import { useState, useEffect } from 'react';

interface WorkspaceSettings {
  rootPath: string;
  attachmentPath: string;
  tagsDict?: Record<string, string[]>;
  commonOptions?: Record<string, any>;
  backup?: {
    dailySnapshot: boolean;
    schedule?: string;
    remote?: string;
  };
  updatedAt: string;
}

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
      const response = await fetch('http://localhost:3001/api/workspace/settings');
      if (!response.ok) {
        throw new Error('Failed to load settings');
      }
      const data = await response.json();
      setSettings(data);
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
                      ...settings.backup,
                      dailySnapshot: e.target.checked,
                    })
                  }
                  className="rounded border-gray-300"
                />
                <span className="text-sm">啟用每日自動快照</span>
              </label>
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

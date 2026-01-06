import { useState } from 'react';
import type { RestoreConflict } from '@pah/contracts';

interface RestoreConflictDialogProps {
  conflict: RestoreConflict;
  onResolve: (strategy: 'overwrite' | 'rename', newSlug?: string) => void;
  onCancel: () => void;
}

export function RestoreConflictDialog({
  conflict,
  onResolve,
  onCancel,
}: RestoreConflictDialogProps) {
  const [strategy, setStrategy] = useState<'overwrite' | 'rename'>('rename');
  const [newSlug, setNewSlug] = useState('');

  const handleSubmit = () => {
    if (strategy === 'rename' && !newSlug.trim()) {
      alert('請輸入新的名稱');
      return;
    }

    onResolve(strategy, strategy === 'rename' ? newSlug : undefined);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
        <h2 className="text-lg font-semibold mb-4">復原衝突</h2>

        <div className="mb-4 p-3 bg-yellow-50 border border-yellow-200 rounded text-sm">
          <p className="font-medium text-yellow-800 mb-2">{conflict.message}</p>
          <div className="text-yellow-700 space-y-1">
            {conflict.conflicts.map((c, idx) => (
              <div key={idx} className="text-xs">
                <span className="font-medium">{c.kind}:</span> {c.path}
              </div>
            ))}
          </div>
        </div>

        <div className="space-y-3 mb-6">
          <label className="flex items-start gap-3 cursor-pointer">
            <input
              type="radio"
              name="strategy"
              value="rename"
              checked={strategy === 'rename'}
              onChange={(e) => setStrategy(e.target.value as 'rename')}
              className="mt-1"
            />
            <div className="flex-1">
              <div className="font-medium text-sm">改名復原</div>
              <div className="text-xs text-secondary mt-1">
                使用新的名稱復原，避免覆蓋現有檔案
              </div>
              {strategy === 'rename' && (
                <input
                  type="text"
                  placeholder="輸入新的名稱（slug）"
                  value={newSlug}
                  onChange={(e) => setNewSlug(e.target.value)}
                  className="mt-2 w-full px-3 py-2 border border-subtle rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  autoFocus
                />
              )}
            </div>
          </label>

          <label className="flex items-start gap-3 cursor-pointer">
            <input
              type="radio"
              name="strategy"
              value="overwrite"
              checked={strategy === 'overwrite'}
              onChange={(e) => setStrategy(e.target.value as 'overwrite')}
              className="mt-1"
            />
            <div className="flex-1">
              <div className="font-medium text-sm">覆蓋復原</div>
              <div className="text-xs text-secondary mt-1">
                刪除現有檔案並復原（⚠️ 現有檔案將遺失）
              </div>
            </div>
          </label>
        </div>

        <div className="flex justify-end gap-2">
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-2 text-sm border border-subtle rounded-md hover:bg-hover"
          >
            取消
          </button>
          <button
            type="button"
            onClick={handleSubmit}
            className="px-4 py-2 text-sm bg-blue-600 text-white rounded-md hover:bg-blue-700"
          >
            確認復原
          </button>
        </div>
      </div>
    </div>
  );
}

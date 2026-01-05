import React from 'react';

interface ConflictBannerProps {
  message: string;
  onRefresh: () => void;
  onOverwrite: () => void;
  onCopyUnsaved: () => void;
}

export const ConflictBanner: React.FC<ConflictBannerProps> = ({
  message,
  onRefresh,
  onOverwrite,
  onCopyUnsaved,
}) => {
  return (
    <div className="px-4 py-2 border-b border-amber-300 bg-amber-50 text-xs text-amber-900 flex items-center justify-between gap-4">
      <div className="flex-1 min-w-0">
        <strong className="mr-1">偵測到檔案衝突。</strong>
        <span className="whitespace-pre-line break-words">{message}</span>
      </div>
      <div className="flex items-center gap-2 flex-shrink-0">
        <button
          type="button"
          onClick={onCopyUnsaved}
          className="px-2 py-1 rounded border border-amber-300 bg-white hover:bg-amber-100 text-amber-900"
        >
          複製未保存內容
        </button>
        <button
          type="button"
          onClick={onRefresh}
          className="px-2 py-1 rounded border border-amber-300 bg-white hover:bg-amber-100 text-amber-900"
        >
          重新整理
        </button>
        <button
          type="button"
          onClick={onOverwrite}
          className="px-2 py-1 rounded border border-red-500 bg-red-500 text-white hover:bg-red-600"
        >
          覆寫儲存
        </button>
      </div>
    </div>
  );
};

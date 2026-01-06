import { useState, useEffect } from 'react';
import type { SnapshotCreatedPayload, SnapshotFailedPayload } from '@pah/contracts';

interface BackupStatus {
  isBackingUp: boolean;
  lastSuccess?: string;
  lastError?: string;
  errorMessage?: string;
}

export function BackupStatusBanner() {
  const [status, setStatus] = useState<BackupStatus>({
    isBackingUp: false,
  });
  const [retrying, setRetrying] = useState(false);

  useEffect(() => {
    // Connect to WebSocket
    if (typeof window === 'undefined' || typeof WebSocket === 'undefined') {
      return;
    }

    const ws = new WebSocket('ws://localhost:3001/ws');

    ws.onmessage = (event) => {
      try {
        const parsed = JSON.parse(event.data);
        
        if (parsed.event === 'snapshot.created') {
          parsed as SnapshotCreatedPayload;
          setStatus({
            isBackingUp: false,
            lastSuccess: new Date().toISOString(),
            lastError: undefined,
            errorMessage: undefined,
          });
        } else if (parsed.event === 'snapshot.failed') {
          const data = parsed as SnapshotFailedPayload;
          setStatus({
            isBackingUp: false,
            lastSuccess: status.lastSuccess,
            lastError: new Date().toISOString(),
            errorMessage: data.data.error || '備份失敗',
          });
        }
      } catch {
        // Ignore malformed messages
      }
    };

    return () => {
      ws.close();
    };
  }, []);

  const handleRetrySnapshot = async () => {
    try {
      setRetrying(true);
      setStatus({ ...status, isBackingUp: true });

      const response = await fetch('http://localhost:3001/api/snapshots', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          scope: 'workspace',
          message: '重試備份',
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to create snapshot');
      }

      // Success will be handled by WebSocket event
    } catch (error) {
      setStatus({
        isBackingUp: false,
        lastSuccess: status.lastSuccess,
        lastError: new Date().toISOString(),
        errorMessage: error instanceof Error ? error.message : '備份失敗',
      });
    } finally {
      setRetrying(false);
    }
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString('zh-TW', {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  // Don't show banner if no activity
  if (!status.isBackingUp && !status.lastSuccess && !status.lastError) {
    return null;
  }

  return (
    <div className="border-b border-subtle">
      {/* Backing up */}
      {status.isBackingUp && (
        <div className="px-4 py-2 bg-blue-50 text-blue-800 text-sm flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="animate-spin">⏳</div>
            <span>正在建立備份快照...</span>
          </div>
        </div>
      )}

      {/* Success */}
      {!status.isBackingUp && status.lastSuccess && !status.lastError && (
        <div className="px-4 py-2 bg-green-50 text-green-800 text-sm flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span>✓</span>
            <span>備份成功</span>
            <span className="text-xs text-green-600">
              {formatTime(status.lastSuccess)}
            </span>
          </div>
        </div>
      )}

      {/* Error */}
      {!status.isBackingUp && status.lastError && (
        <div className="px-4 py-2 bg-red-50 text-red-800 text-sm">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span>⚠</span>
              <span>備份失敗：{status.errorMessage}</span>
              {status.lastError && (
                <span className="text-xs text-red-600">
                  {formatTime(status.lastError)}
                </span>
              )}
            </div>
            <button
              onClick={handleRetrySnapshot}
              disabled={retrying}
              className="px-3 py-1 bg-red-600 text-white rounded hover:bg-red-700 disabled:opacity-50 text-xs font-medium"
            >
              {retrying ? '重試中...' : '重試'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

import React, { createContext, useContext, useEffect, useState } from 'react';
import type { StatusEvent } from '@pah/contracts';

export type SyncStatus = {
  status: 'idle' | 'saving' | 'conflict' | 'error';
  message?: string;
};

interface SyncContextValue {
  lastStatus: SyncStatus;
}

const SyncContext = createContext<SyncContextValue | undefined>(undefined);

export const SyncProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [lastStatus, setLastStatus] = useState<SyncStatus>({ status: 'idle' });

  useEffect(() => {
    if (typeof window === 'undefined' || typeof WebSocket === 'undefined') {
      return;
    }

    const ws = new WebSocket('ws://localhost:3001/ws');

    ws.onmessage = (event) => {
      try {
        const parsed = JSON.parse(event.data) as StatusEvent | any;
        if (parsed.event === 'sync.status') {
          const data = parsed.data as StatusEvent['data'];
          setLastStatus({ status: data.status, message: data.message });
        }
      } catch {
        // Ignore malformed messages
      }
    };

    ws.onerror = () => {
      setLastStatus({ status: 'error', message: '同步連線錯誤' });
    };

    return () => {
      ws.close();
    };
  }, []);

  return (
    <SyncContext.Provider value={{ lastStatus }}>
      {children}
    </SyncContext.Provider>
  );
};

export function useSyncStatus(): SyncContextValue {
  const ctx = useContext(SyncContext);
  if (!ctx) {
    throw new Error('useSyncStatus must be used within SyncProvider');
  }
  return ctx;
}

import { useEffect, useRef, useState } from 'react';

export type AutosaveStatus = 'idle' | 'saving' | 'saved' | 'error';

/**
 * Autosave hook with debounce and status tracking
 * @param data - Data to save
 * @param onSave - Save function
 * @param delay - Debounce delay in milliseconds (default: 2000ms)
 * @returns Object with status and timestamp
 */
export function useAutosave<T>(
  data: T,
  onSave: (data: T) => Promise<void>,
  delay: number = 2000
) {
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const previousDataRef = useRef<T>(data);
  const [status, setStatus] = useState<AutosaveStatus>('idle');
  const [lastSavedAt, setLastSavedAt] = useState<Date | null>(null);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    // Skip if data hasn't changed
    if (JSON.stringify(data) === JSON.stringify(previousDataRef.current)) {
      return;
    }

    // Clear previous timeout
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    // Set new timeout for autosave
    timeoutRef.current = setTimeout(async () => {
      setStatus('saving');
      setError(null);
      
      try {
        await onSave(data);
        previousDataRef.current = data;
        setStatus('saved');
        setLastSavedAt(new Date());
        
        // Reset to idle after 2 seconds
        setTimeout(() => setStatus('idle'), 2000);
      } catch (err) {
        setStatus('error');
        setError(err instanceof Error ? err : new Error('Unknown error'));
      }
    }, delay);

    // Cleanup on unmount or when dependencies change
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [data, onSave, delay]);

  return {
    status,
    lastSavedAt,
    error,
  };
}

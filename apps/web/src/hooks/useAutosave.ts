import { useEffect, useRef } from 'react';

/**
 * Autosave hook with debounce
 * @param data - Data to save
 * @param onSave - Save function
 * @param delay - Debounce delay in milliseconds (default: 2000ms)
 */
export function useAutosave<T>(
  data: T,
  onSave: (data: T) => Promise<void>,
  delay: number = 2000
) {
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const previousDataRef = useRef<T>(data);

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
    timeoutRef.current = setTimeout(() => {
      onSave(data);
      previousDataRef.current = data;
    }, delay);

    // Cleanup on unmount or when dependencies change
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [data, onSave, delay]);
}

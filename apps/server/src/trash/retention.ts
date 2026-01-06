import fs from 'fs/promises';
import { getTrashItemsDir, getTrashItemManifestPath } from '../fs-layout/index.js';
import { purgeTrashItem } from './trashStore.js';

/**
 * Clean up expired trash items based on retention policy
 * This should be called:
 * 1. On server startup (once)
 * 2. Daily at a fixed time (e.g., 03:00 local time)
 */
export async function cleanupExpiredTrash(rootPath: string): Promise<{
  checked: number;
  purged: number;
  errors: Array<{ trashId: string; error: string }>;
}> {
  const itemsDir = getTrashItemsDir(rootPath);
  const now = new Date();
  const errors: Array<{ trashId: string; error: string }> = [];
  let checked = 0;
  let purged = 0;

  try {
    const entries = await fs.readdir(itemsDir, { withFileTypes: true });

    for (const entry of entries) {
      if (!entry.isDirectory()) continue;
      
      checked++;
      const trashId = entry.name;
      const manifestPath = getTrashItemManifestPath(rootPath, trashId);

      try {
        const text = await fs.readFile(manifestPath, 'utf-8');
        const manifest = JSON.parse(text);
        
        if (!manifest.purgeAfter) continue;

        const purgeAfterDate = new Date(manifest.purgeAfter);
        
        if (purgeAfterDate <= now) {
          // Item has expired, purge it
          const success = await purgeTrashItem({ rootPath, trashId });
          if (success) {
            purged++;
          } else {
            errors.push({
              trashId,
              error: 'Purge returned false (item may not exist)',
            });
          }
        }
      } catch (err: any) {
        errors.push({
          trashId,
          error: err?.message ?? String(err),
        });
      }
    }
  } catch (err: any) {
    // Trash items directory doesn't exist or can't be read
    if (err && err.code !== 'ENOENT') {
      throw err;
    }
  }

  return { checked, purged, errors };
}

/**
 * Schedule daily trash cleanup at a specific time (HH:mm format, local time)
 * Returns a cleanup function to stop the scheduled task
 */
export function scheduleDailyCleanup(
  rootPath: string,
  timeString: string = '03:00',
  onCleanup?: (result: { checked: number; purged: number; errors: any[] }) => void
): () => void {
  const [hours, minutes] = timeString.split(':').map(Number);

  if (isNaN(hours) || isNaN(minutes) || hours < 0 || hours > 23 || minutes < 0 || minutes > 59) {
    throw new Error(`Invalid time format: ${timeString}. Expected HH:mm in 24-hour format.`);
  }

  function getNextScheduledTime(): Date {
    const now = new Date();
    const scheduled = new Date(
      now.getFullYear(),
      now.getMonth(),
      now.getDate(),
      hours,
      minutes,
      0,
      0
    );

    // If scheduled time already passed today, schedule for tomorrow
    if (scheduled <= now) {
      scheduled.setDate(scheduled.getDate() + 1);
    }

    return scheduled;
  }

  let timeoutId: NodeJS.Timeout | null = null;

  function scheduleNext() {
    if (timeoutId !== null) {
      clearTimeout(timeoutId);
    }

    const nextTime = getNextScheduledTime();
    const delay = nextTime.getTime() - Date.now();

    timeoutId = setTimeout(async () => {
      try {
        const result = await cleanupExpiredTrash(rootPath);
        onCleanup?.(result);
      } catch (error) {
        console.error('Daily trash cleanup failed:', error);
      }
      // Schedule next run
      scheduleNext();
    }, delay);
  }

  scheduleNext();

  // Return cleanup function
  return () => {
    if (timeoutId !== null) {
      clearTimeout(timeoutId);
      timeoutId = null;
    }
  };
}

// src/services/logService.ts

import { getCache, setCache } from './cache';
import { CareLog } from '../models/log';
import { v4 as uuidv4 } from 'uuid';

const PENDING_LOGS_KEY = 'pending_logs';

/**
 * Save a log offline (always cached, marked pending).
 */
export async function saveLogOffline(log: Omit<CareLog, 'id' | 'source'>) {
  const pending: CareLog[] = (await getCache<CareLog[]>(PENDING_LOGS_KEY)) || [];
  const newLog: CareLog = {
    ...log,
    id: uuidv4(),
    source: 'explicit',
  };
  pending.push(newLog);
  await setCache(PENDING_LOGS_KEY, pending);
  return newLog;
}

/**
 * Retrieve all pending (unsynced) logs from cache.
 */
export async function getPendingLogs(): Promise<CareLog[]> {
  return (await getCache<CareLog[]>(PENDING_LOGS_KEY)) || [];
}

/**
 * Attempt to sync pending logs with the backend.
 * On success, remove successfully synced logs from cache.
 */
export async function syncPendingLogs() {
  const pending = await getPendingLogs();
  if (!pending.length) return;

  const stillPending: CareLog[] = [];

  for (const log of pending) {
    try {
      const response = await fetch('https://api.aurora-baby.com/care-logs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(log),
      });
      if (!response.ok) throw new Error('Network response not ok');
      // If successful, do nothing (log is removed from pending)
    } catch {
      stillPending.push(log);
    }
  }

  // Overwrite cache with any logs that failed to sync
  await setCache(PENDING_LOGS_KEY, stillPending);
}

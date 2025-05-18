//src/services/QuickLogAccess.ts
import { QuickLogEntry, QuickLogType } from '../models/QuickLogSchema';
import { 
  getAllQuickLogEntries, 
  saveFutureLogEntry, 
  getAllFutureLogEntries,
  removeQuickLogEntry
 } from '../storage/QuickLogStorage';
import { quickLogEmitter } from '../storage/QuickLogEvents';

/**
 * Exactly the storage call, but renamed so tests can mock it directly.
 */
export const getAllEntries = getAllQuickLogEntries;

/**
 * Returns all QuickLog entries of a given type (e.g., 'sleep', 'feeding').
 */
export const getLogsByType = async (
  type: QuickLogType
): Promise<QuickLogEntry[]> => {
  const all = await getAllEntries();
  return all.filter((entry) => entry.type === type);
};

export const getLogsGroupedByDate = async (): Promise<
  Record<string, QuickLogEntry[]>
> => {
  const all = await getAllEntries();
  return all.reduce((acc, entry) => {
    const dateKey = entry.timestamp.slice(0, 10); // YYYY-MM-DD
    if (!acc[dateKey]) {
      acc[dateKey] = [];
    }
    acc[dateKey].push(entry);
    return acc;
  }, {} as Record<string, QuickLogEntry[]>);
};

export const getLatestLog = async (
  type: QuickLogType
): Promise<QuickLogEntry | null> => {
  const logs = await getLogsByType(type);
  if (logs.length === 0) return null;
  return logs.reduce((latest, entry) =>
    entry.timestamp > latest.timestamp ? entry : latest
  );
};

export const getLogsBetween = async (
  start: string,
  end: string
): Promise<QuickLogEntry[]> => {
  const all = await getAllEntries();
  return all.filter(
    (entry) => entry.timestamp >= start && entry.timestamp <= end
  );
};

/**
 * Delete one quick-log entry by id.
 */
export async function deleteLogEntry(id: string): Promise<void> {
  await removeQuickLogEntry(id);
  console.debug('[QuickLogAccess] deleteLogEntry:', id)
}

/**
 * Persist AI-generated “future” logs:
 * here you could AsyncStorage them under a different key, etc.
 * For now we just re-emit them so screens can listen.
 */
export async function saveFutureEntries(entries: QuickLogEntry[]): Promise<void> {
  // TODO: persist to storage
  entries.forEach((e) => quickLogEmitter.emit('future-saved', e));
}

/** Load any already-saved future entries. */
export async function getFutureEntries(): Promise<QuickLogEntry[]> {
  // TODO: read from your “future” storage key
  return []; 
}



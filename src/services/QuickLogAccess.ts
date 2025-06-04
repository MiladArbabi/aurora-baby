// src/services/QuickLogAccess.ts
import AsyncStorage from '@react-native-async-storage/async-storage';
import { QuickLogEntry } from '../models/QuickLogSchema';
import { quickLogEmitter } from '../storage/QuickLogEvents';

const FUTURE_LOGS_KEY = '@future_logs';

/** Load any already-saved future entries. */
export async function getFutureEntries(): Promise<QuickLogEntry[]> {
  const raw = await AsyncStorage.getItem(FUTURE_LOGS_KEY);
  if (!raw) return [];
  try {
    return JSON.parse(raw) as QuickLogEntry[];
  } catch {
    console.error('[QuickLogAccess] getFutureEntries: JSON.parse error');
    return [];
  }
}

/** Persist AI-generated “future” logs: append all new entries to existing array. */
export async function saveFutureEntries(entries: QuickLogEntry[]): Promise<void> {
  // 1) load old array (if any)
  const raw = await AsyncStorage.getItem(FUTURE_LOGS_KEY);
  let existing: QuickLogEntry[] = [];
  if (raw) {
    try {
      existing = JSON.parse(raw) as QuickLogEntry[];
    } catch {
      existing = [];
    }
  }
  // 2) merge new  existing
  const merged = [...entries, ...existing];
  // 3) write back
  try {
    await AsyncStorage.setItem(FUTURE_LOGS_KEY, JSON.stringify(merged));
  } catch (err) {
    console.error('[QuickLogAccess] saveFutureEntries failed:', err);
    throw err;
  }
}

/** Fetch “real” logs between two timestamps. (Unchanged from previous.) */
import { getAllQuickLogEntries } from '../storage/QuickLogStorage';
export async function getLogsBetween(
  start: string,
  end: string
): Promise<QuickLogEntry[]> {
  const all = await getAllQuickLogEntries();
  return all.filter(e => e.timestamp >= start && e.timestamp <= end);
}

export async function deleteLogEntry(entry: QuickLogEntry): Promise<void> {
  const all = await getAllQuickLogEntries();
  const updated = all.filter((e) => e.id !== entry.id);
  await AsyncStorage.setItem(
    '@quicklog_entries',
    JSON.stringify(updated)
  );
  // Emit an event if needed
  quickLogEmitter.emit('deleted', entry);
}

/**
 * Remove exactly one “future” entry, by id.
 * You’ll call this when deleting from the future‐logs list.
 */
export async function deleteFutureEntry(id: string): Promise<void> {
    // 1) load existing future logs
    const raw = await AsyncStorage.getItem(FUTURE_LOGS_KEY);
    let existing: QuickLogEntry[] = [];
    if (raw) {
      try {
        existing = JSON.parse(raw);
      } catch {
        existing = [];
      }
    }
    // 2) filter out the one with matching id
    const updated = existing.filter((e) => e.id !== id);
    // 3) write back
    await AsyncStorage.setItem(FUTURE_LOGS_KEY, JSON.stringify(updated));
    // 4) emit a future‐deleted event if desired (we’ll handle locally in CareScreen)
    quickLogEmitter.emit('future-deleted', { id });
  }

//src/storage/QuickLogStorage.ts
import AsyncStorage from '@react-native-async-storage/async-storage';
import { z } from 'zod';
import { QuickLogEntrySchema, QuickLogEntry } from '../models/QuickLogSchema';
import { quickLogEmitter } from './QuickLogEvents';

const STORAGE_KEY = '@quicklog_entries';
const OFFLINE_QUEUE_KEY = '@quicklog_offline_queue';
const FUTURE_KEY = '@future_quicklog_entries';

/**
 * Save a new QuickLog entry to AsyncStorage.
 */
export const saveQuickLogEntry = async (entry: QuickLogEntry): Promise<void> => {
  // Validate entry
  QuickLogEntrySchema.parse(entry);
  const existing = await getAllQuickLogEntries();
  const updated = [...existing, entry];
  await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  
  // **after** persisting:
  quickLogEmitter.emit('saved', entry);
};

/**
 * Get all QuickLog entries from AsyncStorage.
 */
export const getAllQuickLogEntries = async (): Promise<QuickLogEntry[]> => {
  const data = await AsyncStorage.getItem(STORAGE_KEY);
  if (!data) return [];

  const parsed = JSON.parse(data);

  // Validate entire array
  const EntriesArraySchema = z.array(QuickLogEntrySchema);
  return EntriesArraySchema.parse(parsed);
};

/**
 * Clear all QuickLog entries — for dev/debug only.
 */
export const clearQuickLogEntries = async (): Promise<void> => {
  await AsyncStorage.removeItem(STORAGE_KEY);
};

/**
 * Enqueue a QuickLog entry for later syncing.
 */
export const queueLogOffline = async (entry: QuickLogEntry): Promise<void> => {
  // 1. pull down whatever is already waiting
  const raw = await AsyncStorage.getItem(OFFLINE_QUEUE_KEY);
  const current: QuickLogEntry[] = raw ? JSON.parse(raw) : [];

  // 2. add the new entry
  const updated = [...current, entry];

  // 3. persist back
  await AsyncStorage.setItem(OFFLINE_QUEUE_KEY, JSON.stringify(updated));
};

/**
 * Read the entire offline-queue.
 */
export const getOfflineQueue = async (): Promise<QuickLogEntry[]> => {
  const raw = await AsyncStorage.getItem(OFFLINE_QUEUE_KEY);
  if (!raw) return [];
  return JSON.parse(raw);
};

/**
 * Remove all queued entries (after successful sync).
 */
export const clearOfflineQueue = async (): Promise<void> => {
  await AsyncStorage.removeItem(OFFLINE_QUEUE_KEY);
};

/**
 * Replay every offline-queued log via the provided send function,
 * then clear the queue.
 */
export const syncQueuedLogs = async (
  sendFunc: (entry: QuickLogEntry) => Promise<any>
): Promise<void> => {
  // 1. fetch the current backlog
  const queued = await getOfflineQueue();
  // 2. send each one sequentially
  for (const log of queued) {
    await sendFunc(log);
  }
  // 3. clear the queue once all have gone out
  await clearOfflineQueue();
};

/**
+ * Remove one QuickLog entry by id.
+ */
export const removeQuickLogEntry = async (id: string): Promise<void> => {
  const existing = await getAllQuickLogEntries();
  const filtered = existing.filter(e => e.id !== id);
  await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(filtered));
  quickLogEmitter.emit('deleted', id);
  };

export const saveFutureLogEntry = async (entry: QuickLogEntry) => {
  const all = await getAllFutureLogEntries();
  await AsyncStorage.setItem(FUTURE_KEY, JSON.stringify([...all, entry]));
};

export const getAllFutureLogEntries = async (): Promise<QuickLogEntry[]> => {
  const raw = await AsyncStorage.getItem(FUTURE_KEY);
  return raw ? JSON.parse(raw) : [];
};

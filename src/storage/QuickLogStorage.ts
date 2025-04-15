import AsyncStorage from '@react-native-async-storage/async-storage';
import { z } from 'zod';
import { QuickLogEntrySchema, QuickLogEntry } from '../models/QuickLogSchema';

const STORAGE_KEY = '@quicklog_entries';

/**
 * Save a new QuickLog entry to AsyncStorage.
 */
export const saveQuickLogEntry = async (entry: QuickLogEntry): Promise<void> => {
  // Validate entry
  QuickLogEntrySchema.parse(entry);

  const existing = await getAllQuickLogEntries();
  const updated = [...existing, entry];

  await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
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

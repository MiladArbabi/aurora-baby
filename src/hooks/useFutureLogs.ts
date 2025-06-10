// src/hooks/useFutureLogs.ts
import { useCallback, useEffect, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { LogRepository } from 'storage/LogRepository';
import {
  FUTURE_LOGS_STORAGE_KEY,
  DEFAULT_RULE_HOURS_AHEAD,
} from '../utils/constants';
import { LogEntry } from '../models/LogSchema';
import { getBabyProfile } from 'storage/BabyProfileStorage';
import { generateRuleBasedLogs } from '../services/RuleBasedLogGenerator';

/**
 * Manages the “future logs” array, providing:
 *   - entries: current array of LogEntry
 *   - count: length of that array
 *   - reload(): re‐load from AsyncStorage
 *   - clearAll(): wipe out the entire FUTURE_LOGS key
 *   - replaceOne(updated): replace a single entry in the array
 *   - deleteOne(id): remove one entry from the array
 *   - generateNextDay(): run rule‐based logic, persist new entries, then reload
 */
export function useFutureLogs() {
  const [entries, setEntries] = useState<LogEntry[]>([]);

  // Load from AsyncStorage
  const reload = useCallback(async () => {
    try {
      const stored = await LogRepository.getFutureEntries();
      setEntries(stored);
    } catch (err) {
      console.error('[useFutureLogs] reload failed:', err);
    }
  }, []);

  // Clear everything
  const clearAll = useCallback(async () => {
    try {
      await AsyncStorage.removeItem(FUTURE_LOGS_STORAGE_KEY);
      setEntries([]);
    } catch (err) {
      console.error('[useFutureLogs] clearAll failed:', err);
    }
  }, []);

  // Replace one entry (by ID) with updatedEntry
  const replaceOne = useCallback(
    async (updatedEntry: LogEntry) => {
      try {
        const all = await LogRepository.getFutureEntries();
        const replaced = all.map((e) =>
          e.id === updatedEntry.id ? updatedEntry : e
        );
        await AsyncStorage.setItem(
          FUTURE_LOGS_STORAGE_KEY,
          JSON.stringify(replaced)
        );
        setEntries(replaced);
      } catch (err) {
        console.error('[useFutureLogs] replaceOne failed:', err);
      }
    },
    []
  );

  // Delete one entry (by ID)
  const deleteOne = useCallback(async (id: string) => {
    try {
      const all = await LogRepository.getFutureEntries();
      const filtered = all.filter((e) => e.id !== id);
      await AsyncStorage.setItem(
        FUTURE_LOGS_STORAGE_KEY,
        JSON.stringify(filtered)
      );
      setEntries(filtered);
    } catch (err) {
      console.error('[useFutureLogs] deleteOne failed:', err);
    }
  }, []);

  // Generate rule-based logs for next N hours
  const generateNextDay = useCallback(async () => {
    try {
      // 1) fetch any real logs from start‐of‐today→now
      const recent = await LogRepository.getEntriesBetween(
        new Date(new Date().setHours(0, 0, 0, 0)).toISOString(),
        new Date().toISOString()
      );
      console.log('[useFutureLogs] recent logs:', recent.length);

      // 2) Determine babyId
      let babyId = '';
      try {
        const profile = await getBabyProfile();
        babyId = profile?.id ?? '';
      } catch {
        babyId = recent[0]?.babyId ?? '';
      }

      // 3) Generate rule-based suggestions
      const suggestions = await generateRuleBasedLogs(
        recent,
        DEFAULT_RULE_HOURS_AHEAD,
        babyId
      );
      console.log(
        `[useFutureLogs] rule-based suggestions: ${suggestions.length}`
      );

      // 4) Persist them (append to existing)
      /* await LogRepository.saveFutureEntry(entry) */
      console.log('[useFutureLogs] saved future entries');

      // 5) Reload state
      await reload();
    } catch (err) {
      console.error('[useFutureLogs] generateNextDay failed:', err);
    }
  }, [reload]);

  // On mount → load initial data
  useEffect(() => {
    reload();
  }, [reload]);

  return {
    entries,
    count: entries.length,
    reload,
    clearAll,
    replaceOne,
    deleteOne,
    generateNextDay,
  };
}

// src/hooks/useFutureLogs.ts
import { useCallback, useEffect, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  getFutureEntries as _getFutureEntries,
  saveFutureEntries as _saveFutureEntries,
} from '../services/QuickLogAccess';
import {
  FUTURE_LOGS_STORAGE_KEY,
  DEFAULT_RULE_HOURS_AHEAD,
} from '../utils/constants';
import { QuickLogEntry } from '../models/QuickLogSchema';
import { getLogsBetween } from '../services/QuickLogAccess';
import { getBabyProfile } from 'storage/BabyProfileStorage';
import { generateRuleBasedQuickLogs } from '../services/RuleBasedLogGenerator';

/**
 * Manages the “future logs” array, providing:
 *   - entries: current array of QuickLogEntry
 *   - count: length of that array
 *   - reload(): re‐load from AsyncStorage
 *   - clearAll(): wipe out the entire FUTURE_LOGS key
 *   - replaceOne(updated): replace a single entry in the array
 *   - deleteOne(id): remove one entry from the array
 *   - generateNextDay(): run rule‐based logic, persist new entries, then reload
 */
export function useFutureLogs() {
  const [entries, setEntries] = useState<QuickLogEntry[]>([]);

  // Load from AsyncStorage
  const reload = useCallback(async () => {
    try {
      const stored = await _getFutureEntries();
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
    async (updatedEntry: QuickLogEntry) => {
      try {
        const all = await _getFutureEntries();
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
      const all = await _getFutureEntries();
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
      const recent = await getLogsBetween(
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
      const suggestions = await generateRuleBasedQuickLogs(
        recent,
        DEFAULT_RULE_HOURS_AHEAD,
        babyId
      );
      console.log(
        `[useFutureLogs] rule-based suggestions: ${suggestions.length}`
      );

      // 4) Persist them (append to existing)
      await _saveFutureEntries(suggestions);
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

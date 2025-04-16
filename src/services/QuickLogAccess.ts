// src/services/QuickLogAccess.ts
import { QuickLogEntry, QuickLogType } from '../models/QuickLogSchema';
import { getAllQuickLogEntries } from '../storage/QuickLogStorage';

/**
 * Returns all QuickLog entries of a given type (e.g., 'sleep', 'feeding').
 */
export const getLogsByType = async (type: QuickLogType): Promise<QuickLogEntry[]> => {
  const all = await getAllQuickLogEntries();
  return all.filter((entry) => entry.type === type);
};

export const getLogsGroupedByDate = async (): Promise<Record<string, QuickLogEntry[]>> => {
    const all = await getAllQuickLogEntries();
  
    return all.reduce((acc, entry) => {
      const dateKey = entry.timestamp.slice(0, 10); // YYYY-MM-DD
      if (!acc[dateKey]) {
        acc[dateKey] = [];
      }
      acc[dateKey].push(entry);
      return acc;
    }, {} as Record<string, QuickLogEntry[]>);
  };

  export const getLatestLog = async (type: QuickLogType): Promise<QuickLogEntry | null> => {
    const logs = await getLogsByType(type);
    if (logs.length === 0) return null;
    return logs.reduce((latest, entry) =>
      entry.timestamp > latest.timestamp ? entry : latest
    );
  };

  export const getLogsBetween = async (start: string, end: string): Promise<QuickLogEntry[]> => {
    const all = await getAllQuickLogEntries();
    return all.filter((entry) => entry.timestamp >= start && entry.timestamp <= end);
  };
  
// src/services/EndOfDayExportService.ts
import AsyncStorage from '@react-native-async-storage/async-storage';
import { format } from 'date-fns';
import { CareLogEntry } from '../models/CareLogEntry'; // adjust path if needed

/**
 * Returns all care‐log entries for a given ISO date string (e.g. "2023-08-25").
 * We assume your existing logs are stored in AsyncStorage under "@care_logs" as a JSON array.
 */
export async function getLogsForDate(dateIso: string): Promise<CareLogEntry[]> {
  const raw = await AsyncStorage.getItem('@care_logs');
  if (!raw) return [];
  try {
    const all: CareLogEntry[] = JSON.parse(raw);
    return all.filter((entry) => entry.date.startsWith(dateIso));
  } catch {
    return [];
  }
}

/**
 * Given an array of CareLogEntry, format a simple CSV string.
 * You can extend this to include whichever fields you need.
 */
export function formatLogsAsCsv(logs: CareLogEntry[]): string {
  const header = ['Time','Type','Details'];
  const rows = logs.map((log) => {
    const time = format(new Date(log.timestamp), 'HH:mm');
    return [time, log.type, JSON.stringify(log.payload || '')];
  });
  const csvLines = [header.join(','), ...rows.map((r) => r.join(','))];
  return csvLines.join('\n');
}

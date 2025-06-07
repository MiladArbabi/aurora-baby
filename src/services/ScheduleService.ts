// src/services/ScheduleService.ts
import { LogSlice } from '../models/LogSlice';
import { DailyScheduleEngine } from '../services/DailyScheduleEngine';
import {
  getDailySchedule,
  saveDailySchedule,
} from '../storage/ScheduleStorage';

/**
 * If a schedule already exists for (babyId, dateISO), returns it.
 * Otherwise, generates a new one via DailyScheduleEngine and saves it.
 */
export async function ensureScheduleForDate(
  babyId: string,
  dateISO: string // e.g. "2025-06-05"
): Promise<LogSlice[]> {
  // 1) Try to load an existing schedule
  const existing = await getDailySchedule(dateISO, babyId);
  if (existing) {
    return existing;
  }

  // 2) None found → generate via the engine
  const generated: LogSlice[] = DailyScheduleEngine.generateScheduleForDate({
    babyId,
    date: dateISO,
  });

  // 3) Persist it for future use
  await saveDailySchedule(dateISO, babyId, generated);

  // 4) Return the newly created array
  return generated;
}

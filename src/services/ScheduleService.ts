// src/services/ScheduleService.ts
import { LogSlice } from '../models/LogSlice';
import {
  getDailySchedule,
  saveDailySchedule,
} from '../storage/ScheduleStorage';
import { DefaultScheduleGenerator } from './DefaultScheduleGenerator'
import { DEFAULT_TEMPLATE }         from '../config/defaultScheduleTemplates'


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
  const generated = DefaultScheduleGenerator.generateFromTemplate({
    babyId,
    dateISO,
    template: DEFAULT_TEMPLATE
  })

  // 3) Persist it for future use
  await saveDailySchedule(dateISO, babyId, generated);

  // 4) Return the newly created array
  return generated;
}

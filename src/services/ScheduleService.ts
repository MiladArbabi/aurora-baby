// src/services/ScheduleService.ts
import { LogSlice } from '../models/LogSlice';
import {
  getDailySchedule,
  saveDailySchedule,
} from '../storage/ScheduleStorage';
import { DefaultScheduleGenerator } from './DefaultScheduleGenerator'
import { DEFAULT_TEMPLATE }         from '../config/defaultScheduleTemplates'
import { DailyScheduleEngine } from './DailyScheduleEngine'

/**
 * If a schedule already exists for (babyId, dateISO), returns it.
 * Otherwise, generates a new one via DailyScheduleEngine and saves it.
 */
export async function ensureScheduleForDate(
  babyId: string,
  dateISO: string // e.g. "2025-06-05"
): Promise<LogSlice[]> {
  // 1) Try to load an existing schedule
  console.log('[ScheduleService] ensureScheduleForDate', babyId, dateISO)
  const existing = await getDailySchedule(dateISO, babyId)
  if (existing) {
    console.log('[ScheduleService] found existing schedule:', existing)
    return existing
  }
  console.log('[ScheduleService] no existing → generating new')
  const generated = await DailyScheduleEngine.generateScheduleForDate({ babyId, date: dateISO })
  await saveDailySchedule(dateISO, babyId, generated)
  console.log('[ScheduleService] saved new schedule')
  return generated
}

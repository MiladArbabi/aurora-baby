// src/services/ScheduleService.ts
import { IScheduleStorage, IDailyScheduleEngine } from '../types/ScheduleTypes';
import { LogSlice } from '../models/LogSlice';
import { DailyScheduleEngine }   from './DailyScheduleEngine'
import * as ScheduleStorage from '../storage/ScheduleStorage'

export class ScheduleService {
  constructor(
    private storage: IScheduleStorage,
    private engine: IDailyScheduleEngine
  ) {}

  async ensureScheduleForDate(
    babyId: string,
    dateISO: string
  ): Promise<LogSlice[]> {
    console.log('[ScheduleService] ensureScheduleForDate', babyId, dateISO);
    const existing = await this.storage.getDailySchedule(dateISO, babyId);
    if (existing) {
      console.log('[ScheduleService] found existing schedule');
      return existing;
    }
    console.log('[ScheduleService] no existing → generating new');
    const generated = await this.engine.generateScheduleForDate({ babyId, date: dateISO });
    await this.storage.saveDailySchedule(dateISO, babyId, generated);
    console.log('[ScheduleService] saved new schedule');
    return generated;
  }
}


export const scheduleService = new ScheduleService(
    ScheduleStorage,
    DailyScheduleEngine
  )
  
  // backwards-compatible free function:
  export const ensureScheduleForDate = scheduleService.ensureScheduleForDate.bind(
    scheduleService
  )

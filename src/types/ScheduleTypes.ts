// src/types/ScheduleTypes.ts
// src/types/ScheduleTypes.ts
import { LogSlice } from '../models/LogSlice';

export interface IScheduleStorage {
  getDailySchedule(dateISO: string, babyId: string): Promise<LogSlice[] | null>;
  saveDailySchedule(dateISO: string, babyId: string, schedule: LogSlice[]): Promise<void>;
}

export interface IDailyScheduleEngine {
  generateScheduleForDate(opts: { babyId: string; date: string }): Promise<LogSlice[]>;
}

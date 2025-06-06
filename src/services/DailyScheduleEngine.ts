// src/services/DailyScheduleEngine.ts
import type { LogSlice } from '../models/LogSlice'

export class DailyScheduleEngine {
  static generateScheduleForDate({
    babyId,
    date,
  }: {
    babyId: string
    date: string // ISO string like "2025-06-05"
  }): LogSlice[] {
    // TODO: Pull BabyProfile
    // TODO: Run rules engine or fallback to defaults
    // TODO: Optionally inject AI personalizations
    // For now, return hardcoded mock for structure

    const now = new Date()
    const startOfDay = new Date(date)
    startOfDay.setHours(8, 0, 0, 0)

    return [
      {
        id: 'slice-1',
        babyId,
        category: 'sleep',
        startTime: startOfDay.toISOString(),
        endTime: new Date(startOfDay.getTime() + 2 * 60 * 60 * 1000).toISOString(), // +2h
        createdAt: now.toISOString(),
        updatedAt: now.toISOString(),
      },
      {
        id: 'slice-2',
        babyId,
        category: 'feed',
        startTime: new Date(startOfDay.getTime() + 2 * 60 * 60 * 1000).toISOString(),
        endTime: new Date(startOfDay.getTime() + 2.5 * 60 * 60 * 1000).toISOString(), // +30m
        createdAt: now.toISOString(),
        updatedAt: now.toISOString(),
      },
    ]
  }
}

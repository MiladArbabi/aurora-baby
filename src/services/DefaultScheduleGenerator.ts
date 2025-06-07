// src/services/DefaultScheduleGenerator.ts
import { v4 as uuidv4 } from 'uuid'
import type { ScheduleTemplate } from '../models/ScheduleTemplate'
import type { LogSlice } from '../models/LogSlice'

export class DefaultScheduleGenerator {
  /**
   * Turn a ScheduleTemplate into concrete LogSlice objects for a given date.
   */
  static generateFromTemplate({
    babyId,
    dateISO,
    template,
  }: {
    babyId: string
    dateISO: string // "2025-06-05"
    template: ScheduleTemplate
  }): LogSlice[] {
    const now = new Date().toISOString()
    return template.entries.map(entry => {
      const pad = (n: number) => n.toString().padStart(2, '0')
      const startTime = `${dateISO}T${pad(entry.startHour)}:00:00.000Z`
      const endTime   = `${dateISO}T${pad(entry.endHour)}:00:00.000Z`
      return {
        id: uuidv4(),
        babyId,
        category: entry.category,
        startTime,
        endTime,
        createdAt: now,
        updatedAt: now,
        version: 1, 
      }
    })
  }
}

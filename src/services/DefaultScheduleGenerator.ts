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
      const formatTime = (h: number) => {
        const hours   = Math.floor(h)
        const minutes = Math.round((h - hours) * 60)
        const pad2 = (n: number) => n.toString().padStart(2, '0')
            return `${pad2(hours)}:${pad2(minutes)}:00.000`
        }
      // Convert entry start/end hours to ISO time strings
        const startTime = `${dateISO}T${formatTime(entry.startHour)}`
        const endTime   = `${dateISO}T${formatTime(entry.endHour)}`
      // Create the LogSlice object
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

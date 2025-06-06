// src/services/ScheduleAutoRegenerator.ts

import { DailyScheduleEngine } from './DailyScheduleEngine'
import { saveDailyScheduleIfMissing } from '../storage/ScheduleStorage'

export class ScheduleAutoRegenerator {
  static startMidnightWatcher(babyId: string) {
    const now = new Date()
    const nextMidnight = new Date(now)
    nextMidnight.setHours(24, 0, 0, 0)
    const msUntilMidnight = nextMidnight.getTime() - now.getTime()

    setTimeout(async () => {
      const todayISO = new Date().toISOString().split('T')[0]
      const newSlices = DailyScheduleEngine.generateScheduleForDate({
        babyId,
        date: todayISO,
      })
      await saveDailyScheduleIfMissing(todayISO, babyId, newSlices)
    }, msUntilMidnight)
  }
}

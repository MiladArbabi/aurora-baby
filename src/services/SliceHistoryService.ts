// src/services/SliceHistoryService.ts

import type { LogSlice } from '../models/LogSlice'
import { getAllSchedulesForBabyInRange } from '../storage/ScheduleStorage'
import dayjs from 'dayjs'

/**
 * Given a set of slices, returns total duration (in minutes) per category.
 */
function accumulateDurations(
  allSlices: LogSlice[]
): Record<LogSlice['category'], number> {
  const totals: Record<LogSlice['category'], number> = {
    sleep:  0,
    awake:  0,
    diaper: 0,
    feed:   0,
    care:   0,
    talk:   0,
    other:  0,
  }

  allSlices.forEach(slice => {
    const startMs = new Date(slice.startTime).getTime()
    const endMs   = new Date(slice.endTime).getTime()
    const durationMin = endMs > startMs
      ? Math.round((endMs - startMs) / 60000)
      : 0

    totals[slice.category] += durationMin
  })

  return totals
}

/**
 * Fetches all slices for the date range and returns a map
 * { category: totalMinutesAcrossAllDays }.
 */
export async function getTotalDurationByCategory(
  babyId: string,
  startDate: string,
  endDate: string
): Promise<Record<LogSlice['category'], number>> {
  const schedules = await getAllSchedulesForBabyInRange(babyId, startDate, endDate)
  const allSlices: LogSlice[] = Object.values(schedules).flat()
  return accumulateDurations(allSlices)
}

/**
 * Computes the average daily duration (in minutes) spent in each category
 * over the specified date range. The date range is inclusive.
 */
export async function getAverageDailyDurationByCategory(
  babyId: string,
  startDate: string,
  endDate: string
): Promise<Record<LogSlice['category'], number>> {
  // 1) Count the number of days in the range (inclusive)
  const start = dayjs(startDate, 'YYYY-MM-DD')
  const end   = dayjs(endDate,   'YYYY-MM-DD')
  const dayCount = end.diff(start, 'day') + 1

  // 2) Get total durations across that range
  const totals = await getTotalDurationByCategory(babyId, startDate, endDate)

  // 3) Build an “averages” record and then divide each total by dayCount.
  const averages: Record<LogSlice['category'], number> = {
    sleep:  0,
    awake:  0,
    diaper: 0,
    feed:   0,
    care:   0,
    talk:   0,
    other:  0,
  }

  // ←—— **Notice the semicolon here** — we must end the declaration before calling .forEach
  ;(Object.keys(totals) as Array<LogSlice['category']>).forEach((cat: LogSlice['category']) => {
    averages[cat] = Math.round(totals[cat] / dayCount)
  })

  return averages
}

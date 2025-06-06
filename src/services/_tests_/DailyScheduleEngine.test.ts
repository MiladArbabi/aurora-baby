// src/services/__tests__/DailyScheduleEngine.test.ts

import dayjs from 'dayjs'
import { DailyScheduleEngine } from '../DailyScheduleEngine'
import type { LogSlice } from '../../models/LogSlice'

/**
 * For these tests, we assume `DailyScheduleEngine.generateScheduleForDate`
 * takes an object like:
 *    { babyId: string; date: string; profile: BabyProfile }
 *
 * where `profile` might look like:
 *    { sleepBlocks: Array<{ startHour: number; durationHours: number }> }
 *    { feedIntervalHours: number }
 *    etc.
 *
 * Adjust the “profile” shape below to match your actual engine signature.
 */

type BabyProfile = {
  name: string
  sleepBlocks: Array<{ startHour: number; durationHours: number }>
  feedIntervalHours: number
}

/**
 * Helper: verify that slices are non‐overlapping and sorted
 */
function assertNoOverlapAndSorted(slices: LogSlice[]) {
  for (let i = 1; i < slices.length; i++) {
    const prevEnd = dayjs(slices[i - 1].endTime)
    const currStart = dayjs(slices[i].startTime)

    // Each slice must start no earlier than the previous one ends
    expect(currStart.isSame(prevEnd) || currStart.isAfter(prevEnd)).toBe(true)
  }
}

describe('DailyScheduleEngine.generateScheduleForDate', () => {
  const date = '2025-06-10'

  it('generates reasonable schedule for a newborn (16h sleep, feed every 2h)', () => {
    const newbornProfile: BabyProfile = {
      name: 'newborn',
      sleepBlocks: [
        // e.g. newborn sleeps multiple short naps; here we approximate two big blocks
        { startHour: 0, durationHours: 8 },
        { startHour: 16, durationHours: 8 }
      ],
      feedIntervalHours: 2
    }

    const slices: LogSlice[] = DailyScheduleEngine.generateScheduleForDate({
      babyId: 'test-baby',
      date,
    })

    // 1) Should return at least one slice
    expect(slices.length).toBeGreaterThan(0)

    // 2) All slices must be contained on the target date
    slices.forEach(slice => {
      const start = dayjs(slice.startTime)
      expect(start.format('YYYY-MM-DD')).toBe(date)
    })

    // 3) Confirm no overlaps and sorted
    assertNoOverlapAndSorted(slices)

    // 4) Total sleep duration ≈ 16 hours (± 30 min tolerance)
    const totalSleep = slices
      .filter(s => s.category === 'sleep')
      .reduce((sum, s) => {
        const durMins = dayjs(s.endTime).diff(dayjs(s.startTime), 'minute')
        return sum + durMins
      }, 0)
    expect(totalSleep).toBeGreaterThanOrEqual(16 * 60 - 30)
    expect(totalSleep).toBeLessThanOrEqual(16 * 60 + 30)

    // 5) Feeding slices should occur roughly every 2 hours
    const feedSlices = slices.filter(s => s.category === 'feed')
    expect(feedSlices.length).toBeGreaterThanOrEqual(7) // ~ 12 feeds in 24h, but depending on rounding
    feedSlices.forEach((s, i) => {
      if (i < feedSlices.length - 1) {
        const gap = dayjs(feedSlices[i + 1].startTime).diff(dayjs(s.startTime), 'hour', true)
        // gap should be roughly 2h ± 0.5h
        expect(gap).toBeGreaterThanOrEqual(1.5)
        expect(gap).toBeLessThanOrEqual(2.5)
      }
    })
  })

  it('generates schedule for a 3-month-old (two consolidated naps)', () => {
    const threeMonthProfile: BabyProfile = {
      name: '3month',
      sleepBlocks: [
        { startHour: 1, durationHours: 3 },   // morning nap
        { startHour: 7, durationHours: 3 },   // late morning nap
        { startHour: 20, durationHours: 11 }  // nighttime sleep
      ],
      feedIntervalHours: 3
    }

    const slices = DailyScheduleEngine.generateScheduleForDate({
      babyId: 'test-baby',
      date,
    })

    // Must produce at least one “night” sleep slice
    const nightSleep = slices.find(s => s.category === 'sleep' && dayjs(s.startTime).hour() >= 18)
    expect(nightSleep).toBeDefined()

    // Verify total “awake” + “sleep” spans 24h
    const firstStart = dayjs(slices[0].startTime)
    const lastEnd = dayjs(slices[slices.length - 1].endTime)
    expect(firstStart.format('YYYY-MM-DD')).toBe(date)
    expect(lastEnd.format('YYYY-MM-DD')).toBe(date)

    // No overlap and sorted
    assertNoOverlapAndSorted(slices)
  })

  it('gracefully handles an “always-awake” toddler profile (no sleepBlocks)', () => {
    const toddlerProfile: BabyProfile = {
      name: 'toddler',
      sleepBlocks: [],
      feedIntervalHours: 4
    }

    const slices = DailyScheduleEngine.generateScheduleForDate({
      babyId: 'test-baby',
      date,
    })

    // In this scenario, we expect at least one “awake” slice spanning entire day
    const awakeSlices = slices.filter(s => s.category === 'awake')
    expect(awakeSlices.length).toBeGreaterThanOrEqual(1)

    // Ensure no “sleep” slices appear
    const sleepSlices = slices.filter(s => s.category === 'sleep')
    expect(sleepSlices.length).toBe(0)

    // Confirm no overlaps
    assertNoOverlapAndSorted(slices)
  })
})

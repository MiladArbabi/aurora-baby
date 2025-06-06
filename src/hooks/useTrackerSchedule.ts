// src/hooks/useTrackerSchedule.ts
import { useState, useEffect, useCallback } from 'react'
import { ensureScheduleForDate } from '../services/ScheduleService'
import type { LogSlice } from '../models/LogSlice'

/**
 * useTrackerSchedule
 *
 * A hook that returns the daily schedule (array of LogSlice)
 * for the given babyId and a boolean toggle for showing last 24h vs. today.
 * It also provides nowFrac (current time as a fraction of 24h).
 */
export function useTrackerSchedule(
  babyId: string,
  showLast24h: boolean = false
): {
  slices: LogSlice[]
  nowFrac: number
  loading: boolean
  error: Error | null
  refresh: () => Promise<void>
} {
  const [slices, setSlices] = useState<LogSlice[]>([])
  const [loading, setLoading] = useState<boolean>(true)
  const [error, setError] = useState<Error | null>(null)

  // Calculate "now" fraction of the day (0–1)
  const computeNowFrac = useCallback(() => {
    const now = new Date()
    const totalMinutes = now.getHours() * 60 + now.getMinutes() + now.getSeconds() / 60
    return totalMinutes / (24 * 60)
  }, [])

  const [nowFrac, setNowFrac] = useState<number>(computeNowFrac())

  const fetchSchedule = useCallback(async () => {
    setLoading(true)
    setError(null)

    try {
      const today = new Date()
      // If showing last 24h, compute "yesterday" date ISO
      let dateISO: string
      if (showLast24h) {
        const yesterday = new Date(today.getTime() - 24 * 60 * 60 * 1000)
        dateISO = yesterday.toISOString().split('T')[0]
      } else {
        dateISO = today.toISOString().split('T')[0]
      }

      const result = await ensureScheduleForDate(babyId, dateISO)
      setSlices(result)
    } catch (err: any) {
      setError(err)
    } finally {
      setLoading(false)
    }
  }, [babyId, showLast24h])

  // Fetch schedule when babyId or showLast24h changes
  useEffect(() => {
    fetchSchedule()
  }, [fetchSchedule])

  // Recompute nowFrac every minute
  useEffect(() => {
    const interval = setInterval(() => {
      setNowFrac(computeNowFrac())
    }, 60 * 1000)
    return () => clearInterval(interval)
  }, [computeNowFrac])

  const refresh = useCallback(async () => {
    await fetchSchedule()
  }, [fetchSchedule])

  return {
    slices,
    nowFrac,
    loading,
    error,
    refresh,
  }
}

// src/hooks/useInsightsData.ts
import { useTrackerData } from './useTrackerData'
import { QuickLogEntry } from '../models/QuickLogSchema'
import { useMemo } from 'react'

export function useInsightsData(showLast24h: boolean) {
  const { sleepSegments, eventMarkers } = useTrackerData(showLast24h)

  const byDate = useMemo(() => {
    const map = new Map<string, {
      sleep: number
      feeding: number
      diaper: number
      mood: Record<string,number>
    }>()

    // initialize last 7 days
    for (let i = 6; i >= 0; i--) {
      const d = new Date()
      d.setDate(d.getDate() - i)
      const key = d.toISOString().slice(0,10)  // YYYY-MM-DD
      map.set(key, { sleep: 0, feeding: 0, diaper: 0, mood: {} })
    }

    // accumulate sleep segments
    sleepSegments.forEach(s => {
      // reconstruct a full Date from fraction today
      const millis = s.startFraction * 24 * 60 * 60 * 1000
      const dayKey = new Date(millis).toISOString().slice(0,10)
      const bucket = map.get(dayKey)
      if (!bucket) return           // guard!
      bucket.sleep += (s.endFraction - s.startFraction) * 1440
    })

    // accumulate event markers
    eventMarkers.forEach(m => {
      const millis = m.fraction * 24 * 60 * 60 * 1000
      const dayKey = new Date(millis).toISOString().slice(0,10)
      const bucket = map.get(dayKey)
      if (!bucket) return           // guard!
      if (m.type === 'feeding') bucket.feeding++
      if (m.type === 'diaper')  bucket.diaper++
      if (m.type === 'mood') {
        bucket.mood[m.type] = (bucket.mood[m.type] || 0) + 1
      }
    })

    return Array.from(map.entries()).map(([date, totals]) => ({
      date,
      ...totals
    }))
  }, [sleepSegments, eventMarkers])

  return { byDate }
}

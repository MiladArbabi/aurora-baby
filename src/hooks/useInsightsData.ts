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

    // init last 7 days
    for (let i = 6; i >= 0; i--) {
      const d = new Date()
      d.setDate(d.getDate() - i)
      map.set(
        d.toISOString().substr(0,10),  // “YYYY-MM-DD”
        { sleep: 0, feeding: 0, diaper: 0, mood: {} }
      )
    }

     // accumulate sleep segments
    sleepSegments.forEach(s => {
      // figure out which calendar day this segment belongs to
      const day = new Date(
        s.startFraction * 24 * 60 * 60 * 1000
      )
        .toISOString()
        .substr(0,10)

      // convert the arc fraction difference to minutes
      const minutes = (s.endFraction - s.startFraction) * 1440
      map.get(day)!.sleep += minutes
    })

    // accumulate events
        eventMarkers.forEach(m => {
      // convert the event’s fraction-of-day back into a Date-string
      const day = new Date(m.fraction * 24*60*60*1000)
                   .toISOString().substr(0,10)
      const bucket = map.get(day)
      if (!bucket) return

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

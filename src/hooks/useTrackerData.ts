// src/hooks/useTrackerData.ts
import { useEffect, useState } from 'react'
import { getLogsBetween } from '../services/QuickLogAccess'
import { QuickLogEntry } from '../models/QuickLogSchema'
import { quickLogEmitter } from '../storage/QuickLogEvents';

export interface EventMarker {
  id: string
  fraction: number
  color: string
  type: QuickLogEntry['type']
}

const fracOfDay = (d: Date) =>
  (d.getHours() * 60 + d.getMinutes() + d.getSeconds() / 60) / 1440

export const colorMap: Record<QuickLogEntry['type'], string> = {
  sleep:   '#FFFFFF',
  feeding: '#50E3C2',
  diaper:  '#F5A623',
  mood:    '#F8E71C',
  health:  '#D0021B',
  note:    '#9013FE',
}

/**
 * @param showLast24h  if true, fetch entries from now−24h→now; 
 *                     otherwise from today’s midnight→now
 */
export function useTrackerData(showLast24h: boolean = false) {
  const [entries, setEntries] = useState<QuickLogEntry[]>([]);
  const [eventMarkers, setEventMarkers]   = useState<EventMarker[]>([])
  const [nowFrac, setNowFrac] = useState(fracOfDay(new Date()));
  
  // update clock every minute
  useEffect(() => {
    const id = setInterval(() => setNowFrac(fracOfDay(new Date())), 60_000)
    return () => clearInterval(id)
  }, [])

  useEffect(() => {
    let alive = true
    async function load() {
      const now = new Date()
      const start = showLast24h
        ? new Date(now.getTime() - 24 * 60 * 60 * 1000)
        : new Date(now.getFullYear(), now.getMonth(), now.getDate())

      const all = await getLogsBetween(start.toISOString(), now.toISOString())
      if (!alive) return
      setEntries(all)

      // Map **all** logs (including 'sleep') into event markers at timestamp
      const markers: EventMarker[] = all.map(e => {
        const t = new Date(e.timestamp)
        const fraction =
          (t.getHours() * 60 + t.getMinutes() + t.getSeconds() / 60) / 1440
        return {
          id: e.id,
          fraction,
          color: colorMap[e.type],
          type: e.type,
        }
      })

      if (!alive) return
      setEventMarkers(markers)
    }

    load()
    const onSaved = () => load()
    quickLogEmitter.on('saved', onSaved)
    quickLogEmitter.on('deleted', onSaved)
    quickLogEmitter.on('future-deleted', onSaved)
    return () => {
      alive = false
      quickLogEmitter.off('saved', onSaved)
      quickLogEmitter.off('deleted', onSaved)
      quickLogEmitter.off('future-deleted', onSaved)
    }
  }, [showLast24h, nowFrac])

  return { entries, eventMarkers, nowFrac }
}

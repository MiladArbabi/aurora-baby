// src/hooks/useTrackerData.ts
import { useEffect, useState } from 'react'
import { getLogsBetween } from '../services/QuickLogAccess'
import { QuickLogEntry } from '../models/QuickLogSchema'

export interface SleepSegment {
  id: string
  startFraction: number
  endFraction: number
  color: string
}

export interface EventMarker {
  id: string
  fraction: number
  color: string
  type: QuickLogEntry['type']
}

const colorMap: Record<QuickLogEntry['type'], string> = {
  sleep:   '#4A90E2',
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
  const [sleepSegments, setSleepSegments] = useState<SleepSegment[]>([])
  const [eventMarkers, setEventMarkers]   = useState<EventMarker[]>([])

  useEffect(() => {
    let alive = true
    async function load() {
      const now = new Date()
      const start = showLast24h
      ? new Date(now.getTime() - 24*60*60*1000)
      : new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate(),0,0,0));
      
      const all = await getLogsBetween(start.toISOString(), now.toISOString());
      if (!alive) return;
      setEntries(all);

      // ② map sleeps to arcs
      const sleepSegs = entries
        .filter(
          (e): e is QuickLogEntry & {
            data: { start: string; end: string; duration: number }
          } => e.type === 'sleep'
        )
        .map((e) => {
          const startDate = new Date(e.data.start)
          const endDate   = new Date(e.data.end)
          const startFraction =
            (startDate.getHours() * 60 +
             startDate.getMinutes() +
             startDate.getSeconds() / 60) / 1440
          const endFraction =
            (endDate.getHours() * 60 +
             endDate.getMinutes() +
             endDate.getSeconds() / 60) / 1440
          return {
            id: e.id,
            startFraction,
            endFraction,
            color: '#E9DAFA',
          }
        })

      // ③ map non‐sleep to point markers
      const markers = entries
        .filter((e) => e.type !== 'sleep')
        .map((e) => {
          const t = new Date(e.timestamp)
          const fraction =
            (t.getHours() * 60 +
             t.getMinutes() +
             t.getSeconds() / 60) / 1440
          return {
            id: e.id,
            fraction,
            color: colorMap[e.type],
            type: e.type,
          }
        })

      if (!alive) return
      setSleepSegments(sleepSegs)
      setEventMarkers(markers)
    }

    load()
    return () => {
      alive = false
    }
  }, [showLast24h])

  return { entries, sleepSegments, eventMarkers }
}

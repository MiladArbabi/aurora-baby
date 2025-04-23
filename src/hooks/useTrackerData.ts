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

export function useTrackerData() {
  const [sleepSegments, setSleepSegments] = useState<SleepSegment[]>([])
  const [eventMarkers, setEventMarkers] = useState<EventMarker[]>([])

  useEffect(() => {
    let alive = true

    async function load() {
      // ── only fetch *today’s* logs ────────────────────────────────
      const now = new Date()
      const yyyy = now.getUTCFullYear()
      const mm   = String(now.getUTCMonth() + 1).padStart(2, '0')
      const dd   = String(now.getUTCDate()).padStart(2, '0')
      const startISO = `${yyyy}-${mm}-${dd}T00:00:00.000Z`
      const endISO   = `${yyyy}-${mm}-${dd}T23:59:59.999Z`

      // ① call the aliased function your test mocks
      const entries: QuickLogEntry[] = await getLogsBetween(startISO, endISO)

      // ② map sleep entries into arcs (we narrow the type so TS knows about .data.start/.data.end)
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
              startDate.getSeconds() / 60) /
            1440
          const endFraction =
            (endDate.getHours() * 60 +
              endDate.getMinutes() +
              endDate.getSeconds() / 60) /
            1440
          return {
            id: e.id,
            startFraction,
            endFraction,
            color: '#E9DAFA',
          }
        })

      // ③ non-sleep entries become point markers
      const markers = entries
        .filter((e) => e.type !== 'sleep')
        .map((e) => {
          const t = new Date(e.timestamp)
          const fraction =
            (t.getHours() * 60 + t.getMinutes() + t.getSeconds() / 60) /
            1440
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
  }, [])

  return { sleepSegments, eventMarkers }
}

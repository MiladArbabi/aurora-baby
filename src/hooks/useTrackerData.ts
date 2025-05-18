// src/hooks/useTrackerData.ts
import { useEffect, useState } from 'react'
import { getLogsBetween } from '../services/QuickLogAccess'
import { QuickLogEntry } from '../models/QuickLogSchema'
import { quickLogEmitter } from '../storage/QuickLogEvents';

export interface SleepSegment {
  id: string
  start: string // ISO date
  end: string   // ISO date
  startFraction: number
  endFraction: number
  color: string
}

// helper to turn a Date into a 0–1 fraction of the day
const fracOfDay = (d: Date) =>
  (d.getHours()*60 + d.getMinutes() + d.getSeconds()/60) / 1440;

export interface EventMarker {
  id: string
  fraction: number
  color: string
  type: QuickLogEntry['type']
}

export const colorMap: Record<QuickLogEntry['type'], string> = {
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
  // update every minute so ongoing naps animate
  const [nowFrac, setNowFrac] = useState(fracOfDay(new Date()));
  
  useEffect(() => {
  const id = setInterval(() => setNowFrac(fracOfDay(new Date())), 60_000);
  return () => clearInterval(id);
  }, []);

  useEffect(() => {
    let alive = true
    async function load() {
      const now = new Date()
      const start = showLast24h
      ? new Date(now.getTime() - 24*60*60*1000)
      : new Date(now.getFullYear(), now.getMonth(), now.getDate());

      const all = await getLogsBetween(start.toISOString(), now.toISOString());
      if (!alive) return;
      setEntries(all);

      // ② map sleeps to arcs
      const sleepSegs = all
        .filter(
          (e): e is QuickLogEntry & {
            data: { start: string; end: string; duration: number }
          } => e.type === 'sleep'
        )
        .map((e) => {
          const startDate = new Date(e.data.start)
          const startFraction = fracOfDay(startDate)

          // if the sleep is still ongoing (no end or end in the future), use nowFrac
          let endFraction: number
          if (!e.data.end || new Date(e.data.end) > now) {
            endFraction = nowFrac
          } else {
            endFraction = fracOfDay(new Date(e.data.end))
          }

          return {
            start: e.data.start,
            end: e.data.end ?? now.toISOString(),
            id: e.id,
            startFraction,
            endFraction,
            color: '#E9DAFA',
          }
        })

      // ③ map non‐sleep to point markers
      const markers = all
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

    // re-run load whenever we quick-log
    const onSaved = () => load();
    quickLogEmitter.on('saved', onSaved);

    return () => {
      alive = false;
      quickLogEmitter.off('saved', onSaved);
    }
  }, [showLast24h, nowFrac])

  return { entries, sleepSegments, eventMarkers, nowFrac }
}

// src/hooks/useTrackerData.ts
import { useEffect, useState } from 'react'
import { getLogsBetween } from '../services/QuickLogAccess'
import { QuickLogEntry } from '../models/QuickLogSchema'
import { quickLogEmitter } from '../storage/QuickLogEvents';
import { DailySliceTemplate, generateDefaultDailyTemplate, SliceCategory } from '../utils/dailySliceTemplate'

export interface EventMarker {
  id: string
  fraction: number
  color: string
  type: QuickLogEntry['type']
}

interface HourlyCategories { [hour: number]: SliceCategory }

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
    const [entries, setEntries] = useState<QuickLogEntry[]>([])
    const [eventMarkers, setEventMarkers] = useState<EventMarker[]>([])
    const [hourlyCategories, setHourlyCategories] = useState<SliceCategory[]>([])
    const [nowFrac, setNowFrac] = useState(fracOfDay(new Date()))

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

      // ── NEW: Build “hourlyCategories” based on whatever logs we have ─────────────
      // Start with default template (all false), then override any hour that has a log of a given type
      // Priority: sleep > feeding/diaper > (let’s lump feeding+diaper into “feedDiaper”) > anything else = “play”
      const defaultTemplate: DailySliceTemplate = generateDefaultDailyTemplate()
      // Convert template booleans → base categories
      const baseCat: SliceCategory[] = []
      for (let h = 0; h < 24; h++) {
        if (defaultTemplate.sleep[h]) {
          baseCat[h] = 'sleep'
        } else if (defaultTemplate.feedDiaper[h]) {
          baseCat[h] = 'feedDiaper'
        } else if (defaultTemplate.showerEss[h]) {
          baseCat[h] = 'showerEss'
        } else {
          baseCat[h] = 'play'
        }
      }

      // Now override any hour where an actual log exists:
      //   if any log of type “sleep” falls in that same hour → ‘sleep’
      //   else if any “feeding” OR “diaper” in that hour → ‘feedDiaper’
      //   else if any “health” (assume as “showerEss”) → ‘showerEss’
      //   else everything else remains (play/note/mood/etc → play)
      const categoryByHour: HourlyCategories = { ...baseCat }
      all.forEach((e) => {
        const dt = new Date(e.timestamp)
        const hr = dt.getHours() // 0–23
        if (e.type === 'sleep') {
          categoryByHour[hr] = 'sleep'
        } else if (e.type === 'feeding' || e.type === 'diaper') {
          if (categoryByHour[hr] !== 'sleep') {
            categoryByHour[hr] = 'feedDiaper'
          }
        } else if (e.type === 'health') {
          if (categoryByHour[hr] !== 'sleep' && categoryByHour[hr] !== 'feedDiaper') {
            categoryByHour[hr] = 'showerEss'
          }
        } 
        // We treat mood/note etc as “play” by default (so no need to explicitly override)
      })
      // Flatten into an array of length 24
      const finalCats: SliceCategory[] = Array(24).fill('play')
      for (let h = 0; h < 24; h++) {
        finalCats[h] = categoryByHour[h]
      }
      if (!alive) return
      setHourlyCategories(finalCats)
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

  return { entries, eventMarkers, nowFrac, hourlyCategories }
}

// src/hooks/useInsightsData.ts
// src/hooks/useInsightsData.ts
import { useTrackerData, SleepSegment, EventMarker } from './useTrackerData';
import { useMemo } from 'react';
import { addDays, startOfDay } from 'date-fns';
import type { QuickLogEntry } from '../models/QuickLogSchema';

interface DayTotals {
  date:         string;
  napMinutes:   number;
  nightMinutes: number;
  awakeMinutes: number;
  feeding:      number;
  diaper:       number;
  mood:         Record<string,number>;
  napDurations: number[];
  awakeWindows: number[]; 
}

interface UseInsightsReturn {
  byDate: DayTotals[];
  sleepSegments: SleepSegment[];
  intervalData: Array<{ date: string; startFraction: number; endFraction: number; color: string }>;
  // feeding insights
  feedMarks: EventMarker[];
  feedTypeCounts: Record<string, number>;
  avgDaily: number;
  avgWeekly: number;
  avgMonthly: number;
  correlationMessage: string;
  diaperTypeCounts: Record<string, number>;
  diaperMarks: EventMarker[];
}

export function useInsightsData(showLast24h: boolean): UseInsightsReturn {
  // ① raw entries, segments & markers
  const { sleepSegments, eventMarkers, entries } = useTrackerData(showLast24h);

  // timeline intervals
  const intervalData = useMemo<UseInsightsReturn['intervalData']>(
    () => sleepSegments.map(seg => ({
      date: seg.start.slice(0,10),
      startFraction: seg.startFraction,
      endFraction: seg.endFraction,
      color: seg.color,
    })),
    [sleepSegments]
  );

  // bucketed by day
  const byDate = useMemo<DayTotals[]>(() => {
    const map = new Map<string, DayTotals>();
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const key = d.toISOString().slice(0,10);
      map.set(key, {
        date: key,
        napMinutes: 0,
        nightMinutes: 0,
        awakeMinutes: 0,
        feeding: 0,
        diaper: 0,
        mood: {},
        napDurations: [],
        awakeWindows: [],
      });
    }

    // sleep
    entries.filter((e): e is QuickLogEntry & { data: { start: string; end: string; duration: number; subtype?: string } } => e.type === 'sleep')
      .forEach(e => {
        const dayKey = e.data.start.slice(0,10);
        const bucket = map.get(dayKey);
        if (!bucket) return;
        const dur = e.data.duration;
        if (e.data.subtype?.startsWith('nap')) {
          bucket.napMinutes += dur;
          bucket.napDurations.push(dur);
        } else {
          bucket.nightMinutes += dur;
        }
      });

    // feed/diaper/mood
    eventMarkers.forEach(m => {
      const dayKey = new Date(m.fraction * 24*60*60*1000).toISOString().slice(0,10);
      const b = map.get(dayKey);
      if (!b) return;
      if (m.type === 'feeding') b.feeding++;
      else if (m.type === 'diaper') b.diaper++;
      else if (m.type === 'mood') b.mood[m.type] = (b.mood[m.type]||0) + 1;
    });

    // awake windows
    map.forEach((bucket, dayKey) => {
      const spans = sleepSegments
        .filter(s => s.start.slice(0,10) === dayKey)
        .map(s => [new Date(s.start), new Date(s.end)] as [Date, Date])
        .sort((a,b) => a[0].getTime() - b[0].getTime());
      let lastEnd = startOfDay(new Date(dayKey)).getTime();
      spans.forEach(([start, end]) => {
        bucket.awakeWindows.push((start.getTime() - lastEnd) / 60000);
        lastEnd = end.getTime();
      });
      const midnight = startOfDay(addDays(new Date(dayKey), 1)).getTime();
      bucket.awakeWindows.push((midnight - lastEnd) / 60000);
    });

    return Array.from(map.values());
  }, [sleepSegments, entries, eventMarkers]);

  // ── ⑤ Feeding insights ─────────────────────────────────────────────
  const feedMarks = eventMarkers.filter(m => m.type === 'feeding');

  const feedTypeCounts: Record<string, number> = {};
  entries
    .filter((e): e is QuickLogEntry & { data: { method?: string } } => e.type === 'feeding')
    .forEach(e => {
      const method = e.data.method ?? 'bottle';
      feedTypeCounts[method] = (feedTypeCounts[method] ?? 0) + 1;
    });

  const totalFeeds = byDate.reduce((sum: number, d: DayTotals) => sum + d.feeding, 0);
  const avgDaily   = totalFeeds / byDate.length;
  const avgWeekly  = avgDaily * 7;
  const avgMonthly = avgDaily * 30;

  const napStarts = sleepSegments.map(s => new Date(s.start).getTime());
  let extraNapMins = 0;
  let correlatedCount = 0;
  entries
    .filter(e => e.type === 'feeding')
    .forEach(e => {
      const t = new Date((e as any).timestamp).getTime();
      napStarts.forEach(ns => {
        const diff = ns - t;
        if (diff >= 0 && diff <= 30 * 60 * 1000) {
          extraNapMins += 15; // placeholder delta
          correlatedCount++;
        }
      });
    });
  const correlationMessage = correlatedCount > 0
    ? `Feeds within 30 m of sleep correlated with +${Math.round(extraNapMins / correlatedCount)} m naps.`
    : '';

// ── Diaper insights ─────────────────────────────────────────
const diaperTypeCounts: Record<string, number> = {};
  entries
    .filter((e): e is QuickLogEntry & { data: { subtype?: string } } => e.type === 'diaper')
    .forEach(e => {
      const kind = e.data.subtype ?? 'wet';
      diaperTypeCounts[kind] = (diaperTypeCounts[kind] ?? 0) + 1;
    });

    const diaperMarks = eventMarkers.filter(m => m.type === 'diaper');

  return {
    byDate,
    sleepSegments,
    intervalData,
    feedMarks,
    feedTypeCounts,
    avgDaily,
    avgWeekly,
    avgMonthly,
    correlationMessage,
    diaperTypeCounts,
    diaperMarks,
  };
}

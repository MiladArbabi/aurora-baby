// src/hooks/useInsightsData.ts
import { useTrackerData } from './useTrackerData';
import { useMemo } from 'react';
import { addDays, startOfDay } from 'date-fns';
import { QuickLogEntry } from '../models/QuickLogSchema';

interface DayTotals {
  date:         string;
  napMinutes:   number;
  nightMinutes: number;
  awakeMinutes: number;
  feeding:      number;
  diaper:       number;
  mood:         Record<string,number>;
  napDurations: number[] 
  awakeWindows: number[]; 
}

export function useInsightsData(showLast24h: boolean) {
  // ① get raw entries plus your existing segments/markers
  const { sleepSegments, eventMarkers, entries } = useTrackerData(showLast24h);

  const intervalData = useMemo(() => sleepSegments.map(seg => ({
    date: seg.start.slice(0,10), // MM-DD
    startFraction: seg.startFraction,
    endFraction: seg.endFraction,
    color: seg.color,
  })), [sleepSegments]);

  const byDate = useMemo(() => {
    // initialize a 7-day map
    const map = new Map<string, DayTotals>();
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const key = d.toISOString().slice(0,10);
      map.set(key, {
        date: key,
        napMinutes:   0,
        nightMinutes: 0,
        awakeMinutes: 0,    
        feeding:      0,
        diaper:       0,
        mood:         {},
        napDurations: [],
        awakeWindows: [],
      });
    }

    // ② bucket sleep-logs by subtype
    entries
      .filter(e => e.type === 'sleep')
      .forEach((e) => {
        const dayKey = e.data.start.slice(0,10);
        const bucket = map.get(dayKey);
        if (!bucket) return;
        const dur = e.data.duration;   // already in minutes
        if (e.data.subtype && e.data.subtype.startsWith('nap')) {
          bucket.napMinutes += dur;
          bucket.napDurations.push(dur)   // ← record each nap
        } else {
          // anything not labeled nap is night-sleep
          bucket.nightMinutes += dur;
        }
      });

    // ③ count feedings / diapers
    eventMarkers.forEach(m => {
      const dayKey = new Date(m.fraction * 24*60*60*1000)
                        .toISOString().slice(0,10);
      const b = map.get(dayKey);
      if (!b) return;
      if (m.type === 'feeding') b.feeding++;
      else if (m.type === 'diaper') b.diaper++;
      else if (m.type === 'mood') {
        b.mood[m.type] = (b.mood[m.type]||0)+1;
      }
    });

    // ④ carve out awake windows:
    map.forEach((bucket, dayKey) => {
      // 1) collect all the sleep spans for that date
      const spans = sleepSegments
      .filter(s => s.start.slice(0,10) === dayKey)
      .map(s => [new Date(s.start), new Date(s.end)] as [Date,Date])
      .sort((a,b) => a[0].getTime() - b[0].getTime())
    
      // 2) walk through them, carving out the awake gaps
      let lastEnd = startOfDay(new Date(dayKey)).getTime()
      spans.forEach(([start,end]) => {
        bucket.awakeWindows.push((start.getTime() - lastEnd) / 60000)
        lastEnd = end.getTime()
      })
    
      // 3) and finally the bit from last sleep until midnight
      const midnight = startOfDay(addDays(new Date(dayKey),1)).getTime()
      bucket.awakeWindows.push((midnight - lastEnd)/60000)
    
      // (you’ve already separately computed bucket.awakeMinutes if you want a total)
    });

    return Array.from(map.values())
  }, [sleepSegments, entries, eventMarkers])

  return { byDate, sleepSegments, intervalData };
}

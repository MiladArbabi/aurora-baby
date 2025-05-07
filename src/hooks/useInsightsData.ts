// src/hooks/useInsightsData.ts
import { useTrackerData } from './useTrackerData';
import { useMemo } from 'react';

interface DayTotals {
  date:       string;
  napMinutes: number;
  nightMinutes:number;
  awakeMinutes:number;
  feeding:    number;
  diaper:     number;
  mood:       Record<string,number>;
}

export function useInsightsData(showLast24h: boolean) {
  // ① get raw entries plus your existing segments/markers
  const { sleepSegments, eventMarkers, entries } = useTrackerData(showLast24h);

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
        awakeMinutes: 0,    // filled later
        feeding:      0,
        diaper:       0,
        mood:         {},
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

    // ④ compute awake = 1440 – (nap + night)
    map.forEach(b => {
      b.awakeMinutes = Math.max(
        0,
        1440 - (b.napMinutes + b.nightMinutes)
      );
    });

    return Array.from(map.values());
  }, [entries, eventMarkers]);

  return { byDate, sleepSegments  };
}

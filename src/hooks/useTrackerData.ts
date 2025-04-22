import { useState, useEffect } from 'react';
import { QuickLogEntry, SleepLog } from '../models/QuickLogSchema';
import { getLogsBetween } from '../services/QuickLogAccess';
import { theme } from '../styles/theme';

export interface SleepSegment {
  id: string;
  startFraction: number;
  endFraction: number;
  color: string;
}
export interface EventMarker {
  id: string;
  fraction: number;
  color: string;
  type: string;
}

export function useTrackerData() {
  const [sleepSegments, setSleepSegments] = useState<SleepSegment[]>([]);
  const [eventMarkers, setEventMarkers] = useState<EventMarker[]>([]);

  useEffect(() => {
    const load = async () => {
      const now = new Date();
      const dayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      const dayEnd = new Date(dayStart);
      dayEnd.setDate(dayEnd.getDate() + 1);

      const logs: QuickLogEntry[] = await getLogsBetween(
        dayStart.toISOString(),
        dayEnd.toISOString()
      );

      // 1. Sleep segments
      const sleeps = logs.filter((l) => l.type === 'sleep') as SleepLog[];
      const toFrac = (d: Date) =>
        (d.getHours() * 60 + d.getMinutes() + d.getSeconds() / 60) / 1440;
      const segments: SleepSegment[] = sleeps.map((s) => {
        const start = new Date(s.data.start);
        const end = new Date(s.data.end);
        return {
          id: s.id,
          startFraction: toFrac(start),
          endFraction: toFrac(end),
          color: theme.colors.primary,
        };
      });

      // 2. Other events as markers
      const colorMap: Record<string, string> = {
        feeding: theme.colors.accent,
        diaper: theme.colors.warning,
        mood: theme.colors.secondaryAccent,
        health: theme.colors.error,
        note: theme.colors.info,
      };
      const markers = logs
        .filter((l) => l.type !== 'sleep')
        .map((l) => {
          const t = new Date(l.timestamp);
          const frac = toFrac(t);
          return {
            id: l.id,
            type: l.type,
            fraction: frac,
            color: colorMap[l.type] ?? theme.colors.background,
          };
        });

      setSleepSegments(segments);
      setEventMarkers(markers);
    };

    load();
  }, []);

  return { sleepSegments, eventMarkers };
}
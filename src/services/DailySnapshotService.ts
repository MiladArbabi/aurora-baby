// src/services/DailySnapshotService.ts

import { getDailySchedule } from '../storage/ScheduleStorage';
import { getLogSliceMeta } from '../storage/LogSliceMetaStorage';
import type { LogSlice } from '../models/LogSlice';
import type { DailySnapshot } from '../models/DailySnapshot';

export async function generateDailySnapshot(
  babyId: string,
  dateISO: string
): Promise<DailySnapshot> {
  // 1) load the day’s slices
  const slices = (await getDailySchedule(dateISO, babyId)) ?? [];

  // 2) filter to only confirmed ones
  const confirmedSlices: LogSlice[] = [];
  for (const s of slices) {
    const meta = await getLogSliceMeta(babyId, s.id);
    if (meta?.confirmed) confirmedSlices.push(s);
  }

  // 3) accumulate totals
  const totalDurations = {
    sleep: 0,
    awake: 0,
    feed: 0,
    diaper: 0,
    care: 0,
    talk: 0,
    other: 0,
  };
  const counts = { feed: 0, diaper: 0, care: 0, talk: 0 };

  const minutes = (s: LogSlice) => {
    const start = new Date(s.startTime).getTime();
    const end   = new Date(s.endTime).getTime();
    return Math.round((end - start) / 1000 / 60);
  };

  for (const s of confirmedSlices) {
    const m = minutes(s);
    totalDurations[s.category as keyof typeof totalDurations] += m;
    if (counts.hasOwnProperty(s.category)) {
      counts[s.category as keyof typeof counts] += 1;
    }
  }

  return {
    date: dateISO,
    babyId,
    totalDurations,
    counts,
  };
}

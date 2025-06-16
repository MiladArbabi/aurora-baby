// src/data/defaultSchedule.ts
import type { ScheduleTemplateEntry } from "../models/ScheduleTemplate";

export const DefaultDailyEntries: ScheduleTemplateEntry[] = [
  // ── Night sleep (21:00–24:00 and 00:00–06:00) ──
  { category: "sleep", startHour: 21,   endHour: 24 },
  { category: "sleep", startHour: 0,    endHour: 6  },

  // ── Morning feed & diaper immediately after waking at 06:00 ──
  { category: "feed",   startHour: 6.0,  endHour: 6.3 },
  { category: "diaper", startHour: 6.3,  endHour: 6.4 },

  // ── Awake stretch until first nap ──
  { category: "awake",  startHour: 6.4,  endHour: 9  },

  // ── Nap #1 ──
  { category: "sleep",  startHour: 9.0,  endHour: 11 },

  // ── Feed & diaper on waking at 11:00 ──
  { category: "feed",   startHour: 11.0, endHour: 11.3 },
  { category: "diaper", startHour: 11.3, endHour: 11.4 },

  // ── Awake until second nap ──
  { category: "awake",  startHour: 11.4, endHour: 13 },

  // ── Nap #2 ──
  { category: "sleep",  startHour: 13.0, endHour: 15 },

  // ── Feed & diaper on waking at 15:00 ──
  { category: "feed",   startHour: 15.0, endHour: 15.3 },
  { category: "diaper", startHour: 15.3, endHour: 15.4 },

  // ── Awake until third nap ──
  { category: "awake",  startHour: 15.4, endHour: 17 },

  // ── Nap #3 ──
  { category: "sleep",  startHour: 17.0, endHour: 19 },

  // ── Feed & diaper on waking at 19:00 ──
  { category: "feed",   startHour: 19.0, endHour: 19.3 },
  { category: "diaper", startHour: 19.3, endHour: 19.4 },

  // ── Final awake stretch until bedtime at 21:00 ──
  { category: "awake",  startHour: 19.4, endHour: 21 },
];

// src/utils/dailySliceTemplate.ts
export type SliceCategory = 'sleep' | 'play' | 'feedDiaper' | 'showerEss';

export interface DailySliceTemplate {
  sleep: boolean[];     // length 24, true = scheduled for sleep
  play: boolean[];      // length 24, true = scheduled for awake/play
  feedDiaper: boolean[]; // length 24, true = scheduled for feeding/diaper
  showerEss: boolean[];  // length 24, true = scheduled for shower/essentials
}

// Example heuristics (you can tweak these numbers as needed):
// • Night sleep: 20:00–06:00  
// • Morning nap: 09:00–10:00  
// • Midday nap: 14:00–15:00  
// • Awake/play: all hours not covered by other categories  
// • Feed/diaper: every 3 hours starting at 06:00, 09:00, 12:00, 15:00, 18:00, 21:00  
// • Shower/essentials: 18:00–19:00 (for example)

export function generateDefaultDailyTemplate(): DailySliceTemplate {
  // Start by creating 24-element arrays, all false
  const sleep   = new Array(24).fill(false);
  const play    = new Array(24).fill(false);
  const feedDiaper = new Array(24).fill(false);
  const showerEss  = new Array(24).fill(false);

  // 1) Mark «night sleep» from 20:00 (20) up to midnight (24) and from midnight (0) to 06:00 (6)
  for (let h = 20; h < 24; ++h) {
    sleep[h] = true;
  }
  for (let h = 0; h < 6; ++h) {
    sleep[h] = true;
  }

  // 2) Morning nap: 09:00–10:00
  sleep[9] = true;

  // 3) Midday nap: 14:00–15:00
  sleep[14] = true;

  // 4) Feeding/diaper every 3 hours starting at 06:00, e.g. 06:00, 09:00, 12:00, 15:00, 18:00, 21:00
  const feedHours = [6, 9, 12, 15, 18, 21];
  feedHours.forEach(h => {
    feedDiaper[h] = true;
  });

  // 5) Shower/essentials: 18:00–19:00
  showerEss[18] = true;

  // 6) Finally, assign “play” to any hour that isn’t already marked as sleep, feed/diaper, or shower/essentials
  for (let h = 0; h < 24; ++h) {
    if (!sleep[h] && !feedDiaper[h] && !showerEss[h]) {
      play[h] = true;
    }
  }

  return { sleep, play, feedDiaper, showerEss };
}

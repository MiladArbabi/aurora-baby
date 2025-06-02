// src/services/GapSettingsDefaults.ts
import { GapSettings } from './GapSettingsStorage';

export function defaultGapSettingsForAge(dobIso: string): GapSettings {
  const dob = new Date(dobIso);
  const now = new Date();
  const ageMonths =
    (now.getFullYear() - dob.getFullYear()) * 12 +
    (now.getMonth() - dob.getMonth());

  // Rough guidelines (customize per your pediatrician’s recommendations):
  //   • 0–1 month: feed every 2 hours (120 min)
  //   • 1–3 months: feed every 2.5 hours (150 min)
  //   • 3–6 months: feed every 3 hours (180 min)
  //   • 6–12 months: feed every 3.5 hours (210 min)
  //   • >12 months: feed every 4 hours (240 min)
  let feedingGapMinutes: number;
  if (ageMonths < 1) {
    feedingGapMinutes = 120;
  } else if (ageMonths < 3) {
    feedingGapMinutes = 150;
  } else if (ageMonths < 6) {
    feedingGapMinutes = 180;
  } else if (ageMonths < 12) {
    feedingGapMinutes = 210;
  } else {
    feedingGapMinutes = 240;
  }

  // Diaper changes: typically every 4–6 hours, but older baby may last up to 8 hours
  let diaperGapHours: number;
  if (ageMonths < 3) {
    diaperGapHours = 4;
  } else if (ageMonths < 12) {
    diaperGapHours = 5;
  } else {
    diaperGapHours = 6;
  }

  // Sleep sessions: you might want to alert if more than 5–6 hours awake
  // (parents often log sleep periods themselves). Start with 6 hours.
  const sleepGapHours = 6;

  return { feedingGapMinutes, diaperGapHours, sleepGapHours };
}

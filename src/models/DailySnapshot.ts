// src/models/DailySnapshot.ts
export interface DailySnapshot {
    date: string;             // YYYY-MM-DD
    babyId: string;
    totalDurations: {         // in minutes
      sleep: number;
      awake: number;
      feed: number;
      diaper: number;
      care: number;
      talk: number;
      other: number;
    };
    counts: {                  // how many slices of each
      feed: number;
      diaper: number;
      care: number;
      talk: number;
    };
  }
  
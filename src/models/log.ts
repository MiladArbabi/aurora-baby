// src/models/log.ts
export type LogType =
  | 'feeding'
  | 'nap'
  | 'mood'
  | 'story'
  | 'music'
  | 'ar_play'
  | 'vr_play'
  | 'game_play';

export interface CareLog {
  id: string;
  childId: string;
  type: LogType;
  timestampStart: string; // ISO date
  timestampEnd?: string; // for duration-based logs
  quantity?: number; // ml for feeding
  notes?: string;
  region?: string; // if applicable
  source: 'explicit' | 'inferred';
  confidence?: number; // 0–1 for inferred logs
}

// src/models/QuickLogSchema.ts
import { z } from 'zod';

export type QuickLogType =
  | 'sleep'
  | 'awake'
  | 'feeding'
  | 'diaper'
  | 'mood'
  | 'health'
  | 'note';

export interface QuickLogBase {
  id: string;
  babyId: string;
  timestamp: string; // ISO 8601
  type: QuickLogType;
  version: number;
}

export interface SleepLog extends QuickLogBase {
  type: 'sleep';
  data: {
    start: string;
    end: string;
    duration: number; // in minutes
  };
}

export interface AwakeLog extends QuickLogBase {
  type: 'awake';
  data: {
    start: string;
    end: string;
    duration: number;
  };
}

export interface FeedingLog extends QuickLogBase {
  type: 'feeding';
  data: {
    method: 'bottle' | 'breast' | 'solid';
    quantity?: number; // in ml or grams
    notes?: string;
  };
}

export interface DiaperLog extends QuickLogBase {
  type: 'diaper';
  data: {
    status: 'wet' | 'dirty' | 'both';
    notes?: string;
  };
}

export interface MoodLog extends QuickLogBase {
  type: 'mood';
  data: {
    emoji: string; // 🙂😢😠 etc.
    tags?: string[]; // e.g. ['crying', 'punching']
  };
}

export interface HealthLog extends QuickLogBase {
  type: 'health';
  data: {
    temperature?: number; // Celsius
    symptoms?: string[];
    notes?: string;
  };
}

export interface NoteLog extends QuickLogBase {
  type: 'note';
  data: {
    text: string;
  };
}

export type QuickLogEntry =
  | SleepLog
  | AwakeLog
  | FeedingLog
  | DiaperLog
  | MoodLog
  | HealthLog
  | NoteLog;

  export const SleepLogSchema = z.object({
    id: z.string(),
    babyId: z.string(),
    timestamp: z.string(),
    type: z.literal('sleep'),
    version: z.number(),
    data: z.object({
      start: z.string(),
      end: z.string(),
      duration: z.number(),
    }),
  });
  
  export const QuickLogEntrySchema = z.discriminatedUnion('type', [
    SleepLogSchema,
    // TODO: Add schemas for other types
  ]);
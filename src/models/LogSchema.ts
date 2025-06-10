//src/models/LogSchema.ts
import { z } from 'zod';

export type LogType =
  | 'sleep'
  | 'feeding'
  | 'diaper'
  | 'mood'
  | 'health'
  | 'note';

export interface LogBase {
  id: string;
  babyId: string;
  timestamp: string; // ISO 8601
  type: LogType;
  version: number;
}

export interface SleepLog extends LogBase {
  type: 'sleep';
  data: {
    subtype?: 'night' | 'nap1' | 'nap2' | 'nap3';
    start: string;
    end: string;
    duration: number;
  };
}

export interface FeedingLog extends LogBase {
  type: 'feeding';
  data: {
    method: 'bottle' | 'breast';
    quantity?: number;
    unit?: 'oz' | 'mL';
    subtype?: 'formula' | 'milk'; // Optional for formula vs. breast milk
    notes?: string;
  };
}

export interface DiaperLog extends LogBase {
  type: 'diaper';
  data: {
    status: 'wet' | 'dirty' | 'both';
    notes?: string;
  };
}

export interface MoodLog extends LogBase {
  type: 'mood';
  data: {
    emoji: string;
    tags?: string[];
    subtype?: 'happy' | 'sad' | 'angry' | 'neutral';
  };
}

export interface HealthLog extends LogBase {
  type: 'health';
  data: {
    subtype?: string;
    temperature?: number;
    symptoms?: string[];
    notes?: string;
  };
}

export interface NoteLog extends LogBase {
  type: 'note';
  data: {
    text: string;
  };
}

export type LogEntry =
  | SleepLog
  | FeedingLog
  | DiaperLog
  | MoodLog
  | HealthLog
  | NoteLog;

// ─── ZOD SCHEMAS ───────────────────────────────────────────────────────────────

export const SleepLogSchema = z.object({
  id:        z.string(),
  babyId:    z.string(),
  timestamp: z.string(),
  type:      z.literal('sleep'),
  version:   z.number(),
  data: z.object({
    subtype:  z.enum(['night', 'nap1', 'nap2', 'nap3']).optional(),
    start:    z.string(),
    end:      z.string(),
    duration: z.number(),
  }),
});

export const FeedingLogSchema = z.object({
  id:        z.string(),
  babyId:    z.string(),
  timestamp: z.string(),
  type:      z.literal('feeding'),
  version:   z.number(),
  data: z.object({
    method:   z.enum(['bottle', 'breast']),
    quantity: z.number().optional(),
    unit:     z.enum(['oz', 'mL']).optional(),
    subtype:  z.enum(['formula', 'milk']).optional(),
    notes:    z.string().optional(),
  }),
});

export const DiaperLogSchema = z.object({
  id:        z.string(),
  babyId:    z.string(),
  timestamp: z.string(),
  type:      z.literal('diaper'),
  version:   z.number(),
  data: z.object({
    status: z.enum(['wet', 'dirty', 'both']),
    notes:  z.string().optional(),
  }),
});

export const MoodLogSchema = z.object({
  id:        z.string(),
  babyId:    z.string(),
  timestamp: z.string(),
  type:      z.literal('mood'),
  version:   z.number(),
  data: z.object({
    emoji:   z.string(),
    tags:    z.array(z.string()).optional(),
    subtype: z.enum(['happy', 'sad', 'angry', 'neutral']).optional(),
  }),
});

export const HealthLogSchema = z.object({
  id:        z.string(),
  babyId:    z.string(),
  timestamp: z.string(),
  type:      z.literal('health'),
  version:   z.number(),
  data: z.object({
    subtype:     z.string().optional(),
    temperature: z.number().optional(),
    symptoms:    z.array(z.string()).optional(),
    notes:       z.string().optional(),
  }),
});

export const NoteLogSchema = z.object({
  id:        z.string(),
  babyId:    z.string(),
  timestamp: z.string(),
  type:      z.literal('note'),
  version:   z.number(),
  data: z.object({
    text: z.string(),
  }),
});

export const LogEntrySchema = z.discriminatedUnion('type', [
  SleepLogSchema,
  FeedingLogSchema,
  DiaperLogSchema,
  MoodLogSchema,
  HealthLogSchema,
  NoteLogSchema,
]);

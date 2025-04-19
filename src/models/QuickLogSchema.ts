// src/models/QuickLogSchema.ts
import { z } from 'zod';

export type QuickLogType =
  | 'sleep'
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
  
  export const HealthLogSchema = z.object({
      id: z.string(),
      babyId: z.string(),
      timestamp: z.string(),
      type: z.literal('health'),
      version: z.number(),
      data: z.object({
        temperature: z.number().optional(),
        symptoms: z.array(z.string()).optional(),
        notes: z.string().optional(),
      }),
    });

  export const FeedingLogSchema = z.object({
    id: z.string(),
    babyId: z.string(),
    timestamp: z.string(),
    type: z.literal('feeding'),
    version: z.number(),
    data: z.object({
      method: z.enum(['bottle', 'breast', 'solid']),
      quantity: z.number().optional(),
      notes: z.string().optional(),
    }),
  });
  
  export const DiaperLogSchema = z.object({
    id: z.string(),
    babyId: z.string(),
    timestamp: z.string(),
    type: z.literal('diaper'),
    version: z.number(),
    data: z.object({
      status: z.enum(['wet', 'dirty', 'both']),
      notes: z.string().optional(),
    }),
  });
  
  export const MoodLogSchema = z.object({
    id: z.string(),
    babyId: z.string(),
    timestamp: z.string(),
    type: z.literal('mood'),
    version: z.number(),
    data: z.object({
      emoji: z.string(),
      tags: z.array(z.string()).optional(),
    }),
  });
  
  export const NoteLogSchema = z.object({
    id: z.string(),
    babyId: z.string(),
    timestamp: z.string(),
    type: z.literal('note'),
    version: z.number(),
    data: z.object({
      text: z.string(),
    }),
  });  
  
  export const QuickLogEntrySchema = z.discriminatedUnion('type', [
    SleepLogSchema,
    HealthLogSchema,
    FeedingLogSchema,
    DiaperLogSchema,
    MoodLogSchema,
    NoteLogSchema,
  ]);
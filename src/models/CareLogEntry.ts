// src/models/CareLogEntry.ts
export interface CareLogEntry {
    id: string;
    date: string;          // e.g. "2023-08-25"
    timestamp: string;     // full ISO; e.g. "2023-08-25T14:30:00.000Z"
    type: 'feeding' | 'diaper' | 'sleep' | 'health' | 'note' | 'mood';
  payload?: Record<string, any>;
  }
  
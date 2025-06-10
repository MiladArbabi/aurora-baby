// src/models/InferredLog.ts
import { LogEntry } from './LogSchema';

export type InferredLogEntry = LogEntry & {
  /** Confidence (0.0–1.0) that this entry is correct. */
  confidence?: number;
};

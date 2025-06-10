// src/models/InferredLog.ts
import { QuickLogEntry } from './LogSchema';

export type InferredLogEntry = QuickLogEntry & {
  /** Confidence (0.0–1.0) that this entry is correct. */
  confidence?: number;
};

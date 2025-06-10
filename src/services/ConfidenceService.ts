// src/services/ConfidenceService.ts
import AsyncStorage from '@react-native-async-storage/async-storage';
import { InferredLogEntry } from '../models/InferredLog';
import { LogEntry } from '../models/LogSchema';

const FEEDBACK_STORAGE_KEY = '@inferred_log_feedback';

/**
 * 1) Attach a “stub” confidence score to each incoming inferred log.
 *    In a real rollout, you’d call out to a model or remote endpoint to get a score.
 *    For now, we’ll generate a random confidence between 0.6 and 0.95.
 */
export async function scoreInferredLogs(
  entries: LogEntry[]
): Promise<InferredLogEntry[]> {
  return entries.map((entry) => {
    const confidence = parseFloat(
      (0.6 + Math.random() * 0.35).toFixed(2)
    );
    return {
      ...entry,
      confidence,
    };
  });
}

/**
 * 2) Submit parent feedback (“wasCorrect”): store locally in AsyncStorage.
 *    Format: { [logId]: true | false }
 */
type FeedbackMap = Record<string, boolean>;

export async function submitLogFeedback(
  entryId: string,
  wasCorrect: boolean
): Promise<void> {
  try {
    const raw = await AsyncStorage.getItem(FEEDBACK_STORAGE_KEY);
    const current: FeedbackMap = raw ? JSON.parse(raw) : {};
    current[entryId] = wasCorrect;
    await AsyncStorage.setItem(FEEDBACK_STORAGE_KEY, JSON.stringify(current));
  } catch (err) {
    console.warn('[ConfidenceService] could not save feedback', err);
  }
}

/**
 * 3) Retrieve all stored feedback (so later we can upload it or retrain a model).
 */
export async function getAllLogFeedback(): Promise<FeedbackMap> {
  const raw = await AsyncStorage.getItem(FEEDBACK_STORAGE_KEY);
  return raw ? (JSON.parse(raw) as FeedbackMap) : {};
}

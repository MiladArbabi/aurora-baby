// src/services/LlamaLogGenerator.ts
import { QuickLogEntry } from '../models/QuickLogSchema';

// * Replace this with the correct host/IP for your setup: *
const SERVER_HOST = 'http://192.168.0.31:4000'; 
// • If on iOS simulator, you can keep 'http://localhost:4000'
// • If using a physical device, use 'http://192.168.x.y:4000'

export async function generateAIQuickLogs(
  recentLogs: QuickLogEntry[],
  hoursAhead = 24
): Promise<QuickLogEntry[]> {
  try {
    const payload = { recentLogs, hoursAhead };
    const resp = await fetch(`${SERVER_HOST}/api/futureLogs`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

    if (!resp.ok) {
      console.error(
        '[LlamaLogGenerator] server responded with',
        resp.status,
        resp.statusText
      );
      return [];
    }

    const aiEntries = (await resp.json()) as QuickLogEntry[];
    return aiEntries;
  } catch (err) {
    console.error('[LlamaLogGenerator] fetch failed:', err);
    return [];
  }
}

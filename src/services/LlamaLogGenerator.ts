import { LogEntry } from '../models/LogSchema';
import Constants from 'expo-constants';

const apiHost = Constants.expoConfig?.extra?.apiHost ??
                (Constants.expoConfig?.extra?.isDev
                  ? 'http://10.0.2.2:4000'
                  : 'http://localhost:4000');

export async function generateAILogs(
  recentLogs: LogEntry[],
  hoursAhead: number = 24
): Promise<LogEntry[]> {
  if (!Array.isArray(recentLogs) || recentLogs.length === 0) {
    throw new Error('recentLogs must be a non-empty array');
  }
  if (!Number.isInteger(hoursAhead) || hoursAhead < 1 || hoursAhead > 48) {
    throw new Error('hoursAhead must be an integer between 1 and 48');
  }
  for (const log of recentLogs) {
    if (!log.id || !log.babyId || !log.timestamp || !log.type || !log.version || !log.data) {
      throw new Error('Each log must have id, babyId, timestamp, type, version, and data');
    }
  }

  try {
    const payload = { recentLogs, hoursAhead };
    const resp = await fetch(`${apiHost}/api/futureLogs`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

    if (!resp.ok) {
      console.error('[LlamaLogGenerator] server error:', resp.status, resp.statusText);
      throw new Error('Failed to generate logs');
    }

    const aiEntries = (await resp.json()) as LogEntry[];
    return aiEntries;
  } catch (err) {
    console.error('[LlamaLogGenerator] fetch failed:', err);
    throw new Error('Failed to connect to log generator');
  }
}
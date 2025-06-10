// src/services/SummarizeService.ts
import axios from 'axios';
import Constants from 'expo-constants';

const API_BASE = Constants.expoConfig?.extra?.apiHost || 'http://localhost:3000';

export async function summarizeLogsServerless(
  logs: Array<{ timestamp: string; event: string; details?: any }>,
  format: 'story' | 'narration' = 'story'
): Promise<{ summary: string; format: string }> {
  const res = await axios.post(
    `${API_BASE}/api/summarize-logs`,
    { logs, format },
    { headers: { 'Content-Type': 'application/json' } }
  );
  return res.data;
}

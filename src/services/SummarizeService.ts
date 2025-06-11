import axios from 'axios';
import Constants from 'expo-constants';

const { generateText, UNIVERSE_DEFS } = require('./llamaService');

interface Log {
  timestamp: string;
  type: string;
  data?: any;
}

async function summarizeLogs(logs: Log[], format = 'story') {
  if (!Array.isArray(logs) || logs.length === 0) {
    throw new Error('Logs must be a non-empty array');
  }
  for (const log of logs) {
    if (!log.timestamp || !log.type) {
      throw new Error('Each log must have timestamp and type');
    }
  }

  const bullets = logs.map((l) => {
    const time = new Date(l.timestamp).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true,
      timeZone: 'UTC',
    });
    let details = '';
    if (l.type === 'feeding' && l.data) {
      const unit = l.data.unit || 'oz';
      const subtype = l.data.subtype ? ` ${l.data.subtype}` : '';
      const quantity = l.data.quantity || 'unknown';
      details = `${l.data.method}-fed${subtype} ${quantity} ${unit}`;
    } else if (l.data) {
      details = JSON.stringify(l.data);
    }
    return `- ${time}: ${l.type} (${details})`;
  });

  const prompt = `
${format === 'story' ? UNIVERSE_DEFS : ''}

### Your task:
Write a short, child-friendly summary of the baby’s activities based on the logs below.
Use a warm, reassuring tone and address the user as "Parent".
${format === 'story' ? 'Include Aurora characters (e.g., Birk, Freya) to make it fun.' : 'Keep it simple and factual.'}
Use short sentences (≤ 10 words).
Do not introduce yourself or explain your role.
Focus only on the baby’s activities from the logs.

### Logs:
${bullets.join('\n')}

### Summary:
`;

  return generateText(prompt, {
    maxTokens: 400,
    temperature: 0.5, // Lower for stability
    stopTriggers: ['###'],
  });
}

const API_BASE = Constants.expoConfig?.extra?.apiHost || 'http://localhost:4000';

export interface LogEntry {
  id: string;
  babyId: string;
  timestamp: string;
  type: 'sleep' | 'feeding' | 'diaper' | 'mood' | 'health' | 'note';
  version: number;
  data: Record<string, any>;
}

export async function summarizeLogsServerless(
  logs: LogEntry[],
  format: 'story' | 'narration' = 'story'
): Promise<{ summary: string; format: string }> {
  const res = await axios.post(
    `${API_BASE}/summarize-logs`,
    { logs, format },
    { headers: { 'Content-Type': 'application/json' } }
  );
  return res.data;
}

module.exports = { summarizeLogs };
// src/services/LlamaLogGenerator.ts
import { generateCompletion } from './LlamaService';
import { QuickLogEntry } from '../models/QuickLogSchema';

/**
 * Ask Llama to predict future quick-logs based on recent history.
 * Returns an array of QuickLogEntry objects.
 */
export async function generateAIQuickLogs(
  recentLogs: QuickLogEntry[],
  hoursAhead = 24
): Promise<QuickLogEntry[]> {
  // 1. Build a prompt that lists recent logs and asks for JSON
  const prompt = `
I have these baby logs for the last 24h:
${JSON.stringify(recentLogs, null, 2)}

Please suggest ${hoursAhead / 2} future quick-log entries over the next ${hoursAhead} hours.
Output only valid JSON: an array of objects matching QuickLogEntry:
[
  { "id": "...", "babyId": "...", "timestamp": "ISO timestamp", "type": "...", "data": { ... } },
  ...
]
`;

  // 2. Call your LlamaService
  const response = await generateCompletion(prompt);

  // 3. Parse the JSON blob
  let aiEntries: QuickLogEntry[];
  try {
    aiEntries = JSON.parse(response) as QuickLogEntry[];
  } catch (e) {
    console.error('Failed to parse AI response as JSON:', response);
    return [];
  }

  // 4. (Optionally) validate each entry against your Zod schema
  return aiEntries;
}

export async function askWhispr(
  prompt: string
): Promise<string> {
  // delegate to your LlamaService generateCompletion
  return generateCompletion(prompt)
}
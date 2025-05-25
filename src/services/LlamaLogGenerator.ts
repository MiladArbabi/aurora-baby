// src/services/LlamaLogGenerator.ts
import { generateCompletion } from './LlamaService';
import { QuickLogEntry } from '../models/QuickLogSchema';
import { getChildProfile } from './ChildProfileAccess';

// Utility: calculate full years from an ISO DOB string
function calculateAgeYears(dobStr: string): number {
  const dob = new Date(dobStr);
  const diff = Date.now() - dob.getTime();
  return Math.floor(diff / (1000 * 60 * 60 * 24 * 365));
}

/**
 * Ask Llama to predict future quick-logs based on recent history.
 * Returns an array of QuickLogEntry objects.
 */
export async function generateAIQuickLogs(
  recentLogs: QuickLogEntry[],
  hoursAhead = 24
): Promise<QuickLogEntry[]> {
  // 1. Build a prompt that lists recent logs and asks for JSON
// 1) get baby context
const profile = await getChildProfile();
const name = profile?.name ?? 'Baby';
const age = profile?.dob ? calculateAgeYears(profile.dob) : null;
const themes = profile?.themePreferences?.join(', ') || 'no specific themes';

// 2) build prompt including their context
const prompt = `
Child’s name: ${name}${ age!==null ? `, age: ${age} years` : '' }
Loves themes: ${themes}

Here are their logs for the last 24h:
${JSON.stringify(recentLogs, null, 2)}

Please suggest ${hoursAhead/2} future quick-log entries over the next ${hoursAhead} hours.
Output only valid JSON: an array of QuickLogEntry objects:
[
  { "id": "...", "babyId": "...", "timestamp": "ISO timestamp", "type": "...", "data": { ... } },
  …
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

export async function askWhispr(userPrompt: string): Promise<string> {
  const profile = await getChildProfile();
  const name = profile?.name ?? 'Baby';
  const age = profile?.dob ? calculateAgeYears(profile.dob) : null;
  const themes = profile?.themePreferences?.join(', ') || 'no specific themes';

  const fullPrompt = `
  Child’s name: ${name}${ age!==null ? `, age: ${age} years` : '' }
  Loves themes: ${themes}

  ${userPrompt}
  `;
  return generateCompletion(fullPrompt);
}
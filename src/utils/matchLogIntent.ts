// src/utils/matchLogIntent.ts
export type LogType = 'sleep' | 'feeding' | 'diaper' | 'mood' | 'health' | 'note';

export function matchLogIntent(transcript: string): LogType | null {
  const t = transcript.toLowerCase();
  if (/sleep|nap|woke up/.test(t)) return 'sleep';
  if (/feed|bottle|breast|eat|ate/.test(t)) return 'feeding';
  if (/diaper|pee|poo|changed/.test(t)) return 'diaper';
  if (/mood|happy|sad|angry|calm/.test(t)) return 'mood';
  if (/health|fever|temperature|sick/.test(t)) return 'health';
  if (/note|remember|memo/.test(t)) return 'note';
  return null;
}

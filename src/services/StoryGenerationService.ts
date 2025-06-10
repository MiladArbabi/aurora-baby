import { fetchLogsForDate } from './logService';
import { fetchAllMetasForSlices } from './LogSliceMetaService';
import { getStoryInputFromLogs, StoryInput } from './StoryInputService';
import { queryStory, GeneratedStory } from './StoryService';
import { setCache, getCache } from './cache';

// for log-based storytelling, returns just the string story text, cached per date.
export async function generateHarmonyStory(
  babyId: string,
  dateISO: string
): Promise<string> {
  if (!babyId.match(/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/)) {
    throw new Error('Invalid babyId format');
  }
  if (!dateISO.match(/^\d{4}-\d{2}-\d{2}$/)) {
    throw new Error('Invalid dateISO format (YYYY-MM-DD)');
  }

  const cacheKey = `story:${babyId}:${dateISO}`;
  const cached = await getCache<GeneratedStory>(cacheKey);
  if (cached) {
    return cached.story;
  }

  const logs = await fetchLogsForDate(babyId, dateISO);
  const metasArray = await fetchAllMetasForSlices(
    babyId,
    logs.map((l) => l.id)
  );
  const metas: Record<string, import('models/LogSliceMeta').LogSliceMeta> =
    Object.fromEntries(metasArray.map((m) => [m.id, m]));

  const storyInput = getStoryInputFromLogs(logs, metas, dateISO, babyId);
  const promptPayload = JSON.stringify(storyInput);
  const response = await queryStory(promptPayload);

  await setCache(cacheKey, response, 24 * 3600); // Cache for 1 day
  return response.story;
}

// for free-form prompts, returns { title, story } so you can display/sort/cache by title.
export async function generateOrGetStory(prompt: string): Promise<GeneratedStory> {
  if (!prompt || typeof prompt !== 'string' || prompt.length > 500) {
    throw new Error('Prompt must be a non-empty string (max 500 chars)');
  }

  const cacheKey = `story:prompt:${prompt}`;
  const cached = await getCache<GeneratedStory>(cacheKey);
  if (cached) {
    return cached;
  }

  const response = await queryStory(prompt);
  await setCache(cacheKey, response, 24 * 3600);
  return response;
}
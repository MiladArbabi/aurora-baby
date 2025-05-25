// src/services/StoryGenerationService.ts
import { queryWhispr } from './WhisprService';
import { getUserStories, saveUserStory } from './UserStoriesService';
import { StoryCardData } from '../types/HarmonyFlatList';

/** Simple string→number hash */
function hashCode(str: string): string {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = ((hash << 5) - hash) + str.charCodeAt(i);
    hash |= 0;
  }
  return Math.abs(hash).toString();
}

/**
 * Generate (or retrieve cached) story for a given prompt.
 */
export async function generateOrGetStory(prompt: string): Promise<StoryCardData> {
const id = `gen-${hashCode(prompt)}`;

  // 1) See if we’ve already generated this prompt
  let existing: StoryCardData[];
  try {
    existing = await getUserStories();
  } catch (err) {
    console.warn(`[StoryGen] failed to read cache, proceeding with empty list:`, err);
    existing = [];
  }
  const cached = existing.find(s => s.id === id);

  if (cached) {
    console.log(`[StoryGen] CACHE HIT for prompt: "${prompt}" → id=${id}`);
    return cached;
  }

  // 2) Otherwise, ask the AI
  console.log(`[StoryGen] CACHE MISS for prompt: "${prompt}", generating…`);
  const fullStory = await queryWhispr(prompt);

  // 3) Construct a StoryCardData and cache it
  const card: StoryCardData = {
    id,
    title: prompt.slice(0, 20) + '…',
    thumbnail: 'local://custom.png',
    type: 'generated',
    ctaLabel: 'Play',
    cardColor: 'peach',
    moodTags: [],
    fullStory,
    tags: []
  };
  
    try {
    await saveUserStory(card);
  } catch (err) {
    console.warn(`[StoryGen] failed to write cache for "${id}":`, err);
  }

  return card;
}

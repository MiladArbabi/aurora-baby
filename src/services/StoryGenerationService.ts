// src/services/StoryGenerationService.ts
import { queryStory, GeneratedStory } from './StoryService';
import { getUserStories, saveUserStory } from './UserStoriesService';
import { StoryCardData } from '../types/HarmonyFlatList';
import { harmonySections } from '../data/harmonySections';
import itemSchema    from '../data/universerules/itemList.json';
import factionSchema from '../data/universerules/factionList.json';
import locationSchema from '../data/universerules/locationList.json';
import { logEvent } from '../utils/analytics';

/** Minimal shape of each JSON-Schema `properties` entry. **/
interface SchemaProp {
  description: string;
}

/** Configuration & constants **/
const BANNED_KEYWORDS = ['violence', 'sex', 'drugs', 'gore', 'hate'] as const;
type BannedKeyword = typeof BANNED_KEYWORDS[number];

/** Turn a JSON-Schema `properties` block into a simple name/description list. **/
function parseSchemaList(schema: { properties: Record<string, SchemaProp> }) {
  return Object.entries(schema.properties).map(([name, { description }]) => ({ name, description }));
}

/** Lists of standardized universe elements */
const items    = parseSchemaList(itemSchema);
const factions = parseSchemaList(factionSchema);
const locations= parseSchemaList(locationSchema);

/** Build the “Aurora Universe Rules” preamble for every prompt. */
function buildMetadataPrompt(): string {
  const listToText = (list: { name: string; description: string }[]) =>
    list.map(({ name, description }) => `- ${name}: ${description}`).join('\n');

  return [
    '### Aurora Universe Rules:',
    'Use only the characters, items, and locations provided.',
    '',
    'Items:',
    listToText(items),
    '',
    'Factions:',
    listToText(factions),
    '',
    'Locations:',
    listToText(locations),
  ].join('\n');
}

/**
 * Simple deterministic “hash” → used to generate a stable story ID per prompt.
 * @param str arbitrary user prompt
 * @returns non-negative integer as string
 */
function hashCode(str: string): string {
  let hash = 0;
  for (const ch of str) {
    hash = ((hash << 5) - hash) + ch.charCodeAt(0);
    hash |= 0;
  }
  return Math.abs(hash).toString();
}

/**
 * Check generated text against simple banned-keyword filter.
 * @returns true if any banned keyword found
 */
function containsBannedContent(text: string): boolean {
  const lower = text.toLowerCase();
  return BANNED_KEYWORDS.some(k => lower.includes(k));
}

/**
 * Main entrypoint: generate or fetch a cached story card.
 * @param prompt the user’s story prompt
 */
export async function generateOrGetStory(
  prompt: string
): Promise<StoryCardData> {
  const storyId = `gen-${hashCode(prompt)}`;
  let existing: StoryCardData[] = [];
  
  // 1) Try to load from cache
  const cached = existing.find(s => s.id === storyId);
  if (cached) {
    console.log(`[StoryGen] CACHE HIT for prompt="${prompt}" → id=${storyId}`);
    return cached;
  }

  try { existing = await getUserStories(); }
  catch (err) { console.warn('[StoryGen] cache load failed:', err); }

  // 2) Generate new story
  console.log(`[StoryGen] CACHE MISS for prompt="${prompt}", calling AI…`);

   // Track generate request
   logEvent('story_generate_request', {
    promptHash: storyId,
    wasCached: !!(await getUserStories()).find(s => s.id === storyId),
  });

  // We now let the server stitch in the universe‐rules for us
  const { story: fullStory, title: rawTitle } = await queryStory(prompt);

  // 3) Safety guard
  if (containsBannedContent(fullStory)) {
    console.warn('[StoryGen] unsafe content detected, falling back to a prebuilt story');
    const fallbackStories = harmonySections.flatMap(sec => sec.data);
    return fallbackStories[Math.floor(Math.random() * fallbackStories.length)];
  }

  // 4) Build the card and cache it
  // normalize to Title Case
  const title = rawTitle
  .toLowerCase()
  .split(' ')
  .map(word => word.charAt(0).toUpperCase() + word.slice(1))
  .join(' ');

  const card: StoryCardData = {
    id: storyId,  
    title,
    fullStory,
    thumbnail: '',
    type: 'generated',
    tags: [],
  }
  
  try { await saveUserStory(card); }
  catch (err) { console.warn('[StoryGen] cache save failed:', err); }

  return card;
}

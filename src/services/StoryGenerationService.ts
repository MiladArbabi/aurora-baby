// src/services/StoryGenerationService.ts
import { queryWhispr } from './WhisprService';
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
 * Ask Whispr for a concise, child-friendly title.
 * Falls back to a truncated version of the prompt on error.
 */
async function generateTitle(fullStory: string, defaultTitle: string): Promise<string> {
  const titlePrompt = [
    buildMetadataPrompt(),
    '',
    'Here is a story:',
    fullStory,
    '',
    'Now give it a very short, child-friendly title (max 5 words):',
  ].join('\n');

  try {
    const raw = await queryWhispr(titlePrompt);
    return raw.split('\n')[0].trim() || defaultTitle;
  } catch (err) {
    console.warn('[StoryGen] title generation failed, using default:', err);
    return defaultTitle;
  }
}

/**
 * Main entrypoint: generate or fetch a cached story card.
 * @param prompt the user’s story prompt
 */
export async function generateOrGetStory(prompt: string): Promise<StoryCardData> {
  const storyId = `gen-${hashCode(prompt)}`;

  // 1) Attempt to load from cache
  let existing: StoryCardData[] = [];
  try { existing = await getUserStories(); }
  catch (err) { console.warn('[StoryGen] cache load failed:', err); }
  const cached = existing.find(s => s.id === storyId);
  if (cached) {
    console.log(`[StoryGen] CACHE HIT for prompt="${prompt}" → id=${storyId}`);
    return cached;
  }

  // 2) Generate new story
  console.log(`[StoryGen] CACHE MISS for prompt="${prompt}", calling AI…`);

   // Track generate request
   logEvent('story_generate_request', {
    promptHash: storyId,
    wasCached: !!(await getUserStories()).find(s => s.id === storyId),
  });

  const metadata = buildMetadataPrompt();
  const aiPrompt = `${metadata}\n\n### Prompt:\n${prompt}\n\nStory:`;
  const fullStory = await queryWhispr(aiPrompt);

  // 3) Safety guard
  if (containsBannedContent(fullStory)) {
    console.warn('[StoryGen] unsafe content detected, falling back to a prebuilt story');
    const fallbackStories = harmonySections.flatMap(sec => sec.data);
    return fallbackStories[Math.floor(Math.random() * fallbackStories.length)];
  }

  // 4) Generate a fitting title
  const defaultTitle = prompt.slice(0, 20) + '…';
  const title = await generateTitle(fullStory, defaultTitle);

  // 5) Build the card and cache it
  const card: StoryCardData = {
    id: storyId,
    title,
    thumbnail: 'local://custom.png',
    type: 'generated',
    ctaLabel: 'Play',
    cardColor: 'peach',
    moodTags: [],
    fullStory,
    tags: [],
  };
  try { await saveUserStory(card); }
  catch (err) { console.warn('[StoryGen] cache save failed:', err); }

  return card;
}

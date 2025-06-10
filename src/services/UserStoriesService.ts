import AsyncStorage from '@react-native-async-storage/async-storage';
import { StoryCardData } from '../types/HarmonyFlatList';
import { getBabyProfile } from '../storage/BabyProfileStorage';
import { harmonySections } from '../data/harmonySections';
import { setCache, getCache } from './cache';

const STORAGE_KEY = 'user_stories';
const RECOMMENDATIONS_CACHE_KEY = 'recommended_stories';

const allPrebuilt: StoryCardData[] = harmonySections.flatMap(sec => sec.data);

export async function saveUserStory(story: StoryCardData): Promise<void> {
  try {
    if (!story.id) throw new Error('Story must have an id');
    const existing = await getUserStories();
    const updated = [story, ...existing.filter(s => s.id !== story.id)];
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  } catch (err) {
    console.error('[UserStoriesService] saveUserStory error:', err);
  }
}

export async function getUserStories(): Promise<StoryCardData[]> {
  try {
    const json = await AsyncStorage.getItem(STORAGE_KEY);
    return json ? JSON.parse(json) : [];
  } catch (err) {
    console.error('[UserStoriesService] getUserStories error:', err);
    return [];
  }
}

export async function deleteUserStory(storyId: string): Promise<void> {
  try {
    if (!storyId) throw new Error('StoryId must be non-empty');
    const existing = await getUserStories();
    const filtered = existing.filter(story => story.id !== storyId);
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(filtered));
  } catch (err) {
    console.error('[UserStoriesService] deleteUserStory error:', err);
  }
}

function calculateAgeYears(dobStr: string): number | null {
  try {
    const dob = new Date(dobStr);
    if (isNaN(dob.getTime())) return null;
    const diffMs = Date.now() - dob.getTime();
    return Math.floor(diffMs / (1000 * 60 * 60 * 24 * 365));
  } catch (err) {
    console.error('[UserStoriesService] calculateAgeYears error:', err);
    return null;
  }
}

export async function getRecommendedStories(): Promise<StoryCardData[]> {
  const cached = await getCache<StoryCardData[]>(RECOMMENDATIONS_CACHE_KEY);
  if (cached) {
    return cached;
  }

  try {
    const profile = await getBabyProfile();
    const prefs = profile?.personality ?? [];
    const age = profile?.birthDate ? calculateAgeYears(profile.birthDate) : null;

    const scored = allPrebuilt.map(s => {
      const tagMatches = s.tags.filter(t => prefs.includes(t)).length;
      const ageScore = (age !== null && s.ageRange && age >= s.ageRange[0] && age <= s.ageRange[1]) ? 1 : 0;
      const favScore = s.favoritesCount ?? 0;
      return { story: s, score: tagMatches * 2 + ageScore * 1 + favScore * 0.1 };
    });

    const result = scored
      .sort((a, b) => b.score - a.score)
      .map(x => x.story);

    await setCache(RECOMMENDATIONS_CACHE_KEY, result, 24 * 3600); // Cache for 1 day
    return result;
  } catch (err) {
    console.error('[UserStoriesService] getRecommendedStories error:', err);
    return allPrebuilt.slice(0, 10); // Fallback to top 10 prebuilt stories
  }
}
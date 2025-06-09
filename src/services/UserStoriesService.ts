// src/services/UserStoriesService.ts
import AsyncStorage from '@react-native-async-storage/async-storage';
import { StoryCardData } from '../types/HarmonyFlatList';
import { getBabyProfile } from '../storage/BabyProfileStorage';
import { harmonySections } from '../data/harmonySections';

const STORAGE_KEY = 'user_stories';

const allPrebuilt: StoryCardData[] = harmonySections.flatMap(sec => sec.data);

export async function saveUserStory(story: StoryCardData): Promise<void> {
  const existing = await getUserStories();
  const updated = [story, ...existing.filter(s => s.id !== story.id)];
  await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
}

export async function getUserStories(): Promise<StoryCardData[]> {
  const json = await AsyncStorage.getItem(STORAGE_KEY);
  return json ? JSON.parse(json) : [];
}

export async function deleteUserStory(storyId: string): Promise<void> {
  const existing = await getUserStories();
  const filtered = existing.filter(story => story.id !== storyId);
  await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(filtered));
}

// Utility to calculate age in years from ISO dob string
function calculateAgeYears(dobStr: string): number {
  const dob = new Date(dobStr);
  const diffMs = Date.now() - dob.getTime();
  return Math.floor(diffMs / (1000 * 60 * 60 * 24 * 365));
}

export async function getRecommendedStories(): Promise<StoryCardData[]> {
  const profile = await getBabyProfile();
  const prefs = profile?.personality ?? [];
  const age = profile ? calculateAgeYears(profile.birthDate) : null;

  // Score each story
  const scored = allPrebuilt.map(s => {
    const tagMatches = s.tags.filter(t => prefs.includes(t)).length;
    const ageScore = (age && s.ageRange && age >= s.ageRange[0] && age <= s.ageRange[1]) ? 1 : 0;
    const favScore = s.favoritesCount ?? 0;
    return { story: s, score: tagMatches * 2 + ageScore * 1 + favScore * 0.1 };
  });

  // Sort descending
  return scored
    .sort((a, b) => b.score - a.score)
    .map(x => x.story);
}



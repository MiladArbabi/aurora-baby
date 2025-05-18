import AsyncStorage from '@react-native-async-storage/async-storage';
import { StoryCardData } from '../types/HarmonyFlatList';

const STORAGE_KEY = 'user_stories';

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

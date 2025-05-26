// src/services/StoryService.ts
import axios from 'axios';
import Constants from 'expo-constants';

// Read apiHost from EAS config; fallback to localhost for web and iOS simulator
const apiHost = Constants.expoConfig?.extra?.apiHost ??
                (Constants.expoConfig?.extra?.isDev
                  ? 'http://10.0.2.2:4000' // Android emulator
                  : 'http://localhost:4000');

export async function queryStory(prompt: string): Promise<string> {
  const res = await axios.post(`${apiHost}/api/story/generate`, { prompt });
  return res.data.story;
}

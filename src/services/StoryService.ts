import axios from 'axios';
import Constants from 'expo-constants';

export interface GeneratedStory {
  id?: string;
  title: string;
  story: string;
}

const apiHost = Constants.expoConfig?.extra?.apiHost ??
                (Constants.expoConfig?.extra?.isDev
                  ? 'http://10.0.2.2:4000'
                  : 'http://localhost:4000');

export async function queryStory(prompt: string): Promise<GeneratedStory> {
  if (!prompt || typeof prompt !== 'string' || prompt.length > 500) {
    throw new Error('Prompt must be a non-empty string (max 500 chars)');
  }

  try {
    const res = await axios.post<{ title: string; story: string }>(
      `${apiHost}/api/story/generate`,
      { prompt },
      { headers: { 'Content-Type': 'application/json' } }
    );
    return res.data;
  } catch (err) {
    console.error('[StoryService] error:', err);
    throw new Error('Failed to generate story, please try again');
  }
}
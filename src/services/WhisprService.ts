// src/services/WhisprService.ts
import axios from 'axios';
import Constants from 'expo-constants';

// Read apiHost from EAS config; fallback to localhost for web and iOS simulator
const apiHost = Constants.expoConfig?.extra?.apiHost ??
                (Constants.expoConfig?.extra?.isDev
                  ? 'http://10.0.2.2:4000' // Android emulator
                  : 'http://localhost:4000');

export async function queryWhispr(prompt: string): Promise<string> {
  try {
    const response = await axios.post(
      `${apiHost}/api/whispr/query`,
      { prompt }
    );
    return response.data.reply;
  } catch (err) {
    console.error('WhisprService error:', err);
    throw err;
  }
}
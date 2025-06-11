// src/services/WhisprService.ts
import axios from 'axios';
import Constants from 'expo-constants';

const apiHost = Constants.expoConfig?.extra?.apiHost ??
                (Constants.expoConfig?.extra?.isDev
                  ? 'http://10.0.2.2:4000'
                  : 'http://localhost:4000');

export async function queryWhispr(prompt: string): Promise<string> {
  if (!prompt || typeof prompt !== 'string' || prompt.length > 500) {
    throw new Error('Prompt must be a non-empty string (max 500 chars)');
  }

  try {
    const response = await axios.post(
      // hit the same endpoint you just tested with curl
      `${apiHost}/api/whispr-voice/voice-response`,
      { query: prompt },
      { headers: { 'Content-Type': 'application/json' } }
    );
    // whisprVoiceRoute returns { response: string }
    return response.data.response;
  } catch (err) {
    console.error('[WhisprService] error:', err);
    throw new Error('Failed to connect to Whispr, please try again');
  }
}
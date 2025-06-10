import AsyncStorage from '@react-native-async-storage/async-storage';
import Tts from 'react-native-tts';
import i18n from '../localization';

interface VoiceProfile {
  language: string;
  rate: number;
  pitch: number;
}

const profiles: Record<string, VoiceProfile> = {
  default: { language: 'en-US', rate: 0.9, pitch: 1.0 },
  story: { language: 'en-US', rate: 0.85, pitch: 1.0 },
  alert: { language: 'en-US', rate: 1.0, pitch: 1.2 },
  soothing: { language: 'en-US', rate: 0.7, pitch: 0.9 },
};

const GLOBAL_RATE_OVERRIDE_KEY = '@tts_rate_override';

export async function setGlobalRateOverride(rate: number | null): Promise<void> {
  try {
    if (rate === null) {
      await AsyncStorage.removeItem(GLOBAL_RATE_OVERRIDE_KEY);
    } else if (typeof rate === 'number' && rate >= 0.0 && rate <= 1.0) {
      await AsyncStorage.setItem(GLOBAL_RATE_OVERRIDE_KEY, rate.toString());
    } else {
      throw new Error('Rate must be between 0.0 and 1.0');
    }
  } catch (err) {
    console.error('[TTSService] setGlobalRateOverride error:', err);
  }
}

export async function getGlobalRateOverride(): Promise<number | null> {
  try {
    const raw = await AsyncStorage.getItem(GLOBAL_RATE_OVERRIDE_KEY);
    if (!raw) return null;
    const parsed = parseFloat(raw);
    return isNaN(parsed) ? null : parsed;
  } catch (err) {
    console.error('[TTSService] getGlobalRateOverride error:', err);
    return null;
  }
}

let ttsReady = false;
Tts.getInitStatus()
  .then(() => {
    ttsReady = true;
    const def = profiles.default;
    Tts.setDefaultLanguage(def.language);
    Tts.setDefaultPitch(def.pitch);
    Tts.setDefaultRate(def.rate, true);
  })
  .catch(err => console.warn('[TTSService] TTS init failed:', err));

let chunks: string[] = [];
let currentIndex = 0;
let isPausedLocal = false;

function splitIntoChunks(text: string): string[] {
  if (!text || typeof text !== 'string') {
    return [];
  }
  return (
    text
      .match(/[^\.!\?]+[\.!\?]+(\s|$)/g)
      ?.map(s => s.trim()) || [text]
  );
}

function checkTtsReady(): void {
  if (!ttsReady) {
    throw new Error('TTS not initialized');
  }
}

async function speakChunks(resolve: () => void, reject: (e: any) => void) {
  checkTtsReady();
  Tts.removeAllListeners('tts-finish');
  Tts.removeAllListeners('tts-error');

  Tts.addEventListener('tts-finish', () => {
    if (isPausedLocal) return;
    currentIndex++;
    if (currentIndex < chunks.length) {
      Tts.speak(chunks[currentIndex]);
    } else {
      resolve();
    }
  });

  Tts.addEventListener('tts-error', e => reject(e));

  Tts.speak(chunks[currentIndex]);
}

export async function speakWithProfile(
  text: string,
  profileName: keyof typeof profiles
): Promise<void> {
  if (!text || typeof text !== 'string' || text.length > 10000) {
    throw new Error('Text must be a non-empty string (max 10000 chars)');
  }

  checkTtsReady();
  const chosen = profiles[profileName] || profiles.default;
  Tts.setDefaultLanguage(chosen.language);
  Tts.setDefaultPitch(chosen.pitch);

  const override = await getGlobalRateOverride();
  Tts.setDefaultRate(override !== null ? override : chosen.rate, true);

  chunks = splitIntoChunks(text);
  currentIndex = 0;
  isPausedLocal = false;

  return new Promise((resolve, reject) => {
    speakChunks(resolve, reject);
  });
}

export function pause(): void {
  checkTtsReady();
  isPausedLocal = true;
  Tts.stop();
}

export function resume(): void {
  checkTtsReady();
  if (!isPausedLocal) return;
  isPausedLocal = false;
  Tts.speak(chunks[currentIndex]);
}

export function stop(): void {
  checkTtsReady();
  isPausedLocal = true;
  currentIndex = 0;
  Tts.stop();
}
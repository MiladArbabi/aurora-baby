// src/services/TTSService.ts
import { NativeModules } from 'react-native';

export function speak(text: string): Promise<void> {
  const { ExpoSpeech } = NativeModules as { ExpoSpeech?: any };
  if (!ExpoSpeech || typeof ExpoSpeech.speak !== 'function') {
    // no TTS available → no-op
    return Promise.resolve();
  }

  return new Promise((resolve, reject) => {
    try {
      ExpoSpeech.speak(text, {
        onDone: () => resolve(),
        onError: (err: any) => reject(err),
      });
    } catch {
      // if something else goes wrong, swallow it
      resolve();
    }
  });
}
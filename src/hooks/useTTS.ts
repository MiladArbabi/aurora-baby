// src/hooks/useTTS.ts
import * as Speech from 'expo-speech';

export function useTTS() {
  const speak = (text: string) => {
    Speech.speak(text, {
      language: 'en-US',
      // you can add pitch, rate, onDone callbacks, etc.
    });
  };
  const stop = () => {
    Speech.stop();
  };
  return { speak, stop };
}
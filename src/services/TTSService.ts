// src/services/TTSService.ts
import Tts from 'react-native-tts';

let ttsReady = false;
Tts.getInitStatus()
  .then(() => {
    ttsReady = true;
    Tts.setDefaultLanguage('en-US');
    Tts.setDefaultPitch(1.0);
    Tts.setDefaultRate(0.9);
  })
  .catch(err => console.warn('TTS init failed, no-op:', err));

  // internal state
let chunks: string[] = [];
let currentIndex = 0;
let isPausedLocal = false;

// simple sentence splitter
function splitIntoChunks(text: string): string[] {
  return text.match(/[^\.!\?]+[\.!\?]+(\s|$)/g)?.map(s => s.trim()) 
         || [text];
}

export function speak(text: string, rate?: number): Promise<void> {
    if (ttsReady && rate != null) {
       // cross-platform: setDefaultRate(rate, skipTransform?)
       Tts.setDefaultRate(rate, true);
    }

  // prepare chunk queue
  chunks = splitIntoChunks(text);
  currentIndex = 0;
  isPausedLocal = false;

  return new Promise((resolve, reject) => {
    // cleanup old listeners
    Tts.removeAllListeners('tts-finish');
    Tts.removeAllListeners('tts-error');

    // on each chunk finish...
    Tts.addEventListener('tts-finish', () => {
      if (isPausedLocal) {
        // paused—stop resolving until resume or stop called
        return;
      }
      currentIndex++;
      if (currentIndex < chunks.length) {
        // speak next chunk
        Tts.speak(chunks[currentIndex]);
      } else {
        resolve(); // done all chunks
      }
    });

    Tts.addEventListener('tts-error', (e) => reject(e));

    // start first chunk
    if (ttsReady) {
      Tts.speak(chunks[currentIndex]);
    } else {
      console.warn('speak() before init—no-op');
      resolve();
    }
  });
}

export function pause(): void {
  if (!ttsReady) return;
  isPausedLocal = true;
  Tts.stop();        // stops current chunk
}

export function resume(): void {
  if (!ttsReady || !isPausedLocal) return;
  isPausedLocal = false;
  // re-speak the current chunk from scratch
  Tts.speak(chunks[currentIndex]);
}

export function stop(): void {
  if (!ttsReady) return;
  isPausedLocal = true;
  currentIndex = 0;
  Tts.stop();
}
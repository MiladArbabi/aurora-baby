// src/services/VoiceService.ts

import { EventEmitter } from 'events';
import * as Speech from 'expo-speech';
import { NativeModules, NativeEventEmitter, Platform } from 'react-native';

// Event names for Expo speech won't emit progress natively, but we can shim later.
const emitter = new EventEmitter();

export interface VoiceServiceAPI {
  speak(text: string): Promise<void>;
  pause(): Promise<void>;
  resume(): Promise<void>;
  stop(): Promise<void>;
  setRate(rate: number): Promise<void>;
  setLocale(locale: string): Promise<void>;
  onProgress(listener: (percent: number) => void): void;
  onDone(listener: () => void): void;
}

class VoiceService implements VoiceServiceAPI {
  private rate = 1.0;
  private locale = 'en-US';

  async speak(text: string) {
    return new Promise<void>((resolve, reject) => {
      try {
        Speech.speak(text, {
          rate: this.rate,
          language: this.locale,
          onDone: () => {
            emitter.emit('done');
            resolve();
          },
          onError: (err) => {
            emitter.emit('done');
            reject(err);
          },
        });
      } catch (e) {
        emitter.emit('done');
        resolve();
      }
    });
  }

  async pause() {
    // expo-speech doesn’t natively support pause, so we stop.
    Speech.stop();
    return Promise.resolve();
  }

  async resume() {
    // no-op, or re-speak last chunk
    return Promise.resolve();
  }

  async stop() {
    Speech.stop();
    return Promise.resolve();
  }

  async setRate(rate: number) {
    this.rate = rate;
    return Promise.resolve();
  }

  async setLocale(locale: string) {
    this.locale = locale;
    return Promise.resolve();
  }

  onProgress(listener: (percent: number) => void) {
    emitter.addListener('progress', listener);
  }

  onDone(listener: () => void) {
    emitter.addListener('done', listener);
  }

  // stub for prefetch – maybe generate mp3 on server later
  async prefetch(_storyId: string) {
    return Promise.resolve();
  }
}

export default new VoiceService();

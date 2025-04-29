// src/services/STTService.ts
import Voice from '@react-native-voice/voice';

/**
 * Starts speech-to-text recognition and returns the final transcript.
 * @param language BCP-47 language tag, e.g. 'en-US'
 * @returns Promise that resolves with recognized text or rejects on error.
 */
export function listen(language: string = 'en-US'): Promise<string> {
  return new Promise((resolve, reject) => {
    let finished = false;

    // Helper to stop listening
    const stopListening = () => {
      Voice.stop().catch(() => {});
    };

    // Handler for successful speech results
    Voice.onSpeechResults = (e: { value?: string[] }) => {
      if (finished) return;
      finished = true;
      const transcript = e.value && e.value.length > 0 ? e.value[0] : '';
      stopListening();
      resolve(transcript);
    };

    // Handler for errors during speech recognition
    Voice.onSpeechError = (e: { error?: { message?: string } }) => {
      if (finished) return;
      finished = true;
      const msg = e.error?.message ?? 'Speech recognition error';
      stopListening();
      reject(new Error(msg));
    };

    // Start listening
    Voice.start(language).catch(err => {
      if (finished) return;
      finished = true;
      reject(err);
    });
  });
}
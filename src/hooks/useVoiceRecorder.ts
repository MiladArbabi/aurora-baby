// src/hooks/useVoiceRecorder.ts
import { useState, useEffect } from 'react';
import Voice from '@react-native-voice/voice';

export function useVoiceRecorder(language = 'en-US') {
  const [transcript, setTranscript] = useState<string>('');
  const [isListening, setIsListening] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    Voice.onSpeechStart = () => {
      setIsListening(true);
      setError(null);
      setTranscript('');
    };
    Voice.onSpeechResults = (e) => {
      if (e.value) setTranscript(e.value.join(' '));
    };
    Voice.onSpeechError = (e) => {
        const msg = e.error?.message ?? 'Speech recognition error';
        setError(msg);
        setIsListening(false);
      };
    return () => {
      Voice.destroy().then(Voice.removeAllListeners);
    };
  }, []);

  const start = async () => {
    try {
      await Voice.start(language);
    } catch (e: any) {
      setError(e.message);
    }
  };

  const stop = async () => {
    try {
      await Voice.stop();
      setIsListening(false);
    } catch (e: any) {
      setError(e.message);
    }
  };

  return { transcript, isListening, error, start, stop };
}
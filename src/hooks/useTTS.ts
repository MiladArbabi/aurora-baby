// src/hooks/useTTS.ts
import { useState, useEffect } from 'react';
import { speak as ttsSpeak, pause, resume, stop } from '../services/TTSService';
import { number } from 'zod';

export function useTTS() {
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isPaused, setIsPaused] = useState(false);

  const startSpeaking = async (text: string, rate?: number) => {
    if (isSpeaking && !isPaused) return;
    try {
      if (isPaused) {
        resume();
        setIsPaused(false);
      } else {
        await ttsSpeak(text, rate);
        setIsSpeaking(true);
      }
    } catch (error) {
      console.error('TTS Error:', error);
      setIsSpeaking(false);
      setIsPaused(false);
    }
  };

  const pauseSpeaking = async () => {
    if (isSpeaking && !isPaused) {
      try {
        pause();
        setIsPaused(true);
      } catch (error) {
        console.error('TTS Pause Error:', error);
      }
    }
  };

  const stopSpeaking = async () => {
    try {
      stop();
      setIsSpeaking(false);
      setIsPaused(false);
    } catch (error) {
      console.error('TTS Stop Error:', error);
    }
  };

  useEffect(() => {
    return () => {
      stop();
    };
  }, []);

  return {
    speak: startSpeaking,
    pause: pauseSpeaking,
    stop: stopSpeaking,
    isSpeaking,
    isPaused,
  };
}
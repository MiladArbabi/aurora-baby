// src/hooks/useVoice.ts

import { useState, useEffect, useCallback } from 'react'
import VoiceService from '../services/VoiceService'

export function useVoice() {
  // Playback state
  const [isSpeaking, setIsSpeaking] = useState(false)
  const [progress, setProgress]   = useState(0)       // 0.0 → 1.0
  const [duration, setDuration]   = useState<number | null>(null)

  // Play text
  const play = useCallback(async (text: string) => {
    if (!text) return
    setIsSpeaking(true)
    setProgress(0)
    try {
      await VoiceService.speak(text)
    } catch {
      // swallow errors
    }
    // onDone will fire after speak completes
  }, [])

  // Pause / Stop
  const pause = useCallback(async () => {
    await VoiceService.pause()
    setIsSpeaking(false)
  }, [])

  const stop = useCallback(async () => {
    await VoiceService.stop()
    setIsSpeaking(false)
    setProgress(0)
  }, [])

  // Rate & Locale
  const setRate = useCallback(async (r: number) => {
    await VoiceService.setRate(r)
  }, [])

  const setLocale = useCallback(async (l: string) => {
    await VoiceService.setLocale(l)
  }, [])

  // Subscribe to service events
  useEffect(() => {
    // When TTS finishes
    const doneHandler = () => {
      setIsSpeaking(false)
      setProgress(1)
    }
    VoiceService.onDone(doneHandler)

    // For future engines that emit progress
    const progHandler = (p: number) => {
      setProgress(p)
    }
    VoiceService.onProgress(progHandler)

    return () => {
      // Ideally remove listeners here
      // (our simple EventEmitter doesn’t expose remove; if it did: emitter.removeListener)
    }
  }, [])

  return {
    play,
    pause,
    stop,
    setRate,
    setLocale,
    isSpeaking,
    progress,
    duration,
  }
}

// src/services/TTSService.ts
import AsyncStorage from '@react-native-async-storage/async-storage'
import Tts from 'react-native-tts'
import i18n from '../localization';

// ─────────────────────────────────────────────────────────────────────────────
// 1) Voice‐profile definitions
// ─────────────────────────────────────────────────────────────────────────────
interface VoiceProfile {
  language: string
  rate: number      // default speaking rate (0.0–1.0)
  pitch: number     // default pitch (0.5–2.0)
}

// Add or tweak these presets as needed:
const profiles: Record<string, VoiceProfile> = {
  default:   { language: 'en-US', rate: 0.9, pitch: 1.0 },
  story:     { language: 'en-US', rate: 0.85, pitch: 1.0 },
  alert:     { language: 'en-US', rate: 1.0,  pitch: 1.2 },
  soothing:  { language: 'en-US', rate: 0.75, pitch: 0.9 },
}

// ─────────────────────────────────────────────────────────────────────────────
// 2) Global override key (for parents to adjust overall speed)
// ─────────────────────────────────────────────────────────────────────────────
const GLOBAL_RATE_OVERRIDE_KEY = '@tts_rate_override'

// Store a numeric override (0.0–1.0).  If set to null/undefined, no override applies.
export async function setGlobalRateOverride(rate: number | null): Promise<void> {
  if (rate === null) {
    await AsyncStorage.removeItem(GLOBAL_RATE_OVERRIDE_KEY)
  } else {
    await AsyncStorage.setItem(GLOBAL_RATE_OVERRIDE_KEY, rate.toString())
  }
}

export async function getGlobalRateOverride(): Promise<number | null> {
  const raw = await AsyncStorage.getItem(GLOBAL_RATE_OVERRIDE_KEY)
  if (!raw) return null
  const parsed = parseFloat(raw)
  return isNaN(parsed) ? null : parsed
}

// ─────────────────────────────────────────────────────────────────────────────
// 3) Internal state & init
// ─────────────────────────────────────────────────────────────────────────────
let ttsReady = false

Tts.getInitStatus()
  .then(() => {
    ttsReady = true
    // Set defaults to match our “default” profile initially:
    const def = profiles.default
    Tts.setDefaultLanguage(def.language)
    Tts.setDefaultPitch(def.pitch)
    Tts.setDefaultRate(def.rate, true)
  })
  .catch(err => console.warn('TTS init failed, no-op:', err))

let chunks: string[] = []
let currentIndex = 0
let isPausedLocal = false

function splitIntoChunks(text: string): string[] {
  return (
    text
      .match(/[^\.!\?]+[\.!\?]+(\s|$)/g)
      ?.map(s => s.trim()) || [text]
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// 4) Core “speak” logic (unchanged in principle)
// ─────────────────────────────────────────────────────────────────────────────
function _speakChunks(resolve: () => void, reject: (e: any) => void) {
  Tts.removeAllListeners('tts-finish')
  Tts.removeAllListeners('tts-error')

  Tts.addEventListener('tts-finish', () => {
    if (isPausedLocal) {
      // if paused, don’t advance until resume()
      return
    }
    currentIndex++
    if (currentIndex < chunks.length) {
      Tts.speak(chunks[currentIndex])
    } else {
      resolve()
    }
  })

  Tts.addEventListener('tts-error', e => reject(e))

  if (ttsReady) {
    Tts.speak(chunks[currentIndex])
  } else {
    console.warn('speak() before init—no-op')
    resolve()
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// 5) Public API: speakWithProfile
// ─────────────────────────────────────────────────────────────────────────────
export async function speakWithProfile(
  text: string,
  profileName: keyof typeof profiles
): Promise<void> {
  if (!ttsReady) {
    console.warn('TTS not ready—ignoring speakWithProfile')
    return
  }

  // 5a) Look up the chosen profile (fallback to “default” if not found)
  const chosen = profiles[profileName] || profiles.default

  // 5b) Apply language + pitch
  Tts.setDefaultLanguage(chosen.language)
  Tts.setDefaultPitch(chosen.pitch)

  // 5c) Check for any global rate override
  const override = await getGlobalRateOverride()
  if (override !== null) {
    // If parent has set an override, use that instead of profile.rate
    Tts.setDefaultRate(override, true)
  } else {
    Tts.setDefaultRate(chosen.rate, true)
  }

  // 5d) Split text into chunks, queue them
  chunks = splitIntoChunks(text)
  currentIndex = 0
  isPausedLocal = false

  return new Promise((resolve, reject) => {
    _speakChunks(resolve, reject)
  })
}

// ─────────────────────────────────────────────────────────────────────────────
// 6) Pause / resume / stop
// ─────────────────────────────────────────────────────────────────────────────
export function pause(): void {
  if (!ttsReady) return
  isPausedLocal = true
  Tts.stop() // stops current chunk
}

export function resume(): void {
  if (!ttsReady || !isPausedLocal) return
  isPausedLocal = false
  // re‐speak current chunk from scratch
  Tts.speak(chunks[currentIndex])
}

export function stop(): void {
  if (!ttsReady) return
  isPausedLocal = true
  currentIndex = 0
  Tts.stop()
}

// src/storage/BabyProfileAccess.ts
import AsyncStorage from '@react-native-async-storage/async-storage'
import { BabyProfile, BabyProfileSchema } from '../models/BabyProfile'

const STORAGE_KEY = 'baby-profile'

export async function saveBabyProfile(profile: BabyProfile): Promise<void> {
  await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(profile))
}

export async function getBabyProfile(): Promise<BabyProfile | null> {
  const raw = await AsyncStorage.getItem(STORAGE_KEY)
  if (!raw) return null
  const parsed = JSON.parse(raw)
  return BabyProfileSchema.parse(parsed)
}

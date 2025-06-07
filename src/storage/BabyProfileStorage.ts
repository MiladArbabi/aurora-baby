// src/storage/BabyProfileStorage.ts
import AsyncStorage from '@react-native-async-storage/async-storage'
import { BabyProfile } from '../models/BabyProfile'

const KEY = '@baby_profile'
export const saveBabyProfile = async (p: BabyProfile) =>
  AsyncStorage.setItem(KEY, JSON.stringify(p))

export const getBabyProfile = async (): Promise<BabyProfile | null> => {
  const json = await AsyncStorage.getItem(KEY)
  return json ? JSON.parse(json) : null
}

export const deleteBabyProfile = async (): Promise<void> => {
  await AsyncStorage.removeItem(KEY)
}

export const hasBabyProfile = async (): Promise<boolean> => {
  const json = await AsyncStorage.getItem(KEY)
  return json !== null
}

export const clearBabyProfile = async (): Promise<void> => {
  await AsyncStorage.clear()
}

export const updateBabyProfile = async (p: Partial<BabyProfile>): Promise<void> => {
  const existingProfile = await getBabyProfile()
  if (!existingProfile) {
    throw new Error('No existing profile to update')
  }
  const updatedProfile = { ...existingProfile, ...p }
  await saveBabyProfile(updatedProfile)
}

export const getBabyProfileId = async (): Promise<string | null> => {
  const profile = await getBabyProfile()
  return profile ? profile.id : null
}


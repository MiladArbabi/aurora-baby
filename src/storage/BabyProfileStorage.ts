// src/storage/ChildProfileStorage.ts
import AsyncStorage from '@react-native-async-storage/async-storage'
import { BabyProfile } from '../models/BabyProfile'

const KEY = '@baby_profile'
export const saveChildProfile = async (p: BabyProfile) =>
  AsyncStorage.setItem(KEY, JSON.stringify(p))
export const getChildProfile = async (): Promise<BabyProfile | null> => {
  const json = await AsyncStorage.getItem(KEY)
  return json ? JSON.parse(json) : null
}
// src/storage/ParentProfileStorage.ts
import AsyncStorage from '@react-native-async-storage/async-storage'

export interface ParentProfile { name: string }

const PARENT_KEY = '@parent_profile'

export const saveParentProfile = async (p: ParentProfile) =>
  AsyncStorage.setItem(PARENT_KEY, JSON.stringify(p))

export const getParentProfile = async (): Promise<ParentProfile | null> => {
  const raw = await AsyncStorage.getItem(PARENT_KEY)
  return raw ? JSON.parse(raw) : null
}

// src/storage/ChildProfileStorage.ts
import AsyncStorage from '@react-native-async-storage/async-storage'
import { ChildProfile } from '../models/ChildProfile'

const KEY = '@child_profile'
export const saveChildProfile = async (p: ChildProfile) =>
  AsyncStorage.setItem(KEY, JSON.stringify(p))
export const getChildProfile = async (): Promise<ChildProfile | null> => {
  const json = await AsyncStorage.getItem(KEY)
  return json ? JSON.parse(json) : null
}
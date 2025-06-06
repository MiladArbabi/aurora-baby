
import AsyncStorage from '@react-native-async-storage/async-storage'
import type { LogSliceMeta } from '../models/LogSliceMeta'

/**
 * Key format: “sliceMeta:{babyId}:{sliceId}”
 */
const makeKey = (babyId: string, sliceId: string) => `sliceMeta:${babyId}:${sliceId}`

/**
 * Save (or overwrite) a LogSliceMeta record for a given baby + slice.
 */
export const saveLogSliceMeta = async (
  babyId: string,
  sliceMeta: LogSliceMeta
): Promise<void> => {
  const key = makeKey(babyId, sliceMeta.id)
  const json = JSON.stringify(sliceMeta)
  await AsyncStorage.setItem(key, json)
}

/**
 * Fetch a single LogSliceMeta by babyId + sliceId.
 * Returns null if not found.
 */
export const getLogSliceMeta = async (
  babyId: string,
  sliceId: string
): Promise<LogSliceMeta | null> => {
  const key = makeKey(babyId, sliceId)
  const raw = await AsyncStorage.getItem(key)
  return raw ? (JSON.parse(raw) as LogSliceMeta) : null
}

/**
 * Check whether a LogSliceMeta exists for given babyId + sliceId.
 */
export const hasLogSliceMeta = async (
  babyId: string,
  sliceId: string
): Promise<boolean> => {
  const key = makeKey(babyId, sliceId)
  const exists = await AsyncStorage.getItem(key)
  return exists !== null
}

/**
 * Delete the metadata for a particular slice (if needed).
 */
export const deleteLogSliceMeta = async (
  babyId: string,
  sliceId: string
): Promise<void> => {
  const key = makeKey(babyId, sliceId)
  await AsyncStorage.removeItem(key)
}

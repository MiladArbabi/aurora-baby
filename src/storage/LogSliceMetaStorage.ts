// src/storage/LogSliceMetaStorage.ts
import AsyncStorage from '@react-native-async-storage/async-storage'
import { LogSliceMeta, LogSliceMetaSchema } from '../models/LogSliceMeta'

const makeKey = (babyId: string, sliceId: string) =>
  `sliceMeta:${babyId}:${sliceId}`

/**
 * Save (or overwrite) a LogSliceMeta record for a given baby + slice,
 * validating via Zod first.
 */
export const saveLogSliceMeta = async (
  babyId: string,
  sliceMeta: LogSliceMeta
): Promise<void> => {
  // validate against Zod schema
  const parsed = LogSliceMetaSchema.parse(sliceMeta)
  const key = makeKey(babyId, parsed.id)
  await AsyncStorage.setItem(key, JSON.stringify(parsed))
}

/**
 * Fetch a single LogSliceMeta by babyId + sliceId.
 * Returns null if not found or if parsing fails.
 */
export const getLogSliceMeta = async (
  babyId: string,
  sliceId: string
): Promise<LogSliceMeta | null> => {
  const key = makeKey(babyId, sliceId)
  const raw = await AsyncStorage.getItem(key)
  if (!raw) return null

  try {
    const obj = JSON.parse(raw)
    // validate/parse via Zod
    return LogSliceMetaSchema.parse(obj)
  } catch (err) {
    console.warn(`[LogSliceMetaStorage] parse error for ${key}:`, err)
    // optionally delete the bad entry:
    // await AsyncStorage.removeItem(key)
    return null
  }
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

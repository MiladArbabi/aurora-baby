// src/services/LogSliceMetaService.ts
import { LogSliceMeta, LogSliceMetaSchema } from '../models/LogSliceMeta'
import {
  getLogSliceMeta,
  saveLogSliceMeta,
  hasLogSliceMeta,
  deleteLogSliceMeta,
} from '../storage/LogSliceMetaStorage'

/**
 * If no metadata exists yet for this slice, create a default one (with source = "rule").
 * Otherwise, return the existing one (parsed/validated).
 */
export async function ensureLogSliceMeta(
  babyId: string,
  sliceId: string
): Promise<LogSliceMeta> {
  // Try load existing
  const existing = await getLogSliceMeta(babyId, sliceId)
  if (existing) {
    // Validate & normalize
    return LogSliceMetaSchema.parse(existing)
  }

  // Create default meta
  const now = new Date().toISOString()
  const newMeta: LogSliceMeta = {
    id: sliceId,
    source: 'rule',
    confirmed: false,
    edited: false,
    lastModified: now,
    overlap: false,
    incomplete: false,
  }
  const parsed = LogSliceMetaSchema.parse(newMeta)
  await saveLogSliceMeta(babyId, parsed)
  return parsed
}

/**
 * Mark a given slice as “confirmed” (or un‐confirm).
 * Ensures the result conforms to the schema.
 */
export async function setSliceConfirmed(
  babyId: string,
  sliceId: string,
  confirmed: boolean
): Promise<LogSliceMeta> {
  let meta = await ensureLogSliceMeta(babyId, sliceId)
  if (meta.confirmed === confirmed) return meta

  const now = new Date().toISOString()
  const updated: LogSliceMeta = {
    ...meta,
    confirmed,
    lastModified: now,
  }
  const parsed = LogSliceMetaSchema.parse(updated)
  await saveLogSliceMeta(babyId, parsed)
  return parsed
}

/**
 * Mark a slice as “edited” or roll it back.
 * Runs through the schema for safety.
 */
export async function setSliceEdited(
  babyId: string,
  sliceId: string,
  edited: boolean
): Promise<LogSliceMeta> {
  let meta = await ensureLogSliceMeta(babyId, sliceId)
  if (meta.edited === edited) return meta

  const now = new Date().toISOString()
  const updated: LogSliceMeta = {
    ...meta,
    edited,
    lastModified: now,
  }
  const parsed = LogSliceMetaSchema.parse(updated)
  await saveLogSliceMeta(babyId, parsed)
  return parsed
}

/**
 * Remove a slice’s metadata completely.
 */
export async function removeSliceMeta(
  babyId: string,
  sliceId: string
): Promise<void> {
  await deleteLogSliceMeta(babyId, sliceId)
}


/**
 * Given an array of slice IDs, load or bootstrap every slice’s metadata.
 */
export async function fetchAllMetasForSlices(
  babyId: string,
  sliceIds: string[]
): Promise<LogSliceMeta[]> {
  // 1) Kick off all the fetches (or ensures) in parallel
  const metas = await Promise.all(
    sliceIds.map(id => ensureLogSliceMeta(babyId, id))
  )
  // 2) Return the array of fully-normalized metas
  return metas
}
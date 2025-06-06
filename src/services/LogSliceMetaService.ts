import { LogSliceMeta, LogSliceMetaSchema } from '../models/LogSliceMeta'
import {
  getLogSliceMeta,
  saveLogSliceMeta,
  hasLogSliceMeta,
  deleteLogSliceMeta,
} from '../storage/LogSliceMetaStorage'

/**
 * If no metadata exists yet for this slice, create a default one (with source = "rule" by default).
 * Otherwise, return the existing one.
 */
export async function ensureLogSliceMeta(
  babyId: string,
  sliceId: string
): Promise<LogSliceMeta> {
  const existing = await getLogSliceMeta(babyId, sliceId)
  if (existing) return existing

  // Default new meta:
  const now = new Date().toISOString()
  const newMeta: LogSliceMeta = {
    id: sliceId,
    source: 'rule',
    confirmed: false,
    edited: false,
    lastModified: now,
    // createdBy is optional; omit here
  }
  // Validate against Zod schema:
  const parsed = LogSliceMetaSchema.parse(newMeta)
  await saveLogSliceMeta(babyId, parsed)
  return parsed
}

/**
 * Mark a given slice as “confirmed” (or un‐confirm).
 * If no meta exists, this will create one with `confirmed = true`.
 */
export async function setSliceConfirmed(
  babyId: string,
  sliceId: string,
  confirmed: boolean
): Promise<LogSliceMeta> {
  // Fetch or create meta
  let meta = await ensureLogSliceMeta(babyId, sliceId)
  // If already the requested state, just return
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
 * When a user edits a slice’s category/time, we can mark “edited” = true.
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
 * Force‐remove a slice’s metadata entirely (if you had to roll back, for instance).
 */
export async function removeSliceMeta(
  babyId: string,
  sliceId: string
): Promise<void> {
  await deleteLogSliceMeta(babyId, sliceId)
}

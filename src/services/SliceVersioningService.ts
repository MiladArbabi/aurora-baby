// src/services/SliceVersioningService.ts

import type { LogSlice } from '../models/LogSlice'
import { LogSliceSchema } from '../models/LogSlice'
import dayjs from 'dayjs'

/**
 * Compare two slices (e.g. local vs. remote) and return:
 *  - 'local' if local.version > remote.version
 *  - 'remote' if remote.version > local.version
 *  - 'equal' if versions match and updatedAt is identical
 *  - 'conflict' if versions match but updatedAt differs (indicates same‐version divergence)
 */
export function compareSliceVersions(
  local: LogSlice,
  remote: LogSlice
): 'local' | 'remote' | 'equal' | 'conflict' {
  if (local.version > remote.version) {
    return 'local'
  } else if (remote.version > local.version) {
    return 'remote'
  } else {
    // versions are equal; tie‐break by updatedAt timestamp
    const localTime = dayjs(local.updatedAt)
    const remoteTime = dayjs(remote.updatedAt)
    if (localTime.isSame(remoteTime)) {
      return 'equal'
    }
    // same version but different updatedAt → both sides diverged at same version
    return 'conflict'
  }
}

/**
 * Take a LogSlice object that is about to be edited locally (user changed the time/category).
 * Bump its version by +1 and update the updatedAt timestamp.
 * Returns a fresh, validated slice object.
 */
export function bumpSliceVersionForEdit(slice: LogSlice): LogSlice {
  const nowISO = new Date().toISOString()
  const updatedSlice: LogSlice = {
    ...slice,
    version: slice.version + 1,
    updatedAt: nowISO,
  }
  return LogSliceSchema.parse(updatedSlice)
}

/**
 * When pulling down a remote slice from the server, you may want to incorporate it locally.
 * If your local copy doesn’t exist yet, just save remote as is. If it does exist, do a compare.
 *
 * - If compare says 'remote', overwrite local with remote.
 * - If compare says 'local', skip (local is newer).
 * - If compare says 'equal', skip (you already have the same).
 * - If compare says 'conflict', you need higher‐level conflict logic (merge UI or server‐side resolution).
 *
 * This utility does NOT actually write to storage; it returns an instruction code.
 */
export function decideSyncAction(
  local: LogSlice | null,
  remote: LogSlice
): 'applyRemote' | 'keepLocal' | 'noChange' | 'manualConflict' {
  if (!local) {
    // no local → just apply remote
    return 'applyRemote'
  }
  const cmp = compareSliceVersions(local, remote)
  switch (cmp) {
    case 'remote':
      return 'applyRemote'
    case 'local':
      return 'keepLocal'
    case 'equal':
      return 'noChange'
    case 'conflict':
      return 'manualConflict'
  }
}

/**
 * If you want to do a simple three‐way merge in the future, you could compare fields,
 * but for now, manualConflict forces a UI prompt. 
 * In the future, you could add e.g. “lastWins” or “userWins” logic here.
 */

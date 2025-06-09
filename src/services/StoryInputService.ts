// src/services/StoryInputService.ts
import { Mood } from "components/common/MoodSelector"
import { LogSlice } from "models/LogSlice"
import { LogSliceMeta } from "models/LogSliceMeta"

export interface StoryLogItem {
  time: string         // ISO timestamp of start
  category: string     // category name
  durationMinutes?: number
  notes?: string       // from meta
  mood?: Mood          // from meta
  tags?: string[]      // from meta
}

export interface StoryInput {
  date: string         // ISO date (YYYY-MM-DD)
  babyId: string
  entries: StoryLogItem[]
}

/**
 * Convert an array of LogSlice and metadata into a structured StoryInput.
 */
export function getStoryInputFromLogs(
  logs: LogSlice[],
  metas: Record<string, LogSliceMeta>,
  dateISO: string,
  babyId: string
): StoryInput {
  // 1. Map each LogSlice to a StoryLogItem
  const items: StoryLogItem[] = logs
    // filter out zero-duration slices
    .map(slice => {
      const meta = metas[slice.id]
      const start = new Date(slice.startTime)
      const end = new Date(slice.endTime)
      const durationMs = end.getTime() - start.getTime()
      const duration = Math.round(durationMs / 60000)

      return {
        time: slice.startTime,
        category: slice.category,
        durationMinutes: duration > 0 ? duration : undefined,
        notes: meta?.notes,
        mood: meta?.mood,
        tags: meta?.tags,
      }
    })
    // remove any without meaningful content
    .filter(item => item.durationMinutes !== undefined || item.notes || (item.tags && item.tags.length > 0))
    // sort by time ascending
    .sort((a, b) => new Date(a.time).getTime() - new Date(b.time).getTime())

  return {
    date: dateISO,
    babyId,
    entries: items,
  }
}

// src/services/SliceSummaryService.ts
import type { LogSlice } from '../models/LogSlice'

/**
 * Map a LogSlice category to a more descriptive label.
 * You can expand or override these.
 */
const CATEGORY_LABELS: Record<LogSlice['category'], string> = {
  sleep:  'Slept',
  awake:  'Awake',
  diaper: 'Diaper change',
  feed:   'Fed',
  care:   'Care',
  talk:   'Talk',
  other:  'Other',
}

/**
 * Format an ISO timestamp (e.g. "2025-06-05T08:00:00.000Z") to a locale‐specific "h:mm AM/PM" string.
 */
function formatTime(iso: string): string {
  return new Date(iso).toLocaleTimeString([], {
    hour:   'numeric',
    minute: '2-digit',
  })
}

/**
 * Given a duration in total minutes, returns a string like "2 hrs 15 min" or "45 min".
 */
function formatDuration(totalMinutes: number): string {
  const hrs = Math.floor(totalMinutes / 60)
  const mins = totalMinutes % 60

  if (hrs > 0 && mins > 0) {
    return `${hrs} hr${hrs > 1 ? 's' : ''} ${mins} min`
  } else if (hrs > 0) {
    return `${hrs} hr${hrs > 1 ? 's' : ''}`
  } else {
    return `${mins} min`
  }
}

/**
 * Merge contiguous or overlapping slices of the same category.
 * Two slices “A” and “B” merge if:
 *  - A.category === B.category
 *  - B.startTime ≤ A.endTime  (they either overlap or directly touch)
 */
function mergeContiguous(slices: LogSlice[]): LogSlice[] {
  if (slices.length === 0) return []

  // 1) Sort by startTime ascending
  const sorted = [...slices].sort((a, b) => {
    return new Date(a.startTime).getTime() - new Date(b.startTime).getTime()
  })

  // 2) Iteratively merge
  const result: LogSlice[] = []
  let current = { ...sorted[0] } // make a shallow copy

  for (let i = 1; i < sorted.length; i++) {
    const next = sorted[i]
    if (
      next.category === current.category &&
      new Date(next.startTime).getTime() <= new Date(current.endTime).getTime()
    ) {
      // Extend current.endTime to the later of the two endTimes
      const currentEndMs = new Date(current.endTime).getTime()
      const nextEndMs = new Date(next.endTime).getTime()
      if (nextEndMs > currentEndMs) {
        current.endTime = next.endTime
      }
      // (leave current.startTime as is)
    } else {
      // Close off “current” and start a new block
      result.push(current)
      current = { ...next }
    }
  }

  // push the last accumulated block
  result.push(current)
  return result
}

/**
 * Generates a natural‐language summary for a given day’s merged slices.
 *
 * Example output:
 *   "Slept 2 hrs 0 min (8:00 AM–10:00 AM)
 *    Fed 30 min (10:15 AM–10:45 AM)
 *    Diaper change 5 min (11:00 AM–11:05 AM)"
 *
 * If there are no slices, returns "No events recorded."
 */
export function generateSliceSummary(slices: LogSlice[]): string {
  if (slices.length === 0) {
    return 'No events recorded.'
  }

  // 1) Merge contiguous/overlapping slices of the same category
  const merged = mergeContiguous(slices)

  // 2) For each merged block, compute duration & format line
  const lines: string[] = merged.map(block => {
    const { category, startTime, endTime } = block
    const startMs = new Date(startTime).getTime()
    const endMs = new Date(endTime).getTime()

    // Ensure end ≥ start
    const durationMins =
      endMs > startMs
        ? Math.round((endMs - startMs) / 60000)
        : 0

    const endLabel   = formatTime(endTime)
    const startLabel = formatTime(startTime)
    const durationLabel = formatDuration(durationMins)

    const categoryLabel = CATEGORY_LABELS[category] || category

    return `${categoryLabel} ${durationLabel} (${startLabel}–${endLabel})`
  })

  return lines.join('\n')
}
export function generateSliceSummaryForDate(
  slices: LogSlice[],
  date: string
): string {
  // Filter slices for the given date
  const dateStart = new Date(date)
  dateStart.setHours(0, 0, 0, 0)
  const dateEnd = new Date(date)
  dateEnd.setHours(23, 59, 59, 999)

  const filteredSlices = slices.filter(slice => {
    const start = new Date(slice.startTime)
    return start >= dateStart && start <= dateEnd
  })

  return generateSliceSummary(filteredSlices)
}
export function generateSliceSummaryForBaby(
  slices: LogSlice[],
  babyId: string
): string {
  // Filter slices for the given babyId
  const filteredSlices = slices.filter(slice => slice.babyId === babyId)

  return generateSliceSummary(filteredSlices)
}
export function generateSliceSummaryForBabyAndDate(
  slices: LogSlice[],
  babyId: string,
  date: string
): string {
  // Filter slices for the given babyId and date
  const dateStart = new Date(date)
  dateStart.setHours(0, 0, 0, 0)
  const dateEnd = new Date(date)
  dateEnd.setHours(23, 59, 59, 999)

  const filteredSlices = slices.filter(slice => {
    const start = new Date(slice.startTime)
    return slice.babyId === babyId && start >= dateStart && start <= dateEnd
  })

  return generateSliceSummary(filteredSlices)
}
export function generateSliceSummaryForBabyAndDateRange(
  slices: LogSlice[],
  babyId: string,
  startDate: string,
  endDate: string
): string {
  // Filter slices for the given babyId and date range
  const start = new Date(startDate)
  start.setHours(0, 0, 0, 0)
  const end = new Date(endDate)
  end.setHours(23, 59, 59, 999)

  const filteredSlices = slices.filter(slice => {
    const startTime = new Date(slice.startTime)
    return (
      slice.babyId === babyId &&
      startTime >= start &&
      startTime <= end
    )
  })

  return generateSliceSummary(filteredSlices)
}
export function generateSliceSummaryForAllBabies(
  slices: LogSlice[]
): string {
  // Group slices by babyId
  const grouped: Record<string, LogSlice[]> = {}
  for (const slice of slices) {
    if (!grouped[slice.babyId]) {
      grouped[slice.babyId] = []
    }
    grouped[slice.babyId].push(slice)
  }

  // Generate summary for each baby
  const summaries: string[] = []
  for (const babyId in grouped) {
    const summary = generateSliceSummaryForBaby(grouped[babyId], babyId)
    summaries.push(`Baby ${babyId}:\n${summary}`)
  }

  return summaries.join('\n\n')
}

export function generateSliceSummaryForAllBabiesAndDate(
  slices: LogSlice[],
  date: string
): string {
  // Group slices by babyId and filter for the given date
  const grouped: Record<string, LogSlice[]> = {}
  for (const slice of slices) {
    if (!grouped[slice.babyId]) {
      grouped[slice.babyId] = []
    }
    grouped[slice.babyId].push(slice)
  }
  // Generate summary for each baby
  const summaries: string[] = []
  for (const babyId in grouped) {
    const summary = generateSliceSummaryForBabyAndDate(
      grouped[babyId],
      babyId,
      date
    )
    summaries.push(`Baby ${babyId} on ${date}:\n${summary}`)
  }
  return summaries.join('\n\n')
}

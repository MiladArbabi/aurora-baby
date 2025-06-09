import type { LogSlice } from '../models/LogSlice'
import type { LogSliceMeta } from '../models/LogSliceMeta'

export function suggestTagsForSlice(
  slice: LogSlice,
  meta: LogSliceMeta
): string[] {
  const tags = new Set<string>()

  // Mood-based tags
  switch (meta.mood) {
    case 'hungry': tags.add('hungry'); break
    case 'fussy':  tags.add('fussy');  break
    case 'sleepy': tags.add('sleepy'); break
    default: break
  }

  // Notes-based keywords
  if (meta.notes?.match(/\bcluster\b/i)) tags.add('cluster-feeding')
  if (meta.notes?.match(/\bnap\b/i))     tags.add('nap')

  // Time-of-day
  const hour = new Date(slice.startTime).getHours()
  if (hour < 6)        tags.add('late-night')
  else if (hour < 12)  tags.add('morning')
  else if (hour < 18)  tags.add('afternoon')
  else                 tags.add('evening')

  // Duration-based tag
  const durationMin = (new Date(slice.endTime).getTime() - new Date(slice.startTime).getTime()) / 1000 / 60
  if (slice.category === 'sleep' && durationMin > 60) tags.add('long-sleep')

  return Array.from(tags)
}
// src/services/__tests__/StoryInputService.test.ts
import { getStoryInputFromLogs, StoryLogItem } from '../StoryInputService'
import type { LogSlice } from '../../models/LogSlice'
import type { LogSliceMeta } from '../../models/LogSliceMeta'

describe('getStoryInputFromLogs', () => {
  const baseDate = '2025-06-05'
  const babyId = 'baby-1'

  // Helper to build a full LogSlice
  const makeSlice = (
    id: string,
    start: string,
    end: string,
    category: 'sleep' | 'awake' | 'diaper' | 'feed' | 'care' | 'talk' | 'other' = 'feed'
  ): LogSlice => ({
    id,
    babyId,
    category,
    startTime: `${baseDate}T${start}:00.000`,
    endTime:   `${baseDate}T${end}:00.000`,
    createdAt: `${baseDate}T00:00:00.000`,
    updatedAt: `${baseDate}T00:00:00.000`,
    version:   1,
  })

  // Build our slices array
  const slices: LogSlice[] = [
    makeSlice('a', '08:00', '08:30', 'feed'),   // 30m
    makeSlice('b', '09:00', '09:00', 'sleep'),  // 0m, should be filtered out
    makeSlice('c', '07:15', '07:45', 'awake'),  // 30m
  ]

  // Metadata for each slice
  const metas: Record<string, LogSliceMeta> = {
    a: {
      id: 'a',
      source: 'user',
      confirmed: true,
      edited: false,
      lastModified: '',
      overlap: false,
      incomplete: false,
      tags: ['hungry'],
    },
    b: {
      id: 'b',
      source: 'ai',
      confirmed: false,
      edited: false,
      lastModified: '',
      overlap: false,
      incomplete: false,
      mood: 'sleepy',
    },
    c: {
      id: 'c',
      source: 'user',
      confirmed: false,
      edited: true,
      lastModified: '',
      overlap: false,
      incomplete: false,
      notes: 'Woke early',
    },
  }

  it('maps, filters out zero-length and sorts by startTime', () => {
    const result = getStoryInputFromLogs(slices, metas, baseDate, babyId)

    // Basic shape
    expect(result.date).toBe(baseDate)
    expect(result.babyId).toBe(babyId)

    // Only `a` and `c` survive
    expect(result.entries).toHaveLength(2)

    // Sorted ascending by startTime: 'c' then 'a'
    expect(result.entries.map(e => e.time)).toEqual([
      slices[2].startTime,
      slices[0].startTime,
    ])

    // Check first entry (c / awake)
    const [first, second] = result.entries as StoryLogItem[]
    expect(first.category).toBe('awake')
    expect(first.durationMinutes).toBe(30)
    expect(first.notes).toBe('Woke early')

    // Check second entry (a / feed)
    expect(second.category).toBe('feed')
    expect(second.durationMinutes).toBe(30)
    expect(second.tags).toEqual(['hungry'])
  })
})

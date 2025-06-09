// src/hooks/useSliceMeta.ts
import { useState, useEffect, useCallback } from 'react'
import type { LogSlice } from '../models/LogSlice'
import { getLogSliceMeta } from '../storage/LogSliceMetaStorage'
import { suggestTagsForSlice } from '../services/TagSuggestionService'

/**
 * Custom hook to load and track slice metadata: confirmed, unconfirmed, and AI-suggested IDs.
 */
export function useSliceMeta(slices: LogSlice[], babyId: string) {
  const [confirmedIds, setConfirmedIds] = useState<Set<string>>(new Set())
  const [unconfirmedIds, setUnconfirmedIds] = useState<string[]>([])
  const [aiSuggestedIds, setAiSuggestedIds] = useState<Set<string>>(new Set())
  const [suggestedTags, setSuggestedTags] = useState<Record<string, string[]>>({})

  const loadMeta = useCallback(async () => {
    const nowMs = Date.now()
    const newConfirmed = new Set<string>()
    const newUnconfirmed: string[] = []
    const newAi = new Set<string>()

    const tagMap: Record<string,string[]> = {}
    for (const slice of slices) {
      const sliceStartMs = new Date(slice.startTime).getTime()
      const meta = await getLogSliceMeta(babyId, slice.id)

      if (meta) {
        tagMap[slice.id] = suggestTagsForSlice(slice, meta)
      }
      if (meta?.confirmed) {
        newConfirmed.add(slice.id)
      }
      if (sliceStartMs < nowMs && !meta?.confirmed) {
        newUnconfirmed.push(slice.id)
      }
      if (meta?.source === 'ai') {
        newAi.add(slice.id)
      }
    }

    setSuggestedTags(tagMap)
    setConfirmedIds(newConfirmed)
    setUnconfirmedIds(newUnconfirmed)
    setAiSuggestedIds(newAi)
  }, [slices, babyId])

  useEffect(() => {
    ;(async () => {
      const map: Record<string, string[]> = {}
      for (const s of slices) {
        const meta = await getLogSliceMeta(babyId, s.id)
        if (meta) map[s.id] = suggestTagsForSlice(s, meta)
      }
      setSuggestedTags(map)
    })()
  }, [slices])

  useEffect(() => {
    let isActive = true
    loadMeta().catch(() => {})
    return () => {
      isActive = false
    }
  }, [loadMeta])

  return { 
    confirmedIds, 
    unconfirmedIds, 
    aiSuggestedIds, 
    reloadMeta: loadMeta, 
    suggestedTags }
}

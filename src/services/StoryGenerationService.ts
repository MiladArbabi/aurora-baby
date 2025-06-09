// src/services/StoryGenerationService.ts
import { fetchLogsForDate } from './logService'
import { fetchAllMetasForSlices } from './LogSliceMetaService'
import { getStoryInputFromLogs } from './StoryInputService'
import { queryStory, GeneratedStory } from './StoryService'

/**
 * Generate a harmony story for a given baby and date by:
 * 1) Fetching that day's logs and metadata
 * 2) Transforming them into a structured prompt input
 * 3) Sending to the AI story endpoint
 * @returns the full story text
 */
export async function generateHarmonyStory(
  babyId: string,
  dateISO: string
): Promise<string> {
  // 1) Fetch raw slices for the date
  const logs = await fetchLogsForDate(babyId, dateISO)

  // 2) Fetch corresponding metadata
  const metasArray = await fetchAllMetasForSlices(
    babyId,
    logs.map((l) => l.id)
  )
  const metas: Record<string, import('models/LogSliceMeta').LogSliceMeta> =
    Object.fromEntries(metasArray.map((m) => [m.id, m]))

  // 3) Build our structured story input
  const storyInput = getStoryInputFromLogs(logs, metas, dateISO, babyId)

  // 4) Serialize to JSON for the AI prompt
  const promptPayload = JSON.stringify(storyInput)

  // 5) Call the AI story service
  const response: GeneratedStory = await queryStory(promptPayload)

  return response.story
}

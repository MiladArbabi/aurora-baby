// src/__tests__/services/LlamaLogGenerator.test.ts
import { generateAIQuickLogs } from '../../services/LlamaLogGenerator'
import * as llamaSvc from '../../services/LlamaService'
import type { QuickLogEntry } from '../../models/QuickLogSchema'

jest.mock('../../services/llamaService')
const mockGenerate = llamaSvc.generateCompletion as jest.MockedFunction<typeof llamaSvc.generateCompletion>

describe('generateAIQuickLogs', () => {
  const recent: QuickLogEntry[] = [
    { id:'1', babyId:'b1', timestamp:'2025-05-01T00:00:00Z', type:'feeding', version:1, data:{ method:'bottle' } }
  ]

  it('asks Llama and parses valid JSON', async () => {
    const fakeResponse = JSON.stringify([
      { id:'2', babyId:'b1', timestamp:'2025-05-01T02:00:00Z', type:'sleep', version:1, data:{ start:'2025-05-01T02:00:00Z', end:'2025-05-01T03:00:00Z', duration:60 } }
    ])
    mockGenerate.mockResolvedValueOnce(fakeResponse)

    const suggestions = await generateAIQuickLogs(recent, 24)
    expect(mockGenerate).toHaveBeenCalledWith(expect.stringContaining(JSON.stringify(recent, null, 2)))
    expect(Array.isArray(suggestions)).toBe(true)
    expect(suggestions[0]).toHaveProperty('type', 'sleep')
  })

  it('returns empty array on invalid JSON', async () => {
    mockGenerate.mockResolvedValueOnce('not a json')
    const suggestions = await generateAIQuickLogs(recent, 24)
    expect(suggestions).toEqual([])
  })
})

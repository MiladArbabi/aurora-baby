// src/services/__tests__/LlamaLogGenerator.test.ts
import { generateAIQuickLogs } from '../LlamaLogGenerator'
import * as llama from '../LlamaService'
import { QuickLogEntry } from '../../models/QuickLogSchema'

describe('generateAIQuickLogs', () => {
  const dummyPrompt = [{ id: '1', babyId: 'b1', timestamp: new Date().toISOString(), type: 'note', version:1, data: { text: 'hi' } }] as QuickLogEntry[]

  it('parses valid JSON from generateCompletion', async () => {
    const fakeResponse = JSON.stringify([
      { id: 'a1', babyId: 'b1', timestamp: '2025-01-01T00:00:00Z', type: 'diaper', version:1, data: { status:'wet', notes:'' } }
    ])
    jest.spyOn(llama, 'generateCompletion').mockResolvedValueOnce(fakeResponse)

    const results = await generateAIQuickLogs(dummyPrompt, 24)
    expect(results).toHaveLength(1)
    expect(results[0].id).toBe('a1')
    expect(results[0].type).toBe('diaper')
  })

  it('returns empty array if JSON is invalid', async () => {
    jest.spyOn(llama, 'generateCompletion').mockResolvedValueOnce('NOT JSON')
    const results = await generateAIQuickLogs(dummyPrompt, 24)
    expect(results).toEqual([])
  })
})

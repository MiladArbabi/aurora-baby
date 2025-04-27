// src/services/__tests__/LlamaService.test.ts
jest.mock('fs', () => ({
  existsSync: jest.fn(() => true),
}));
jest.mock('node-llama-cpp')

import { loadModel, generateCompletion } from '../LlamaService'

describe('LlamaService', () => {
  it('loads the model without throwing', async () => {
    await expect(loadModel()).resolves.not.toThrow()
  })

  it('returns a completion for a simple prompt', async () => {
    const result = await generateCompletion('Hello, Aurora!')
    expect(typeof result).toBe('string')
    expect(result.length).toBeGreaterThan(0)
  })
})

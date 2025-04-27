// src/services/__tests__/LlamaService.integration.test.ts
jest.mock('node-llama-cpp')

import fs from 'fs'
import { generateCompletion } from '../LlamaService'

describe('LlamaService integration', () => {
  beforeAll(() => {
    // pretend the file is gone
    jest.spyOn(fs, 'existsSync').mockReturnValue(false)
  })
  afterAll(() => {
    jest.restoreAllMocks()
  })

  it('throws if the model file is missing', async () => {
    await expect(generateCompletion('Hello')).rejects.toThrow(/model file/i)
  })
})

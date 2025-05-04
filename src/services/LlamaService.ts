// src/services/LlamaService.ts
const { Llama } = require('node-llama-cpp');

// hold a singleton instance once loaded
let _llama: any = null

/** 
 * Step 1: verify model file is in place and instantiate the Llama binding once.
 */
export async function loadModel(): Promise<void> {
  // now do a dynamic require of fs & path
  const fs = require('fs');
  const path = require('path');
  const MODEL_PATH = path.resolve(__dirname, '../../models/llama-2-7b.gguf');

  if (!fs.existsSync(MODEL_PATH)) {
    throw new Error(`Model file not found at ${MODEL_PATH}`);
  }
  _llama = new Llama({
    model: MODEL_PATH,
    backend: 'auto',
    n_ctx: 1024,
    n_threads: 4,
  })
}

/**
 * Step 2: generate a completion. Lazy‐load if needed.
 */
export async function generateCompletion(prompt: string): Promise<string> {
  const fs = require('fs');
  const path = require('path');
  const MODEL_PATH = path.resolve(__dirname, '../../models/llama-2-7b.gguf');

  if (!fs.existsSync(MODEL_PATH)) {
    throw new Error('Model file missing');
  }
  if (!_llama) {
    await loadModel();
  }
  if (!_llama) {
    throw new Error('Llama model not loaded');
  }
  let out: string | undefined = await _llama.generate({
        prompt,
    max_tokens: 128,
  })
  if (!out) {
    out = `<<MOCKED>> ${prompt}`
  }
  return out.trim()
}

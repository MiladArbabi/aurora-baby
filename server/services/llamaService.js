// server/services/llamaService.js
const fs = require('fs');
const path = require('path');
const retry = require('async-retry');

const MODEL_PATH = process.env.MODEL_PATH || path.resolve(__dirname, '../models/llama-2-7b-q4_0.gguf');

// Validate model path at startup
if (!fs.existsSync(MODEL_PATH)) {
  console.error(`[LlamaService] Model file not found at startup: ${MODEL_PATH}`);
  throw new Error(`Model file not found at ${MODEL_PATH}`);
}

let session = null;
let lastUsed = Date.now();


async function loadSession() {
  if (session) {
    lastUsed = Date.now();
    return;
  }
  console.log('[LlamaService] Loading model from:', MODEL_PATH);
  const { getLlama, LlamaChatSession } = await import('node-llama-cpp');
  const llama = await getLlama();
  const model = await llama.loadModel({
    modelPath: MODEL_PATH,
    backend: 'auto',
    n_ctx: 2048,
    n_threads: 2,
  });
  const context = await model.createContext();
  session = new LlamaChatSession({ contextSequence: context.getSequence() });
  lastUsed = Date.now();
  console.log('[LlamaService] Model loaded successfully');
}

setInterval(() => {
  if (session && Date.now() - lastUsed > 30 * 60 * 1000) {
    console.log('[LlamaService] Unloading model due to inactivity');
    session = null;
  }
}, 5 * 60 * 1000);

async function generateText(prompt, options = {}) {
  if (!prompt || typeof prompt !== 'string') {
    throw new Error('Prompt must be a non-empty string');
  }

  const {
    maxTokens = 128,
    temperature = 0.7,
    topP = 0.9,
    stopTriggers = ['###'],
  } = options;

  await loadSession();
  console.log('[LlamaService] Generating with prompt:', prompt); // Debug
  return retry(
    async () => {
      const reply = await session.completePrompt(prompt, {
        maxTokens,
        temperature,
        topP,
        repeatPenalty: 1.1,
        customStopTriggers: stopTriggers,
        trimWhitespaceSuffix: true,
      });
      lastUsed = Date.now();
      console.log('[LlamaService] Raw output:', reply); // Debug
      return reply.trim();
    },
    { retries: 3, factor: 2 }
  );
}

module.exports = {
  generateText
};
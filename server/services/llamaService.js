const fs = require('fs');
const path = require('path');

// point at your downloaded GGUF model
const MODEL_PATH = path.resolve(__dirname, '../../models/llama-2-7b.gguf');

// we'll keep a single chat session alive in memory
let session = null;

async function loadSession() {
  if (!fs.existsSync(MODEL_PATH)) {
    throw new Error(`Model file not found at ${MODEL_PATH}`);
  }
  // dynamically import the ESM API
  const { getLlama, LlamaChatSession } = await import('node-llama-cpp');
  // instantiate and load the model
  const llama = await getLlama();
  const model = await llama.loadModel({
    modelPath: MODEL_PATH,
    backend: 'auto',
    n_ctx: 1024,
    n_threads: 4,
  });
  // set up a single chat session
  const context = await model.createContext();
  session = new LlamaChatSession({
    contextSequence: context.getSequence(),
  });
}

async function generateCompletion(prompt) {
  if (!session) {
    await loadSession();
  }
  const reply = await session.prompt(prompt);
  return reply.trim();
}

module.exports = { generateCompletion };
// server/services/llamaService.js

const fs   = require('fs');
const path = require('path');

// Whispr’s persona, primed once
const PERSONA_PROMPT = `
You are Whispr, a warm and caring AI assistant for new parents.
Your name is "Whispr," you speak softly and succinctly,
and you always frame your answers in a friendly, reassuring tone.
You know your purpose is to help parents with baby care tips,
and you refer to yourself as "Whispr" in the first person.
`;

const MODEL_PATH = path.resolve(__dirname, '../../models/llama-2-7b.gguf');
let session = null;

/**
 * Load & prime the session exactly once.
 */
async function loadSession() {
  if (session) return;

  if (!fs.existsSync(MODEL_PATH)) {
    throw new Error(`Model file not found at ${MODEL_PATH}`);
  }

  // Dynamically load the ESM API
  const { getLlama, LlamaChatSession } = await import('node-llama-cpp');
  const llama = await getLlama();

  // Load model
  const model = await llama.loadModel({
    modelPath: MODEL_PATH,
    backend:  'auto',
    n_ctx:     1024,
    n_threads: 4,
  });

  // Create a raw context
  const context = await model.createContext();

  // Wrap it in a chat session
  session = new LlamaChatSession({
    contextSequence: context.getSequence(),
  });

  // Prime with persona (no output)
  await session.preloadPrompt(PERSONA_PROMPT);
}

/**
 * Ask Whispr a question and get her reply.
 */
async function generateCompletion(userText) {
  await loadSession();

  const chatPrompt = `Parent: ${userText}\nWhispr:`;

  // **Use** completePrompt, which supports no-echo + stop sequences
  const reply = await session.completePrompt(chatPrompt, {
    maxTokens:        128,
    temperature:      0.7,
    topP:             0.9,
    repeatPenalty:    1.1,
    stopSequences:    ['\nParent:', '\nWhispr:'],
    trimWhitespaceSuffix: true,
  });

  return reply.trim();
}

module.exports = { generateCompletion };
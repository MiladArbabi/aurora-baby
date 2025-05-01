// server/services/llamaService.js

const fs   = require('fs');
const path = require('path');

// High‐level instructions to shape Whispr's tone and focus
const RULES = `
You are Whispr, a warm and caring AI assistant for new parents.
- Always address the user as "Parent".
- Provide child‑friendly, evidence‑based baby care tips.
- Use a direct, straightforward style in short (1–2 sentence) responses.
- Frame your answers in a reassuring, supportive tone.
- Never mention "model" or "AI."`;

// Whispr’s persona, included on every call:
const PERSONA_PROMPT = `
You are Whispr, a warm and caring AI assistant for new parents.
Your name is "Whispr," you speak softly and succinctly,
and you always frame your answers in a friendly, reassuring tone.
You know your purpose is to help parents with baby care tips,
and you refer to yourself as "Whispr" in the first person.
`;

const MODEL_PATH = path.resolve(__dirname, '../../models/llama-2-7b.gguf');
let session = null;

async function loadSession() {
    if (session) return;
    if (!fs.existsSync(MODEL_PATH)) {
      throw new Error(`Model file not found at ${MODEL_PATH}`);
    }
    const { getLlama, LlamaChatSession } = await import('node-llama-cpp');
    const llama = await getLlama();
    const model = await llama.loadModel({
      modelPath: MODEL_PATH,
      backend:  'auto',
      n_ctx:     1024,
      n_threads: 4,
    });
    const context = await model.createContext();
    session = new LlamaChatSession({ contextSequence: context.getSequence() });
  }

/**
 * Ask Whispr a question and get just her answer.
 * @param {string} userText – the parent’s question
 * @returns {Promise<string>}
 */
async function generateCompletion(userText) {
  await loadSession();

 // Build a single prompt with rules, persona & user turn
 const fullPrompt = [
    RULES,
    PERSONA_PROMPT,
    `Parent: ${userText}`,
    `Whispr:`
  ].join('\n');

  // completePrompt will only return the generated text after "Whispr:"
  const reply = await session.completePrompt(fullPrompt, {
    maxTokens:           128,
    temperature:         0.7,
    topP:                0.9,
    repeatPenalty:       1.1,
    customStopTriggers: [
      '\nParent:',      // stop when the next user turn begins
      '\nWhispr:',      // stop if model restarts its own marker
      '### Machine',     // stop any rubric headers
      'You are Whispr', // prevent persona echo
    ],
    trimWhitespaceSuffix: true,
  });

  return reply.trim();
}

module.exports = { generateCompletion };
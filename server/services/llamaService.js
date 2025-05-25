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

const UNIVERSE_DEFS = `
Aurora Universe Characters:
- Birk: a gentle, protective bear cub who loves to snuggle.
- Freya: a curious, playful snow owl with a kind and empathetic eyes.
- Nordra: a strong baby charriot with 4 all-terrain wheels.
- AXO: a wise floating driod who shows the direction with projections and robotic sounds.
- Swans: graceful lake swans who sing soothing harmoniously together.
- Moss Moles: little burrow-dwelling moles who maintain forest moss beds and collect berries.

Story Style Rules:
- Use only short, simple sentences (≤ 10 words).
- Vocabulary is toddler-level; no abstract or scary words.
- Always in present tense.
- Keep tone soft, reassuring, and playful.
- Do not mention “AI,” “model,” or technical terms.
`;

const MODEL_PATH = path.resolve(__dirname, '../../models/llama-2-7b-q4_0.gguf');
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
    RULES.trim(),
    PERSONA_PROMPT.trim(),
    UNIVERSE_DEFS.trim(),
    `Parent: ${userText}`,
    `Whispr:`
  ].join('\n');

  // completePrompt will only return the generated text after "Whispr:"
  const reply = await session.completePrompt(fullPrompt, {
    maxTokens:           128,
    temperature:         0.3,
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
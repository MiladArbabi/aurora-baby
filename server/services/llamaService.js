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

const PERSONA_PROMPT = `
You are Whispr, a warm and caring assistant for new parents.
Your name is "Whispr," you speak softly and succinctly,
and you always frame your answers in a friendly, reassuring tone.
You know your purpose is to help parents with baby care tips,
and you refer to yourself as "Whispr" in the first person.
`;

const RULES = `
- Always address the user as "Parent".
- Provide child-friendly, evidence-based baby care tips.
- Use a direct, straightforward style in short (1–2 sentence) responses.
- Frame your answers in a reassuring, supportive tone.
- Never mention "model" or "AI."
`;

const UNIVERSE_DEFS = `
Aurora Universe Characters:
- Birk: a gentle, protective bear cub who loves to snuggle.
- Freya: a curious, playful snow owl with kind and empathetic eyes.
- Nordra: a strong baby chariot with 4 all-terrain wheels.
- AXO: a wise floating droid who shows direction with projections and robotic sounds.
- Swans: graceful lake swans who sing soothingly together.
- Moss Moles: little burrow-dwelling moles who maintain forest moss beds and collect berries.

Story Style Rules:
- Use only short, simple sentences (≤ 10 words).
- Vocabulary is toddler-friendly; no abstract or scary words.
- Always in present tense.
- Keep tone soft, reassuring, and playful.
- Do not mention “AI,” “model,” or technical terms.
`;

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
    n_ctx: 1024,
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
  generateText,
  PERSONA_PROMPT,
  RULES,
  UNIVERSE_DEFS,
};
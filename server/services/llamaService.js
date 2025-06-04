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

async function generateCompletion(promptText) {
  await loadSession();
  // build a minimal “JSON‐only” prompt (or reuse your existing story prompt)
  const fullPrompt = promptText;
  const reply = await session.completePrompt(fullPrompt, {
    maxTokens:           128,
    temperature:         0.7,
    topP:                0.9,
    repeatPenalty:       1.1,
    customStopTriggers:  ['\n\n'], // stop at double newline, etc.
    trimWhitespaceSuffix: true,
  });
  return reply.trim();
}

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

async function generateStoryCompletion(promptText) {
  // ensure the model is loaded (or error out if absent)
  await loadSession();

  // build your single, clear prompt:
  const fullPrompt = `
${UNIVERSE_DEFS.trim()}

### Your task:
Write a child-friendly story based on the prompt below.

### Prompt:
${promptText}

### Story:
`.trim();

  // now actually invoke Llama:
  const reply = await session.completePrompt(fullPrompt, {
    maxTokens:           512,    // plenty of room for a short story
    temperature:         0.7,    // creative but not random
    topP:                0.9,
    repeatPenalty:       1.1,
    customStopTriggers:  ['###'], // stop if the model echoes the next section header
    trimWhitespaceSuffix: true,
  });

  return reply.trim();
}

async function generateStoryTitle(storyText) {
  // re-use loadSession if you like, or just push it through the same session
  const titlePrompt = `
  ${UNIVERSE_DEFS.trim()}
  
  ### Your task:
  Give a very short (≤5 words), child-friendly title for the story below.
  
  ### Story:
  ${storyText}
  
  ### Title:
  `.trim();

  const raw = await session.completePrompt(titlePrompt, {
    maxTokens:  32,
    temperature: 0.3,
    topP:        0.9,
    repeatPenalty: 1.1,
    customStopTriggers: ['\n'],
    trimWhitespaceSuffix: true,
  });

  return raw.split('\n')[0].trim();
}

module.exports = { generateStoryCompletion, generateStoryTitle, generateCompletion };
const fs = require('fs');
const path = require('path');
const retry = require('async-retry');

const MODEL_PATH = process.env.MODEL_PATH || path.resolve(__dirname, '../models/llama-2-7b-q2_K.gguf');
let session = null;
let lastUsed = Date.now();

const RULES = `
You are Whispr, a warm and caring assistant for new parents.
- Always address the user as "Parent".
- Provide child-friendly, evidence-based baby care tips.
- Use a direct, straightforward style in short (1–2 sentence) responses.
- Frame your answers in a reassuring, supportive tone.
- Never mention "model" or "AI."`;

const PERSONA_PROMPT = `
You are Whispr, a warm and caring assistant for new parents.
Your name is "Whispr," you speak softly and succinctly,
and you always frame your answers in a friendly, reassuring tone.
You know your purpose is to help parents with baby care tips,
and you refer to yourself as "Whispr" in the first person.
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
- Vocabulary is toddler-level; no abstract or scary words.
- Always in present tense.
- Keep tone soft, reassuring, and playful.
- Do not mention “AI,” “model,” or technical terms.
`;

async function loadSession() {
  if (session) {
    lastUsed = Date.now();
    return;
  }
  if (!fs.existsSync(MODEL_PATH)) {
    throw new Error(`Model file not found at ${MODEL_PATH}`);
  }

  console.log('[LlamaService] Loading model...');
  const { getLlama, LlamaChatSession } = await import('node-llama-cpp');
  const llama = await getLlama();
  const model = await llama.loadModel({
    modelPath: MODEL_PATH,
    backend: 'auto',
    n_ctx: 512, // Reduced context size
    n_threads: 2, // Reduced threads for memory
  });
  const context = await model.createContext();
  session = new LlamaChatSession({ contextSequence: context.getSequence() });
  lastUsed = Date.now();
  console.log('[LlamaService] Model loaded successfully');
}

// Periodically check for inactivity to free memory
setInterval(() => {
  if (session && Date.now() - lastUsed > 30 * 60 * 1000) { // 30 minutes
    console.log('[LlamaService] Unloading model due to inactivity');
    session = null;
  }
}, 5 * 60 * 1000); // Check every 5 minutes

async function generateCompletion(promptText) {
  if (!promptText || typeof promptText !== 'string') {
    throw new Error('Prompt must be a non-empty string');
  }

  await loadSession();
  const fullPrompt = `${PERSONA_PROMPT}\n${RULES}\n${promptText}`;
  return retry(
    async () => {
      const reply = await session.completePrompt(fullPrompt, {
        maxTokens: 128,
        temperature: 0.7,
        topP: 0.9,
        repeatPenalty: 1.1,
        customStopTriggers: ['\n\n'],
        trimWhitespaceSuffix: true,
      });
      lastUsed = Date.now();
      return reply.trim();
    },
    { retries: 3, factor: 2 }
  );
}

async function generateStoryCompletion(promptText) {
  if (!promptText || typeof promptText !== 'string') {
    throw new Error('Prompt must be a non-empty string');
  }

  await loadSession();
  const fullPrompt = `
${UNIVERSE_DEFS.trim()}

### Your task:
Write a child-friendly story based on the prompt below.

### Prompt:
${promptText}

### Story:
`.trim();

  return retry(
    async () => {
      const reply = await session.completePrompt(fullPrompt, {
        maxTokens: 512,
        temperature: 0.7,
        topP: 0.9,
        repeatPenalty: 1.1,
        customStopTriggers: ['###'],
        trimWhitespaceSuffix: true,
      });
      lastUsed = Date.now();
      return reply.trim();
    },
    { retries: 3, factor: 2 }
  );
}

async function generateStoryTitle(storyText) {
  if (!storyText || typeof storyText !== 'string') {
    throw new Error('Story text must be a non-empty string');
  }

  await loadSession();
  const titlePrompt = `
${UNIVERSE_DEFS.trim()}

### Your task:
Give a very short (≤5 words), child-friendly title for the story below.

### Story:
${storyText}

### Title:
`.trim();

  return retry(
    async () => {
      const raw = await session.completePrompt(titlePrompt, {
        maxTokens: 32,
        temperature: 0.3,
        topP: 0.9,
        repeatPenalty: 1.1,
        customStopTriggers: ['\n'],
        trimWhitespaceSuffix: true,
      });
      lastUsed = Date.now();
      return raw.split('\n')[0].trim();
    },
    { retries: 3, factor: 2 }
  );
}

async function summarizeLogs(logs, options = { format: 'story' }) {
  if (!Array.isArray(logs) || logs.length === 0) {
    throw new Error('Logs must be a non-empty array');
  }
  for (const log of logs) {
    if (!log.timestamp || !log.event) {
      throw new Error('Each log must have timestamp and event');
    }
  }

  const bullets = logs.map(
    (l) =>
      `- [${l.timestamp}] ${l.event}${
        l.details ? `: ${JSON.stringify(l.details)}` : ''
      }`
  );

  const prompt = `
${PERSONA_PROMPT.trim()}
${options.format === 'story' ? UNIVERSE_DEFS.trim() : ''}

### Your task:
Provide a concise, child-friendly summary of the following logs in a ${options.format} format.
Use a warm, reassuring tone and address the user as "Parent".

### Logs:
${bullets.join('\n')}

### Summary:
`.trim();

  return retry(
    async () => {
      await loadSession();
      const raw = await session.completePrompt(prompt, {
        maxTokens: 300,
        temperature: 0.7,
        topP: 0.9,
        repeatPenalty: 1.1,
        customStopTriggers: ['###'],
        trimWhitespaceSuffix: true,
      });
      lastUsed = Date.now();
      return raw.trim();
    },
    { retries: 3, factor: 2 }
  );
}

module.exports = {
  generateCompletion,
  generateStoryCompletion,
  generateStoryTitle,
  summarizeLogs,
};
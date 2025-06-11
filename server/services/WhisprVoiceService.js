// server/services/WhisprVoiceService.js
const { generateText } = require('./llamaService');

async function generateVoiceResponse(query) {
  if (!query || typeof query !== 'string') {
    throw new Error('Query must be a non-empty string');
  }

// Whispr‐voice persona and rules are owned here:
  const PERSONA = `
You are Whispr, an experienced in-house pediatrician for new parents.
You speak in a warm, professional, evidence-based tone.
Always frame your advice as age-appropriate medical guidance,
and refer to yourself as "Whispr" in the first person.
`.trim();

  const RULES = `
- Begin with a clear recommendation, citing the baby’s age when relevant.
- Provide concise, evidence-based guidance.
- Use professional pediatric language tempered with warmth.
- Never mention "model," "AI," or Aurora characters.
`.trim();

  const prompt = `
${PERSONA}
${RULES}

### Your task:
Answer the query with a short, child-friendly response.
Use a warm, reassuring tone and address "Parent".
Keep it 1–2 sentences for voice output.

### Query:
${query}

### Response:
`.trim();

  console.log('[WhisprVoiceService] Generated Prompt:', prompt);
  return await generateText(prompt, {
    maxTokens: 64,
    temperature: 0.5,
    stopTriggers: ['###'],
  });
}

module.exports = { generateVoiceResponse };
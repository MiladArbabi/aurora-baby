// server/services/WhisprVoiceService.js
const { generateText, PERSONA_PROMPT, RULES } = require('./llamaService');

async function generateVoiceResponse(query) {
  if (!query || typeof query !== 'string') {
    throw new Error('Query must be a non-empty string');
  }

  const prompt = `
${PERSONA_PROMPT}
${RULES}

### Your task:
Answer the query with a short, child-friendly response.
Use a warm, reassuring tone and address "Parent".
Keep it 1–2 sentences for voice output.
Do not mention Aurora characters.

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
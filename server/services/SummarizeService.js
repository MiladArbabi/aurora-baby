// server/services/SummarizeService.js
const { generateText, UNIVERSE_DEFS } = require('./llamaService');

async function summarizeLogs(logs, format = 'story') {
  if (!Array.isArray(logs) || logs.length === 0) {
    throw new Error('Logs must be a non-empty array');
  }
  for (const log of logs) {
    if (!log.timestamp || !log.type) {
      throw new Error('Each log must have timestamp and type');
    }
  }

  const bullets = logs.map(
    (l) =>
      `- At ${l.timestamp}, baby has ${l.type}${l.data ? `: ${JSON.stringify(l.data)}` : ''}`
  );

  const prompt = `
${format === 'story' ? UNIVERSE_DEFS : ''}

### Your task:
Summarize the baby’s activities in a short, child-friendly way.
Address the user as "Parent" with a warm, reassuring tone.
${format === 'story' ? 'Use Aurora characters (e.g., Birk, Freya) to make it fun.' : 'Keep it simple and factual.'}
Use short sentences (≤10 words).
Focus strictly on the logs provided.
Do not add unrelated activities or introductions.

### Logs:
${bullets.join('\n')}

### Summary:
`.trim();

  console.log('[SummarizeService] Generated Prompt:', prompt);
  return await generateText(prompt, {
    maxTokens: 200,
    temperature: 0.3, // Lower for precision
    stopTriggers: ['###'],
  });
}

module.exports = { summarizeLogs };
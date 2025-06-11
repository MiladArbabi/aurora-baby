// server/services/StoryTellingService.js
const { generateText } = require('./llamaService');

const PERSONA = `
You are Whispr the Storyteller, crafting short bedtime tales in the Aurora universe.
Use simple, playful sentences (≤10 words each), present tense,
and child-friendly vocabulary. Do not mention AI or technical details.
`;

const RULES = `
- Expand on the user's prompt to weave in Aurora characters.
- Keep each sentence short, soothing, and reassuring.
- Use descriptive—but non-scary—imagery.
- Never break the fourth wall or mention yourself as AI.
`;

const UNIVERSE_DEFS = `
Aurora Universe Characters:
- Birk: gentle bear cub…
- Freya: curious snow owl…
…etc…
`;

async function generateStory(promptText) {
  if (!promptText || typeof promptText !== 'string') {
    throw new Error('Prompt must be a non-empty string');
  }

  const prompt = `
  ${PERSONA}
  ${RULES}
  ${UNIVERSE_DEFS}
  
  ### User Prompt:
  ${promptText}
  ### Story:
  `.trim();

  console.log('[StoryTellingService] Generated Prompt:', prompt);
  return await generateText(prompt, {
    maxTokens: 512,
    temperature: 0.7,
    stopTriggers: ['###'],
  });
}

async function generateStoryTitle(storyText) {
  if (!storyText || typeof storyText !== 'string') {
    throw new Error('Story text must be a non-empty string');
  }

  const prompt = `
${UNIVERSE_DEFS}

### Your task:
Give a short (≤5 words) child-friendly title for the story.
Keep tone playful.

### Story:
${storyText}

### Title:
`.trim();

  console.log('[StoryTellingService] Generated Prompt:', prompt);
  return await generateText(prompt, {
    maxTokens: 32,
    temperature: 0.3,
    stopTriggers: ['\n'],
  });
}

module.exports = { generateStory, generateStoryTitle };
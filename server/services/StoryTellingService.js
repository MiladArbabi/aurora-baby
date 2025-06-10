// server/services/StoryTellingService.js
const { generateText, UNIVERSE_DEFS } = require('./llamaService');

async function generateStory(promptText) {
  if (!promptText || typeof promptText !== 'string') {
    throw new Error('Prompt must be a non-empty string');
  }

  const prompt = `
${UNIVERSE_DEFS}

### Your task:
Write a child-friendly story based on the prompt below.
Use short sentences (≤ 10 words).
Use Aurora characters (e.g., Birk, Freya).
Keep tone playful and reassuring.

### Prompt:
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
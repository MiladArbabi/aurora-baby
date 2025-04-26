require('dotenv').config();
const router = require('express').Router();

// Mock Grok response types
const RESPONSE_TYPES = {
  CHAT: 'chat',
  STORY: 'story',
  ROUTINE: 'routine',
};

/**
 * Generates a mock Grok response based on the prompt.
 * @param {string} prompt - The user’s input prompt.
 * @returns {{ type: string, reply: string }} A child-friendly, Aurora-themed response.
 */
const generateMockResponse = (prompt) => {
  const lowerPrompt = prompt.toLowerCase();

  if (lowerPrompt.includes('story')) {
    return {
      type: RESPONSE_TYPES.STORY,
      reply: 'In Aurora’s Harmony layer, a gentle fox named Freya helps Baby Mia drift into a peaceful nap under a sparkling tree.',
    };
  } else if (lowerPrompt.includes('schedule') || lowerPrompt.includes('routine')) {
    return {
      type: RESPONSE_TYPES.ROUTINE,
      reply: 'Feed every 3 hours to keep Baby Liam happy and healthy in Aurora’s Care layer!',
    };
  } else {
    return {
      type: RESPONSE_TYPES.CHAT,
      reply: 'Hello! I’m Whispr, your guide in Aurora’s forest. How can I assist you today?',
    };
  }
};

/**
 * Handles POST requests to /api/whispr/query.
 * Expects { prompt: string } in the body.
 * Returns { reply: string } or { error: string, detail?: string }.
 */
router.post('/', async (req, res) => {
  const { prompt } = req.body;
  if (!prompt) {
    return res.status(400).json({ error: 'Missing "prompt" in request body' });
  }

  try {
    const { reply } = generateMockResponse(prompt);
    console.log(`[WhisprRoute] Mock Grok response for prompt "${prompt}": ${reply}`);
    return res.json({ reply });
  } catch (err) {
    console.error('[WhisprRoute] Error:', err.status ?? err.code, err.message);
    return res.status(500).json({
      error: 'Internal server error',
      detail: err.message,
    });
  }
});

module.exports = router;
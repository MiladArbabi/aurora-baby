// server/routes/storyRoute.js
const express = require('express');
const router = express.Router();
const Joi = require('joi');
const NodeCache = require('node-cache');
require('dotenv').config();

const cache = new NodeCache({ stdTTL: 3600 }); // 1 hour TTL
const storySchema = Joi.object({
  prompt: Joi.string().min(1).max(500).required(),
  tone: Joi.string().valid('funny', 'calm', 'adventurous').optional(),
  maxLength: Joi.number().integer().min(50).max(1000).optional(),
});

router.post('/', async (req, res) => {
  // Validate input
  const { error, value } = storySchema.validate(req.body);
  if (error) {
    return res.status(400).json({ error: error.details[0].message });
  }
  const { prompt, tone = 'calm', maxLength = 500 } = value;

  // Check cache
  const cacheKey = `${prompt}:${tone}:${maxLength}`;
  const cached = cache.get(cacheKey);
  if (cached) {
    console.log('[StoryRoute] returning cached story');
    return res.json(cached);
  }

  try {
    const { generateStoryCompletion, generateStoryTitle } = require('../services/llamaService');
    // Inject tone and maxLength into prompt
    const enhancedPrompt = `${prompt}\n\nGenerate a child-friendly story with a ${tone} tone, max ${maxLength} words.`;
    const storyText = await generateStoryCompletion(enhancedPrompt);
    const title = await generateStoryTitle(storyText);
    const response = { title, story: storyText };
    cache.set(cacheKey, response);
    return res.json(response);
  } catch (err) {
    console.error('[StoryRoute] error:', err.message);
    return res.status(500).json({ error: 'Failed to generate story' });
  }
});

module.exports = router;
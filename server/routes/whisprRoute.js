// server/routes/whisprRoute.js
const express = require('express');
const router = express.Router();
const Joi = require('joi');
require('dotenv').config();

const promptSchema = Joi.object({
  prompt: Joi.string().min(1).max(500).required(),
});

router.post('/', async (req, res) => {
  const isDev = process.env.IS_DEV === 'true';

  // Validate input
  const { error, value } = promptSchema.validate(req.body);
  if (error) {
    return res.status(400).json({ error: error.details[0].message });
  }
  const { prompt } = value;

  // Dev mode stub
  if (isDev) {
    console.log('[WhisprRoute] returning stub reply (dev mode)');
    return res.json({ reply: `🤖 (dev stub) you said “${prompt}”` });
  }

  // Import llamaService after dev check to allow mocking
  const { generateCompletion } = require('../services/llamaService');

  try {
    const replyText = await generateCompletion(prompt);
    console.log('🦙 Whispr replied:', replyText);
    return res.json({ reply: replyText });
  } catch (err) {
    console.error(
      '[WhisprRoute] error:',
      err.status ?? err.code,
      err.error?.message ?? err.message
    );
    // Offline fallback
    try {
      const { harmonySections } = require('../../src/data/harmonySections');
      if (!harmonySections?.length) {
        throw new Error('No harmony sections available');
      }
      const allStories = harmonySections.flatMap((sec) => sec.data);
      if (!allStories?.length) {
        throw new Error('No stories available in harmony sections');
      }
      const pick = allStories[Math.floor(Math.random() * allStories.length)];
      console.log('[WhisprRoute] offline fallback story:', pick.id);
      return res.json({ reply: pick.fullStory });
    } catch (fallbackErr) {
      console.error('[WhisprRoute] fallback error:', fallbackErr.message);
      return res.status(500).json({
        error: 'Internal server error',
        detail: 'Failed to generate response or fallback',
      });
    }
  }
});

module.exports = router;
// server/routes/whisprVoiceRoute.js
const express = require('express');
const router = express.Router();
const Joi = require('joi');
const { generateVoiceResponse } = require('../services/WhisprVoiceService');

const voiceSchema = Joi.object({
  query: Joi.string().min(1).max(200).required(),
});

router.post('/voice-response', async (req, res) => {
  const requestId = Math.random().toString(36).substring(7);
  console.log(`[WhisprVoiceRoute][${requestId}] Received request`);

  const { error, value } = voiceSchema.validate(req.body);
  if (error) {
    console.error(`[WhisprVoiceRoute][${requestId}] Validation error:`, error.details[0].message);
    return res.status(400).json({ error: error.details[0].message });
  }
  const { query } = value;

  try {
    const response = await generateVoiceResponse(query);
    console.log(`[WhisprVoiceRoute][${requestId}] Response generated, length: ${response.length}`);
    return res.json({ response });
  } catch (err) {
    console.error(`[WhisprVoiceRoute][${requestId}] Error:`, err.message);
    return res.status(500).json({ error: 'Failed to generate voice response', detail: err.message });
  }
});

module.exports = router;
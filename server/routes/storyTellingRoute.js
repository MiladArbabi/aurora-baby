// server/routes/storyTellingRoute.js
const express = require('express');
const router = express.Router();
const Joi = require('joi');
const { generateStory, generateStoryTitle } = require('../services/StoryTellingService');

const storySchema = Joi.object({
  prompt: Joi.string().min(1).max(500).required(),
});

router.post('/generate-story', async (req, res) => {
  const requestId = Math.random().toString(36).substring(7);
  console.log(`[StoryTellingRoute][${requestId}] Received request`);

  const { error, value } = storySchema.validate(req.body);
  if (error) {
    console.error(`[StoryTellingRoute][${requestId}] Validation error:`, error.details[0].message);
    return res.status(400).json({ error: error.details[0].message });
  }
  const { prompt } = value;

  try {
    const story = await generateStory(prompt);
    const title = await generateStoryTitle(story);
    console.log(`[StoryTellingRoute][${requestId}] Story generated, length: ${story.length}`);
    return res.json({ title, story });
  } catch (err) {
    console.error(`[StoryTellingRoute][${requestId}] Error:`, err.message);
    return res.status(500).json({ error: 'Failed to generate story', detail: err.message });
  }
});

module.exports = router;
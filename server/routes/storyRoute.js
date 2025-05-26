// server/routes/storyRoute.js
require('dotenv').config();
const router = require('express').Router();
const { generateStoryCompletion, generateStoryTitle } = require('../services/llamaService');

router.post('/', async (req, res) => {
  const { prompt } = req.body;
  if (!prompt) 
    return res.status(400).json({ error: 'Missing "prompt"' });

  try {
    // Inject only the universe/pagination rules + child-friendly tone
    const storyText = await generateStoryCompletion(prompt);
    const title = await generateStoryTitle(storyText);
    return res.json({ title, story: storyText });
  } catch (err) {
    console.error('StoryRoute error', err);
    return res.status(500).json({ error: err.message });
  }
});

module.exports = router;
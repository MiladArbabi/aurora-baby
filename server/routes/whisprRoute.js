//server/routes/whisprRoute.js
require('dotenv').config();
const router = require('express').Router();

router.post('/', async (req, res) => {
  // re-read IS_DEV on every request
  const isDev = process.env.IS_DEV === 'true';

  const { prompt } = req.body;
  if (!prompt) {
    return res.status(400).json({ error: 'Missing "prompt" in request body' });
  }

  // short-circuit in dev
  if (isDev) {
    console.log('[WhisprRoute] returning stub reply (dev mode)');
    return res.json({ reply: `🤖 (dev stub) you said “${prompt}”` });
  }

  // only now pull in your LlamaService (so jest.mock can intercept)
  const { generateCompletion } = require('../services/llamaService');

  try {
    const replyText = await generateCompletion(prompt);
    console.log('🦙 Llama replied:', replyText);
    return res.json({ reply: replyText });
  } catch (err) {
    console.error(
      '➤ WhisprRoute error:',
      err.status ?? err.code,
      err.error?.message ?? err.message
    );
    return res
      .status(err.status || 500)
      .json({ error: 'Internal server error', detail: err.error?.message });
  }
});

router.post('/suggest-logs', async (req, res) => {
  try {
    const { getAllEntries } = require('../../src/services/QuickLogAccess')
    const { generateAIQuickLogs } = require('../../src/services/LlamaLogGenerator')
    const logs = await getAllEntries()
    const suggestions = await generateAIQuickLogs(logs, 24)
    return res.json(suggestions)
  } catch (err) {
    return res.status(err.status || 500).json({ error: err.message })
  }
})

module.exports = router;
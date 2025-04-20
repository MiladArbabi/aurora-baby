// server/routes/whisprRoute.js
require('dotenv').config();
const router = require('express').Router();
const { OpenAI } = require('openai');

const isDev = process.env.IS_DEV === 'true';

if (!isDev && !process.env.OPENAI_API_KEY) {
  console.warn('[WhisprRoute] ⚠️  No OPENAI_API_KEY set!');
}

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

router.post('/', async (req, res) => {
  const { prompt } = req.body;
  if (!prompt) {
    return res.status(400).json({ error: 'Missing "prompt" in request body' });
  }

  // Short‑circuit in dev mode:
  if (isDev) {
    console.log('[WhisprRoute] returning stub reply (dev mode)');
    return res.json({ reply: `🤖 (dev stub) you said “${prompt}”` });
  }

  try {
    const chat = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages: [
        { role: 'system', content: 'You are Whispr, a helpful assistant.' },
        { role: 'user', content: prompt }
      ],
      max_tokens: 150,
    });

    const replyText = chat.choices?.[0]?.message?.content?.trim() || '';
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

module.exports = router;
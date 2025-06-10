// server/routes/summarizeLogsRoute.js
const express = require('express');
const router = express.Router();
const Joi = require('joi');
const { summarizeLogs } = require('../services/llamaService');

const logSchema = Joi.object({
  timestamp: Joi.date().iso().required(),
  event: Joi.string().valid('feeding', 'sleeping', 'playing', 'diaper').required(),
  details: Joi.object().optional(),
});

const summarizeSchema = Joi.object({
  logs: Joi.array().items(logSchema).min(1).max(100).required(), // Limit to 100 logs
  format: Joi.string().valid('story', 'narration').optional().default('story'),
});

router.post('/', async (req, res) => {
  const requestId = Math.random().toString(36).substring(7); // Simple request ID
  console.log(`[SummarizeLogsRoute][${requestId}] Received request:`, {
    logsCount: req.body.logs?.length,
    format: req.body.format,
  });

  // Validate input
  const { error, value } = summarizeSchema.validate(req.body);
  if (error) {
    console.error(`[SummarizeLogsRoute][${requestId}] Validation error:`, error.details[0].message);
    return res.status(400).json({ error: error.details[0].message });
  }
  const { logs, format } = value;

  try {
    const summary = await summarizeLogs(logs, { format });
    console.log(`[SummarizeLogsRoute][${requestId}] Summary generated, length: ${summary.length}`);
    return res.json({ summary, format });
  } catch (err) {
    console.error(`[SummarizeLogsRoute][${requestId}] Error:`, err.message);
    return res.status(500).json({
      error: 'Failed to summarize logs',
      detail: err.message,
    });
  }
});

module.exports = router;
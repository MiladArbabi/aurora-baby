// server/routes/futureLogsRoute.js
const express = require('express');
const router = express.Router();
const Joi = require('joi');
const { suggestLogs } = require('../services/FutureLogsService');

const suggestLogsSchema = Joi.object({
  hours: Joi.number().integer().min(1).max(48).optional().default(24),
});

router.post('/suggest-logs', async (req, res) => {
  const requestId = Math.random().toString(36).substring(7);
  console.log(`[FutureLogs/suggest-logs][${requestId}] Received request:`, {
    hours: req.body.hours,
  });

  const { error, value } = suggestLogsSchema.validate(req.body);
  if (error) {
    console.error(`[FutureLogs/suggest-logs][${requestId}] Validation error:`, error.details[0].message);
    return res.status(400).json({ error: error.details[0].message });
  }
  const { hours } = value;

  try {
    const aiEntries = await suggestLogs(hours);
    console.log(`[FutureLogs/suggest-logs][${requestId}] Suggested ${aiEntries.length} logs`);
    return res.json(aiEntries);
  } catch (err) {
    console.error(`[FutureLogs/suggest-logs][${requestId}] Error:`, err.message);
    return res.status(500).json({ error: 'Failed to suggest logs', detail: err.message });
  }
});

module.exports = router;
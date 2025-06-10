// server/routes/futureLogsRoute.js
const express = require('express');
const router = express.Router();
const Joi = require('joi');
const { generateCompletion } = require('../services/llamaService');
const { getAllEntries } = require('../../src/services/QuickLogAccess');

const logEntrySchema = Joi.object({
  id: Joi.string().uuid().required(),
  babyId: Joi.string().uuid().required(),
  timestamp: Joi.date().iso().required(),
  type: Joi.string().valid('feeding', 'sleeping', 'playing', 'diaper').required(),
  version: Joi.number().integer().min(1).required(),
  data: Joi.object().required(),
});

const futureLogsSchema = Joi.object({
  recentLogs: Joi.array().items(logEntrySchema).min(1).required(),
  hoursAhead: Joi.number().integer().min(1).max(48).required(),
});

const suggestLogsSchema = Joi.object({
  hours: Joi.number().integer().min(1).max(48).optional().default(24),
});

router.post('/', async (req, res) => {
  // Validate input
  const { error, value } = futureLogsSchema.validate(req.body);
  if (error) {
    return res.status(400).json({ error: error.details[0].message });
  }
  const { recentLogs, hoursAhead } = value;

  try {
    // Mock baby profile (replace with DB fetch in production)
    const name = 'Baby';
    const age = null;
    const themes = 'no specific themes';

    const prompt = `
Child’s name: ${name}${age !== null ? `, age: ${age} years` : ''}
Loves themes: ${themes}

Here are their logs for the last 24h:
${JSON.stringify(recentLogs, null, 2)}

Please output EXACTLY one JSON array—no additional text—of QuickLogEntry objects for the next ${hoursAhead} hours.
Begin and end your response between <<<JSON>>> markers. For example:
<<<JSON>>>
[
  {
    "id": "some-uuid",
    "babyId": "baby-123",
    "timestamp": "2025-06-05T10:00:00.000Z",
    "type": "feeding",
    "version": 1,
    "data": { "method": "bottle", "quantity": 5 }
  }
]
<<<JSON>>>
`;

    const raw = await generateCompletion(prompt);
    const markerStart = raw.indexOf('<<<JSON>>>');
    const markerEnd = raw.lastIndexOf('<<<JSON>>>');
    if (markerStart === -1 || markerEnd === -1 || markerEnd <= markerStart) {
      console.error('[FutureLogsRoute] did not find <<<JSON>>> markers:', raw);
      return res.json([]);
    }

    const jsonCandidate = raw.slice(markerStart + '<<<JSON>>>'.length, markerEnd).trim();
    let aiEntries;
    try {
      aiEntries = JSON.parse(jsonCandidate);
      if (!Array.isArray(aiEntries)) {
        throw new Error('Parsed value is not an array');
      }
      // Validate each entry
      for (const entry of aiEntries) {
        const { error } = logEntrySchema.validate(entry);
        if (error) {
          console.error('[FutureLogsRoute] invalid AI entry:', error.message);
          return res.json([]);
        }
      }
    } catch (parseErr) {
      console.error('[FutureLogsRoute] JSON.parse failed:', parseErr.message, '\nCandidate:', jsonCandidate);
      return res.json([]);
    }

    return res.json(aiEntries);
  } catch (err) {
    console.error('[FutureLogsRoute] error:', err.message);
    return res.status(500).json({ error: 'Failed to generate future logs' });
  }
});

router.post('/suggest-logs', async (req, res) => {
  // Validate input
  const { error, value } = suggestLogsSchema.validate(req.body);
  if (error) {
    return res.status(400).json({ error: error.details[0].message });
  }
  const { hours } = value;

  try {
    const logs = await getAllEntries();
    if (!logs?.length) {
      return res.status(400).json({ error: 'No logs available to suggest from' });
    }
    // Validate logs
    for (const log of logs) {
      const { error } = logEntrySchema.validate(log);
      if (error) {
        return res.status(400).json({ error: `Invalid log entry: ${error.message}` });
      }
    }

    // Re-use main endpoint logic
    const prompt = `
Child’s name: Baby
Loves themes: no specific themes

Here are their logs for the last 24h:
${JSON.stringify(logs, null, 2)}

Please output EXACTLY one JSON array—no additional text—of QuickLogEntry objects for the next ${hours} hours.
Begin and end your response between <<<JSON>>> markers.
`;

    const raw = await generateCompletion(prompt);
    const markerStart = raw.indexOf('<<<JSON>>>');
    const markerEnd = raw.lastIndexOf('<<<JSON>>>');
    if (markerStart === -1 || markerEnd === -1 || markerEnd <= markerStart) {
      console.error('[FutureLogsRoute/suggest-logs] did not find <<<JSON>>> markers:', raw);
      return res.json([]);
    }

    const jsonCandidate = raw.slice(markerStart + '<<<JSON>>>'.length, markerEnd).trim();
    let aiEntries;
    try {
      aiEntries = JSON.parse(jsonCandidate);
      if (!Array.isArray(aiEntries)) {
        throw new Error('Parsed value is not an array');
      }
      for (const entry of aiEntries) {
        const { error } = logEntrySchema.validate(entry);
        if (error) {
          console.error('[FutureLogsRoute/suggest-logs] invalid AI entry:', error.message);
          return res.json([]);
        }
      }
    } catch (parseErr) {
      console.error('[FutureLogsRoute/suggest-logs] JSON.parse failed:', parseErr.message);
      return res.json([]);
    }

    return res.json(aiEntries);
  } catch (err) {
    console.error('[FutureLogsRoute/suggest-logs] error:', err.message);
    return res.status(500).json({ error: 'Failed to suggest logs' });
  }
});

module.exports = router;
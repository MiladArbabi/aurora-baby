// server/routes/futureLogsRoute.js
const express = require('express');
const router = express.Router();
const { generateCompletion } = require('../services/llamaService');

// (Re-use any helper to validate or shape QuickLogEntry if desired)

router.post('/', async (req, res) => {
  try {
    // Expect body = { recentLogs: QuickLogEntry[], hoursAhead: number }
    const { recentLogs, hoursAhead } = req.body;
    if (!Array.isArray(recentLogs) || typeof hoursAhead !== 'number') {
      return res.status(400).json({ error: 'Invalid payload' });
    }

    // 1) Build the same prompt you used in RN stub—just server-side
    //    (You can copy/paste the code from src/services/LlamaLogGenerator, minus JSON.parse.)
    const name = 'Baby'; // Optionally fetch profile from DB
    const age = null;    // If available, calculate age
    const themes = 'no specific themes'; // If you want

        // We force the model to emit EXACTLY a JSON array, no extra words, by wrapping in <<<JSON>>> markers
        const prompt = `
    Child’s name: ${name}${ age !== null ? `, age: ${age} years` : '' }
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

    // 3) Extract the substring between <<<JSON>>> markers
    const markerStart = raw.indexOf('<<<JSON>>>');
    const markerEnd   = raw.lastIndexOf('<<<JSON>>>');
    if (markerStart === -1 || markerEnd === -1 || markerEnd <= markerStart) {
      console.error('[futureLogsRoute] did not find <<<JSON>>> markers in response:', raw);
      return res.json([]); 
    }

    // Everything between the two markers
    const jsonCandidate = raw.slice(markerStart + '<<<JSON>>>'.length, markerEnd).trim();

    let aiEntries;
    try {
      aiEntries = JSON.parse(jsonCandidate);
      if (!Array.isArray(aiEntries)) {
        throw new Error('Parsed value is not an array');
      }
    } catch (parseErr) {
      console.error('[futureLogsRoute] JSON.parse failed on substring:', parseErr, '\n→ candidate:', jsonCandidate);
      return res.json([]);
    }

    // 4) Return the parsed array
    return res.json(aiEntries);

  } catch (err) {
    console.error('[futureLogsRoute] unexpected error:', err);
    return res.status(500).json({ error: 'Server error generating future logs' });
  }
});

module.exports = router;

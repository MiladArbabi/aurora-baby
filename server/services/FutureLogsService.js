// server/services/FutureLogsService.js
const { generateText } = require('./llamaService');
const { getAllEntries } = require('../storage/LogRepository');

async function suggestLogs(hours = 24) {
  const logs = await getAllEntries();
  if (!logs.length) {
    throw new Error('No logs available to suggest from');
  }

  const prompt = `
### Your task:
Generate a JSON array of predicted baby log entries for the next ${hours} hours.
Use the format below, based on recent logs.
Do not include narrative text, only the JSON array.
Begin and end with <<<JSON>>> markers.

### Recent Logs:
${JSON.stringify(logs, null, 2)}

### Example Output:
<<<JSON>>>
[
  {
    "id": "uuid",
    "babyId": "${logs[0].babyId}",
    "timestamp": "2025-11-10T14:00:00Z",
    "type": "sleep",
    "version": 1,
    "data": { "duration": 60 }
  }
]
<<<JSON>>>
`.trim();

  console.log('[FutureLogsService] Generated Prompt:', prompt);
  const raw = await generateText(prompt, {
    maxTokens: 512,
    temperature: 0.3, // Low for structured output
    stopTriggers: ['###'],
  });

  const markerStart = raw.indexOf('<<<JSON>>>');
  const markerEnd = raw.lastIndexOf('<<<JSON>>>');
  if (markerStart === -1 || markerEnd === -1 || markerEnd <= markerStart) {
    console.error('[FutureLogsService] No JSON markers in response:', raw);
    return [];
  }

  const jsonCandidate = raw.slice(markerStart + '<<<JSON>>>'.length, markerEnd).trim();
  try {
    const parsed = JSON.parse(jsonCandidate);
    if (!Array.isArray(parsed)) {
      throw new Error('Parsed output is not an array');
    }
    return parsed;
  } catch (err) {
    console.error('[FutureLogsService] JSON parse error:', err.message, jsonCandidate);
    return [];
  }
}

module.exports = { suggestLogs };
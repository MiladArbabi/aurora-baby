// server/server.js
require('dotenv').config({ path: require('path').resolve(__dirname, '.env') });
const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');

const futureLogsRouter = require('./routes/futureLogsRoute');
const summarizeLogsRouter = require('./routes/summarizeLogsRoute');
const storyTellingRouter = require('./routes/storyTellingRoute');
const whisprVoiceRouter = require('./routes/whisprVoiceRoute');

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(morgan('combined')); // Log HTTP requests
app.use(
  '/api/',
  rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // 100 requests per window per IP
    message: { error: 'Too many requests, please try again later' },
  })
);

// Routes
app.use('/whispr-voice', whisprVoiceRouter); // Updated
app.use('/story-telling', storyTellingRouter); // Updated
app.use('/api/futureLogs', futureLogsRouter);
app.use('/summarize-logs', summarizeLogsRouter);

// Health check
app.get('/health', (req, res) => res.json({ status: 'OK' }));

// Global error handler
app.use((err, req, res, next) => {
  console.error('[GlobalError]', err.stack);
  res.status(500).json({ error: 'Internal server error', detail: err.message });
});

const PORT = process.env.PORT || 4000;
if (require.main === module) {
  app.listen(PORT, () => console.log(`[Server] Listening on http://localhost:${PORT}`));
}

module.exports = app;
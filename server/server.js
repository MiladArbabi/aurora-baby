require('dotenv').config({ path: require('path').resolve(__dirname, '.env') });
const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const whisprRoute = require('./routes/whisprRoute');
const storyRoute = require('./routes/storyRoute');
const futureLogsRoute = require('./routes/futureLogsRoute');
const summarizeLogsRoute = require('./routes/summarizeLogsRoute');

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
app.use('/api/whispr/query', whisprRoute);
app.use('/api/story/generate', storyRoute);
app.use('/api/futureLogs', futureLogsRoute);
app.use('/summarize-logs', summarizeLogsRoute);

// Health check
app.get('/health', (req, res) => res.json({ status: 'OK' }));

// Global error handler
app.use((err, req, res, next) => {
  console.error('[GlobalError]', err.stack);
  res.status(500).json({ error: 'Internal server error', detail: err.message });
});

const PORT = process.env.PORT || 4000;
if (require.main === module) {
  app.listen(PORT, () => console.log(`Listening on ${PORT}`));
}

module.exports = app;
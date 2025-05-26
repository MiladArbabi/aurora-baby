//server/server.js
require('dotenv').config({ path: require('path').resolve(__dirname, '.env') });
const express = require('express');
const cors    = require('cors');
const whisprRoute = require('./routes/whisprRoute');
const storyRoute = require('./routes/storyRoute');

const app = express();
app.use(cors());
app.use(express.json());
app.use('/api/whispr/query', whisprRoute);
app.use('/api/story/generate', storyRoute);

const PORT = process.env.PORT || 4000;
if (require.main === module) {
  app.listen(PORT, () => console.log(`Listening on ${PORT}`));
}
module.exports = app;

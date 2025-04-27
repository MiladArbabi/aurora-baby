// server/server.js
require('dotenv').config();
const express = require('express');
const cors = require('cors');
const whisprRoute = require('./routes/whisprRoute');

const app = express()

// Enable CORS + JSON body parsing
app.use(cors());
app.use(express.json());

// Mount our Whispr handler
app.use('/api/whispr/query', whisprRoute);

const PORT = process.env.PORT || 4000;
if (require.main === module) {
    // only start server when run directly
    app.listen(PORT, () => console.log(`Listening on ${PORT}`))
  }

  export default app


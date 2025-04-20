// server/server.js
require('dotenv').config();
const express = require('express');
const cors = require('cors');
const whisprRoute = require('./routes/whisprRoute');

const app = express();

// Enable CORS + JSON body parsing
app.use(cors());
app.use(express.json());

// Mount our Whispr handler
app.use('/api/whispr/query', whisprRoute);

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => console.log(`Whispr server listening on ${PORT}`));
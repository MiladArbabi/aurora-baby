// server/_tests_/whisprRoute.fallback.test.js
const request = require('supertest');
const express = require('express');

// Create an isolated app instance for tests
const app = express();
app.use(express.json());
// Mount the whisprRoute
app.use('/', require('../routes/whisprRoute'));

// Mock environment
process.env.IS_DEV = 'false';

// Mock LlamaService to throw
jest.mock('../services/llamaService', () => ({
  generateCompletion: jest.fn().mockImplementation(() => {
    throw new Error('Simulated AI failure');
  }),
}));

// Mock harmonySections data
jest.mock('../../src/data/harmonySections', () => ({
  harmonySections: [
    { data: [ { id: 'pre1', fullStory: 'Story one.' } ] },
    { data: [ { id: 'pre2', fullStory: 'Story two.' } ] },
  ],
}));

describe('POST /', () => {
  it('returns a random prebuilt story on AI failure', async () => {
    const res = await request(app)
      .post('/')
      .send({ prompt: 'Hello' });

    expect(res.status).toBe(200);
    expect(['Story one.', 'Story two.']).toContain(res.body.reply);
  });
});

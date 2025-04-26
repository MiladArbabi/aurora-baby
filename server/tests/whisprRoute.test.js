const request = require('supertest');
const express = require('express');
const whisprRoute = require('../routes/whisprRoute');

const app = express();
app.use(express.json());
app.use('/api/whispr/query', whisprRoute);

describe('POST /api/whispr/query', () => {
  it('should return a mock Grok chat response for a chat prompt', async () => {
    const response = await request(app)
      .post('/api/whispr/query')
      .send({ prompt: 'Hello, Whispr!' })
      .expect(200);

    expect(response.body).toHaveProperty('reply');
    expect(typeof response.body.reply).toBe('string');
    expect(response.body.reply).toMatch(/Hello! I['’]m Whispr, your guide in Aurora/);
  });

  it('should return a mock Grok story for a story prompt', async () => {
    const response = await request(app)
      .post('/api/whispr/query')
      .send({ prompt: 'Generate a story for a 3-year-old about a nap' })
      .expect(200);

    expect(response.body).toHaveProperty('reply');
    expect(typeof response.body.reply).toBe('string');
    expect(response.body.reply).toMatch(/In Aurora’s Harmony layer/);
  });

  it('should return a mock Grok routine suggestion for a routine prompt', async () => {
    const response = await request(app)
      .post('/api/whispr/query')
      .send({ prompt: 'Suggest a feeding schedule' })
      .expect(200);

    expect(response.body).toHaveProperty('reply');
    expect(typeof response.body.reply).toBe('string');
    expect(response.body.reply).toMatch(/Feed every 3 hours/);
  });

  it('should return 400 if prompt is missing', async () => {
    const response = await request(app)
      .post('/api/whispr/query')
      .send({})
      .expect(400);

    expect(response.body).toHaveProperty('error', 'Missing "prompt" in request body');
  });
});
// server/routes/_tests_/whisprRoute.test.js
import * as QuickLogAccess from '../../../src/services/QuickLogAccess'
import * as LlamaGen       from '../../../src/services/LlamaLogGenerator'
import type { QuickLogEntry } from '../../../src/models/QuickLogSchema'

jest.mock('../../../src/services/QuickLogAccess')
jest.mock('../../../src/services/LlamaLogGenerator')

const fakeLogs: QuickLogEntry[] = [
  { id:'1', 
    babyId:'b1', 
    timestamp:new Date().toISOString(), 
    type:'diaper', 
    version:1, data:{ status:'wet' 
}}
]

//── Import the router and its dependencies ─────────────────────
jest.mock('../../../src/services/QuickLogAccess', () => ({
  getAllEntries: jest.fn()
}))
jest.mock('../../../src/services/LlamaLogGenerator', () => ({
  generateAIQuickLogs: jest.fn()
}))

const { getAllEntries } = require('../../../src/services/QuickLogAccess')
const { generateAIQuickLogs } = require('../../../src/services/LlamaLogGenerator')
const router = require('../whisprRoute')

// --------------------------------------------------------------------
// 1) The dev-mode tests
// --------------------------------------------------------------------
process.env.IS_DEV = 'true'          // simulate DEV
const request = require('supertest')
const express = require('express')
const bodyParser = require('body-parser')
const whisprRoute = require('../whisprRoute') // load under DEV

// build one app instance that always sees DEV=true
const devApp = express()
devApp.use(bodyParser.json())
devApp.use('/', whisprRoute)

describe('POST /  (dev mode)', () => {
  it('400 when prompt is missing', async () => {
    const res = await request(devApp).post('/').send({})
    expect(res.status).toBe(400)
    expect(res.body).toEqual({ error: 'Missing "prompt" in request body' })
  })

  it('returns dev stub in DEV mode', async () => {
    const res = await request(devApp)
      .post('/')
      .send({ prompt: 'foo' })
    expect(res.status).toBe(200)
    expect(res.body.reply).toMatch(/^🤖 \(dev stub\) you said “foo”/)
  })
})


// --------------------------------------------------------------------
// 2) Now the production‐mode tests
// --------------------------------------------------------------------
describe('POST /  (production mode)', () => {
  let prodApp
  let generateCompletionMock

  beforeAll(() => {
    process.env.IS_DEV = 'false'
  })

  beforeEach(() => {
    // Clear the require cache so that our jest.mock below is applied fresh:
    jest.resetModules()

    // 1) Mock out the llamaService module
    jest.mock('../../services/llamaService', () => ({
      generateCompletion: jest.fn(),
    }))

    // 2) Grab the mock for use in the tests
    generateCompletionMock = require('../../services/llamaService')
      .generateCompletion

    // 3) Re-require the route (so it pulls in the freshly mocked llamaService)
    const express = require('express')
    const bodyParser = require('body-parser')
    const whisprRoute = require('../whisprRoute')

    // 4) Re-build the app under production
    prodApp = express()
    prodApp.use(bodyParser.json())
    prodApp.use('/', whisprRoute)
  })

  it('invokes generateCompletion and returns its reply', async () => {
    // Arrange: stub our mock
    generateCompletionMock.mockResolvedValueOnce('🐣 hi')

    // Act
    const res = await request(prodApp)
      .post('/')
      .send({ prompt: 'hello' })

    // Assert
    expect(generateCompletionMock).toHaveBeenCalledWith('hello')
    expect(res.status).toBe(200)
    expect(res.body).toEqual({ reply: '🐣 hi' })
  })

  it('returns 500 when generateCompletion throws', async () => {
    // Arrange
    generateCompletionMock.mockRejectedValueOnce(new Error('oops'))

    // Act
    const res = await request(prodApp)
      .post('/')
      .send({ prompt: 'hello' })

    // Assert
    expect(generateCompletionMock).toHaveBeenCalledWith('hello')
    expect(res.status).toBe(500)
    expect(res.body).toHaveProperty('error', 'Internal server error')
  })
});

describe('POST /api/whispr/suggest-logs', () => {
  let app
  beforeAll(() => {
    app = express()
    app.use(express.json())
    app.use('/api/whispr', router)
  })

  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('returns 200 + a validated array on success', async () => {
    // 1) Stub out getAllEntries to return one “recent” log
    const now = new Date()
    const recentLog = { id: '1', babyId: 'b', timestamp: now.toISOString(), type: 'sleep', version:1, data:{ start: now.toISOString(), end: now.toISOString(), duration: 30 } }
    getAllEntries.mockResolvedValue([recentLog])

    // 2) Stub generateAIQuickLogs to return a valid QuickLogEntry[]
    const suggestion = { ...recentLog, id: '2' }
    generateAIQuickLogs.mockResolvedValue([suggestion])

    const res = await request(app)
      .post('/api/whispr/suggest-logs')
      .send({}) // body is ignored for this endpoint
      .expect(200)

    expect(generateAIQuickLogs).toHaveBeenCalledWith([recentLog], 24)
    expect(res.body).toEqual([expect.objectContaining({ id: '2', type: 'sleep' })])
  })

  it('returns 500 if AI throws', async () => {
    getAllEntries.mockResolvedValue([])
    generateAIQuickLogs.mockRejectedValue(new Error('llama down'))

    const res = await request(app)
      .post('/api/whispr/suggest-logs')
      .send({})
      .expect(500)

    expect(res.body).toHaveProperty('error', 'llama down')
  })

  it('returns AI-generated quick logs', async () => {
    (QuickLogAccess.getAllEntries as jest.Mock).mockResolvedValue(fakeLogs)
    ;(LlamaGen.generateAIQuickLogs as jest.Mock).mockResolvedValue(fakeLogs)

    const res = await request(app).post('/api/whispr/suggest-logs')
    expect(res.status).toBe(200)
    expect(res.body).toEqual(fakeLogs)
    expect(QuickLogAccess.getAllEntries).toHaveBeenCalled()
    expect(LlamaGen.generateAIQuickLogs).toHaveBeenCalledWith(
      expect.arrayContaining(fakeLogs),
      24
    )
  })

  it('propagates errors as 500', async () => {
    (QuickLogAccess.getAllEntries as jest.Mock).mockRejectedValue(new Error('oops'))
    const res = await request(app).post('/api/whispr/suggest-logs')
    expect(res.status).toBe(500)
    expect(res.body).toHaveProperty('error', 'oops')
  })

  it('200 + returns AI suggestions', async () => {
    // make getAllEntries return one “recent” log:
    (getAllEntries as jest.Mock).mockResolvedValue([fakeLogs]);
    // stub the AI generator to return another log:
    const suggestion = { ...fakeLogs, id: '2' };
    (generateAIQuickLogs as jest.Mock).mockResolvedValue([suggestion]);

    const res = await request(app)
      .post('/api/whispr/suggest-logs')
      .send(); // no body needed

    expect(res.status).toBe(200);
    expect(getAllEntries).toHaveBeenCalled();
    expect(generateAIQuickLogs).toHaveBeenCalledWith([fakeLogs], 24);
    expect(res.body).toEqual([expect.objectContaining({ id: '2' })]);
  });

  it('500 + propagates errors', async () => {
    (getAllEntries as jest.Mock).mockRejectedValue(new Error('db down'));
    const res = await request(app)
      .post('/api/whispr/suggest-logs')
      .send();
    expect(res.status).toBe(500);
    expect(res.body).toHaveProperty('error', 'db down');
  });
});
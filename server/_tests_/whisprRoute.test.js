// server/routes/_tests_/whisprRoute.test.js

// --------------------------------------------------------------------
// 1) The dev-mode tests
// --------------------------------------------------------------------
process.env.IS_DEV = 'true'          // simulate DEV
const request = require('supertest')
const express = require('express')
const bodyParser = require('body-parser')
const whisprRoute = require('../routes/whisprRoute') // load under DEV

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
    generateCompletionMock = require('../services/llamaService')
      .generateCompletion

    // 3) Re-require the route (so it pulls in the freshly mocked llamaService)
    const express = require('express')
    const bodyParser = require('body-parser')
    const whisprRoute = require('../routes/whisprRoute')

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
})
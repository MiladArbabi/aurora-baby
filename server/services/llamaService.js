// simply re-export the generateCompletion from our shared LlamaService
const { generateCompletion } = require('../../src/services/LlamaService');
module.exports = { generateCompletion };
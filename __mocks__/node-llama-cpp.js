//__mocks__/node-llama-cpp.js
class Llama {
    constructor(opts) {
      // you can record opts if you need to assert on them
    }
    async generate({ prompt, max_tokens }) {
      // return a dummy completion
      return `<<MOCKED>> ${prompt}`;
    }
  }
  
  module.exports = { Llama };
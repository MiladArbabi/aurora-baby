module.exports = {
    testEnvironment: 'node', // Use Node.js environment for backend tests
    testMatch: ['<rootDir>/tests/**/*.test.js'], // Match tests in server/tests/
    moduleFileExtensions: ['js', 'json', 'node'], // Support JS files
    transform: {
      '^.+\\.js$': ['babel-jest', { configFile: '../.babelrc' }], // Use root .babelrc for consistency
    },
    setupFilesAfterEnv: ['<rootDir>/tests/setup.js'], // Optional setup file (create if needed)
  };
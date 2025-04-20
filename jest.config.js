module.exports = {
  preset: 'jest-expo',
  testEnvironment: 'jsdom',
  setupFiles: ['<rootDir>/jest/setup.js'],
  moduleDirectories: ['node_modules', 'src'],
  setupFilesAfterEnv: ['@testing-library/react-native/extend-expect'],
  transform: {
    '^.+\\.(ts|tsx)$': ['ts-jest', {
      tsconfig: './tsconfig.jest.json',
      useESM: false,
      babelConfig: true,
      // disable type‑checking diagnostics for transformed files
      diagnostics: false
    }],
    '^.+\\.(js|jsx)$': ['babel-jest', { configFile: './.babelrc' }]
  },
  transformIgnorePatterns: [
    'node_modules/(?!((jest-)?react-native|@react-native(-community)?)|expo(nent)?|@expo(nent)?/.*|@expo-google-fonts/.*|react-navigation|@react-navigation/.*|@unimodules/.*|unimodules|sentry-expo|native-base|react-native-svg|@rneui/.*|d3-shape|d3-path|@gorhom/bottom-sheet|react-native-reanimated|react-native-gesture-handler|react-native-modal)'
  ],
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json', 'node'],
  moduleNameMapper: {
    '^react-native-gesture-handler$': '<rootDir>/src/__mocks__/react-native-gesture-handler.tsx',
    '^react-native-reanimated$': '<rootDir>/src/__mocks__/react-native-reanimated.ts',
    '^firebase(/.*)?$': '<rootDir>/src/__mocks__/firebase.ts',
    '^expo-constants$': '<rootDir>/src/__mocks__/expo-constants.ts',
    '^@react-native-voice/voice$': '<rootDir>/src/__mocks__/@react-native-voice/voice.js',
  }
};

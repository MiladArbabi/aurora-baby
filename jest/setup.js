//jest/setup.js
import mockAsyncStorage from '@react-native-async-storage/async-storage/jest/async-storage-mock';

global.setImmediate = setTimeout;
global.clearImmediate = clearTimeout;

global.expo = {
  uuidv4: () => 'mock-uuid-v4',
  uuidv5: () => 'mock-uuid-v5',
};

jest.mock('@react-native-async-storage/async-storage', () => mockAsyncStorage);

// explicitly load our hand-written mock file
try {
    jest.mock(
      '@react-native-google-signin/google-signin',
    () => require('../src/__mocks__/google-signin.js')
    );
  } catch (e) {
    // nothing to do if it fails
  }

jest.mock('expo-font', () => ({
  useFonts: jest.fn(() => [true]),
}));

const { TextEncoder, TextDecoder } = require('util')
global.TextEncoder = TextEncoder
global.TextDecoder = TextDecoder

jest.mock('expo-speech', () => ({
  speak: jest.fn(),
}));
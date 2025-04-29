//src/__mocks__/@react-native-voice/voice.js
// a Jest manual mock that exports the same API shape
export default {
    onSpeechStart: null,
    onSpeechResults: null,
    onSpeechError: null,
    start: jest.fn().mockResolvedValue(undefined),
    stop: jest.fn().mockResolvedValue(undefined),
    destroy: jest.fn().mockResolvedValue(undefined),
    removeAllListeners: jest.fn(),
  };  
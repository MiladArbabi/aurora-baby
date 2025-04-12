import mockAsyncStorage from '@react-native-async-storage/async-storage/jest/async-storage-mock';

global.setImmediate = setTimeout;
global.clearImmediate = clearTimeout;

global.expo = {
  uuidv4: () => 'mock-uuid-v4',
  uuidv5: () => 'mock-uuid-v5',
};

jest.mock('@react-native-async-storage/async-storage', () => mockAsyncStorage);
jest.mock('@react-native-google-signin/google-signin', () => ({
  GoogleSignin: {
    configure: jest.fn(),
    hasPlayServices: jest.fn().mockResolvedValue(true),
    signIn: jest.fn().mockResolvedValue({ data: { idToken: 'mock-token' } }),
  },
}));

jest.mock('expo-font', () => ({
  useFonts: jest.fn(() => [true]),
}));

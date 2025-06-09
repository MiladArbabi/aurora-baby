// src/__mocks__/google-signin.ts
module.exports = {
    GoogleSignin: {
      configure: jest.fn(),
      hasPlayServices: jest.fn().mockResolvedValue(true),
      signIn: jest.fn().mockResolvedValue({ data: { idToken: 'mock-token' } }),
    },
  };
  
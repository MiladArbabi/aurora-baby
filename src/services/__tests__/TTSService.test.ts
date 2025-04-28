// src/services/__tests__/TTSService.test.ts
import { speak } from '../TTSService';
import { NativeModules } from 'react-native';

type SpeakOptions = {
  onDone?: () => void;
  onError?: (err: any) => void;
};

describe('TTSService', () => {
  const mockSpeak = jest.fn((_: string, opts?: SpeakOptions) => {});

  beforeEach(() => {
    // Install our fake module into RN’s NativeModules
    NativeModules.ExpoSpeech = { speak: mockSpeak };
    mockSpeak.mockReset();
  });

  it('resolves when ExpoSpeech.speak calls onDone', async () => {
    mockSpeak.mockImplementation((_, opts) => {
      opts?.onDone?.();
    });

    await expect(speak('hello')).resolves.toBeUndefined();
    expect(mockSpeak).toHaveBeenCalledWith(
      'hello',
      expect.objectContaining({ onDone: expect.any(Function), onError: expect.any(Function) })
    );
  });

  it('rejects when ExpoSpeech.speak calls onError', async () => {
    const error = new Error('TTS failed');
    mockSpeak.mockImplementation((_, opts) => {
      opts?.onError?.(error);
    });

    await expect(speak('oops')).rejects.toBe(error);
  });
});
// src/services/__tests__/STTService.test.ts
import Voice from '@react-native-voice/voice';
import { listen } from '../STTService';

// Mock the react-native-voice module
jest.mock('@react-native-voice/voice');

describe('STTService.listen', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('resolves with transcript on successful recognition', async () => {
    // Setup: when start is called, simulate onSpeechResults callback
    (Voice.start as jest.Mock).mockImplementation(async () => {
      if (Voice.onSpeechResults) {
        Voice.onSpeechResults({ value: ['test transcript'] });
      }
    });
    // stop should resolve cleanly
    (Voice.stop as jest.Mock).mockResolvedValue(undefined);

    const result = await listen('en-US');

    expect(Voice.start).toHaveBeenCalledWith('en-US');
    expect(Voice.stop).toHaveBeenCalled();
    expect(result).toBe('test transcript');
  });

  it('rejects with error message on speech error', async () => {
    const errorEvent = { error: { message: 'mic failure' } };
    (Voice.start as jest.Mock).mockImplementation(async () => {
      if (Voice.onSpeechError) {
        Voice.onSpeechError(errorEvent);
      }
    });
    (Voice.stop as jest.Mock).mockResolvedValue(undefined);

    await expect(listen()).rejects.toThrow('mic failure');
  });
});

// src/services/__tests__/TTSService.test.ts
import { speak } from '../TTSService';
import * as Speech from 'expo-speech';

type SpeakOptions = Parameters<typeof Speech.speak>[1];
const mockSpeak = Speech.speak as jest.MockedFunction<typeof Speech.speak>;

describe('TTSService', () => {
      it('calls Speech.speak and resolves onDone', async () => {
        // Arrange: when Speech.speak is called, immediately invoke onDone
        mockSpeak.mockImplementation((text: string, options?: SpeakOptions) => {
            options?.onDone?.();
          }
        );
    
        // Act & Assert
        await expect(speak('hello')).resolves.toBeUndefined();
        expect(mockSpeak).toHaveBeenCalledWith(
          'hello',
          expect.objectContaining({
            onDone: expect.any(Function),
            onError: expect.any(Function),
          })
        );
      });
    
      it('rejects when Speech.speak onError fires', async () => {
        const error = new Error('TTS failed');
        // Arrange: when Speech.speak is called, immediately invoke onError
        mockSpeak.mockImplementation((text: string, options?: SpeakOptions) => {
            options?.onError?.(error);
          }
        );
    
        // Act & Assert
        await expect(speak('oops')).rejects.toBe(error);
      });
    });

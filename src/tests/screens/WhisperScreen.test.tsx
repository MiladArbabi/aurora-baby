// WhisprScreen.test.tsx
import React from 'react';
import { render } from '@testing-library/react-native';
import WhisprScreen from '../../screens/WhisperScreen';

describe('WhisprScreen', () => {
  test('renders Greeting text', () => {
    const { getByText } = render(<WhisprScreen />);
    expect(getByText(/Hello, I'm Whispr/i)).toBeTruthy();
  });

  test('renders input form', () => {
    const { getByTestId } = render(<WhisprScreen />);
    expect(getByTestId('whispr-input-form')).toBeTruthy();
  });

  test('renders Whisper Voice button', () => {
    const { getByTestId } = render(<WhisprScreen />);
    expect(getByTestId('whisper-voice-btn')).toBeTruthy();
  });
});
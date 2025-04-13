// src/tests/screens/CareScreen.test.tsx
import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import CareScreen from '../../screens/CareScreen';
import { GestureHandlerRootView } from 'react-native-gesture-handler';

describe('CareScreen', () => {
  it('renders and toggles native Modal on button press', async () => {
    const { getByTestId, getByText, queryByText } = render(
      <GestureHandlerRootView style={{ flex: 1 }}>
        <CareScreen />
      </GestureHandlerRootView>
    );

    // Confirm placeholder is visible
    expect(getByTestId('care-placeholder')).toBeTruthy();

    // Open modal
    fireEvent.press(getByTestId('open-sheet'));
    await waitFor(() => expect(getByText('This is the native modal')).toBeTruthy());

    // Close modal
    fireEvent.press(getByText('Close'));
    await waitFor(() => expect(queryByText('This is the native modal')).toBeNull());
  });
});
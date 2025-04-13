// src/tests/screens/CareScreen.test.tsx
import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import CareScreen from '../../screens/CareScreen';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { PortalProvider } from '@gorhom/portal';


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

it('renders MiniNavBar and switches tabs on icon press', async () => {
  const { getByTestId, getByText } = render(
    <GestureHandlerRootView style={{ flex: 1 }}>
      <PortalProvider>
        <CareScreen />
      </PortalProvider>
    </GestureHandlerRootView>
  );

  expect(getByTestId('care-placeholder')).toBeTruthy();

  // Initially tracker is active
  expect(getByTestId('active-tab-indicator').props.children).toContain('tracker');

  fireEvent.press(getByTestId('graph-icon'));
  expect(getByTestId('active-tab-indicator').props.children).toContain('graph');

  fireEvent.press(getByTestId('cards-icon'));
  expect(getByTestId('active-tab-indicator').props.children).toContain('cards');

  fireEvent.press(getByTestId('tracker-icon'));
  expect(getByTestId('active-tab-indicator').props.children).toContain('tracker');
});

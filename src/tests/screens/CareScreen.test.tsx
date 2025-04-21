// src/tests/screens/CareScreen.test.tsx
import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import CareScreen from '../../screens/CareScreen';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { PortalProvider } from '@gorhom/portal';
import { ThemeProvider } from '@rneui/themed';
import { ThemeProvider as StyledThemeProvider } from 'styled-components/native';
import { NavigationContainer } from '@react-navigation/native';
import { rneThemeBase, theme } from '../../styles/theme';

// --- NAV MOCK ---
const mockNavigate = jest.fn();
jest.mock('@react-navigation/native', () => {
  const actual = jest.requireActual('@react-navigation/native');
  return {
    ...actual,
    useNavigation: () => ({ navigate: mockNavigate }),
  };
});

// --- VOICE RECORDER MOCK ---
const mockStart = jest.fn().mockResolvedValue(undefined);
const mockStop = jest.fn().mockResolvedValue(undefined);
jest.mock('../../hooks/useVoiceRecorder', () => ({
  useVoiceRecorder: () => ({
    transcript: 'hello world',
    isListening: false,
    error: null,
    start: mockStart,
    stop: mockStop,
  }),
}));

const renderWithProviders = () =>
  render(
    <GestureHandlerRootView style={{ flex: 1 }}>
      <ThemeProvider theme={rneThemeBase}>
        <StyledThemeProvider theme={theme}>
          <NavigationContainer>
            <PortalProvider>
              <CareScreen />
            </PortalProvider>
          </NavigationContainer>
        </StyledThemeProvider>
      </ThemeProvider>
    </GestureHandlerRootView>
  );

describe('CareScreen', () => {
  beforeEach(() => {
    mockNavigate.mockClear();
    mockStart.mockClear();
    mockStop.mockClear();
  });

  it('renders MiniNavBar and switches tabs on icon press', () => {
    const { getByTestId } = renderWithProviders();

    expect(getByTestId('active-tab-indicator').props.children).toContain('tracker');

    fireEvent.press(getByTestId('graph-icon'));
    expect(getByTestId('active-tab-indicator').props.children).toContain('graph');

    fireEvent.press(getByTestId('cards-icon'));
    expect(getByTestId('active-tab-indicator').props.children).toContain('cards');

    fireEvent.press(getByTestId('tracker-icon'));
    expect(getByTestId('active-tab-indicator').props.children).toContain('tracker');
  });

  it('renders a linear gradient background', () => {
    const { getByTestId } = renderWithProviders();
    expect(getByTestId('carescreen-gradient')).toBeTruthy();
  });

  it('opens and closes QuickLogMenu via the plus button', async () => {
    const { getByTestId, queryByTestId } = renderWithProviders();

    expect(queryByTestId('quick-log-menu')).toBeNull();

    fireEvent.press(getByTestId('quick-log-open-button'));
    await waitFor(() => {
      expect(getByTestId('quick-log-menu')).toBeTruthy();
    });

    fireEvent.press(getByTestId('menu-handle'));
    await waitFor(() => {
      expect(queryByTestId('quick-log-menu')).toBeNull();
    });
  });

  it('navigates to Whispr when the whispr button is pressed', () => {
    const { getByTestId } = renderWithProviders();
    fireEvent.press(getByTestId('whispr-voice-button'));
    expect(mockNavigate).toHaveBeenCalledWith('Whispr');
  });

  it('calls start and stop on the recorder when mic button is pressed', async () => {
    const { getByTestId } = renderWithProviders();

    fireEvent.press(getByTestId('tracker-mic-button'));
    await waitFor(() => {
      expect(mockStart).toHaveBeenCalled();
      expect(mockStop).toHaveBeenCalled();
    });
  });
});
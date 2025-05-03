import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import CareScreen from '../../screens/CareScreen';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { PortalProvider } from '@gorhom/portal';
import { ThemeProvider as RneThemeProvider } from '@rneui/themed';
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

// --- VOICE RECORDER MOCK (not used in CareScreen) ---
jest.mock('../../hooks/useVoiceRecorder', () => ({
  useVoiceRecorder: () => ({
    transcript: 'hello world',
    isListening: false,
    error: null,
    start: jest.fn(),
    stop: jest.fn(),
  }),
}));

const renderWithProviders = () =>
  render(
    <GestureHandlerRootView style={{ flex: 1 }}>
      <RneThemeProvider theme={rneThemeBase}>
        <StyledThemeProvider theme={theme}>
          <NavigationContainer>
            <PortalProvider>
              <CareScreen />
            </PortalProvider>
          </NavigationContainer>
        </StyledThemeProvider>
      </RneThemeProvider>
    </GestureHandlerRootView>
  );

describe('CareScreen', () => {
  beforeEach(() => {
    mockNavigate.mockClear();
  });

  it('renders MiniNavBar and switches tabs on icon press', () => {
    const { getByTestId, getByText } = renderWithProviders();
    expect(getByTestId('outter-rim')).toBeTruthy();

    fireEvent.press(getByTestId('graph-icon'));
    expect(getByText('AI Suggestions')).toBeTruthy();

    fireEvent.press(getByTestId('cards-icon'));
    expect(getByText('No logs yet.')).toBeTruthy();

    fireEvent.press(getByTestId('tracker-icon'));
    expect(getByTestId('outter-rim')).toBeTruthy();
  });

  it('renders a linear gradient background', () => {
    const { getByTestId } = renderWithProviders();
    expect(getByTestId('carescreen-gradient')).toBeTruthy();
  });

  it('opens and closes QuickLogMenu via the plus button', async () => {
    const { getByTestId, queryByTestId } = renderWithProviders();

    expect(queryByTestId('quick-log-menu')).toBeNull();

    fireEvent.press(getByTestId('action-menu'));
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
    fireEvent.press(getByTestId('bottom-nav-whispr'));
    expect(mockNavigate).toHaveBeenCalledWith('Whispr');
  });
});
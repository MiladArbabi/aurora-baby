import React from 'react';
import { fireEvent, render, waitFor } from '@testing-library/react-native';
import ProfileSettingScreen from '../../screens/ProfileSettingScreen';
import { NavigationContainer } from '@react-navigation/native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { ThemeProvider } from '@rneui/themed';
import { ThemeProvider as StyledThemeProvider } from 'styled-components/native';
import { rneThemeBase, theme } from '../../styles/theme';

jest.mock('firebase/auth', () => ({
  getAuth: jest.fn(() => ({})),
  signOut: jest.fn(() => Promise.resolve()),
}));

const mockGoBack = jest.fn();
const mockNavigate = jest.fn();

jest.mock('@react-navigation/native', () => {
  const actualNav = jest.requireActual('@react-navigation/native');
  return {
    ...actualNav,
    useNavigation: () => ({
      goBack: mockGoBack,
      navigate: mockNavigate,
    }),
  };
});

const renderWithProviders = () =>
    render(
      <GestureHandlerRootView style={{ flex: 1 }}>
        <ThemeProvider theme={rneThemeBase}>
          <StyledThemeProvider theme={theme}>
            <ProfileSettingScreen />
          </StyledThemeProvider>
        </ThemeProvider>
      </GestureHandlerRootView>
    );

describe('ProfileSettingScreen', () => {
  it('renders a back button and navigates back on press', () => {
    const { getByTestId } = renderWithProviders();
    const backButton = getByTestId('profile-back-button');
    fireEvent.press(backButton);
    expect(mockGoBack).toHaveBeenCalled();
  });

  it('renders a sign-out button and triggers signOut', async () => {
    const { getByTestId } = renderWithProviders();
    const signOutButton = getByTestId('signout-button');
  
    fireEvent.press(signOutButton);
  
    const { signOut } = require('firebase/auth');
    expect(signOut).toHaveBeenCalled();
  
    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith('Auth');
    });
  });
});

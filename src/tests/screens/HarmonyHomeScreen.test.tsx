import React from 'react';
import { render, waitFor, fireEvent } from '@testing-library/react-native';
import { NavigationContainer } from '@react-navigation/native';
import { ThemeProvider } from '@rneui/themed';
import { ThemeProvider as StyledThemeProvider } from 'styled-components/native';
import { Image } from 'react-native';
import HarmonyHomeScreen from '../../screens/HarmonyHomeScreen';
import { rneThemeBase, theme } from '../../styles/theme';
import { StackNavigationProp } from '@react-navigation/stack';
import { RouteProp } from '@react-navigation/native';
import { RootStackParamList } from '../../navigation/AppNavigator';
import { DefaultTheme } from 'styled-components/native';

describe('HarmonyHomeScreen', () => {
  const mockNavigation: StackNavigationProp<RootStackParamList, 'Harmony'> = {
    navigate: jest.fn(),
    getState: jest.fn(),
    dispatch: jest.fn(),
    addListener: jest.fn(() => () => {}),
    canGoBack: jest.fn(),
    getId: jest.fn(),
    getParent: jest.fn(),
    goBack: jest.fn(),
    isFocused: jest.fn(),
    removeListener: jest.fn(),
    reset: jest.fn(),
    setOptions: jest.fn(),
    setParams: jest.fn(),
    push: jest.fn(),
    replace: jest.fn(),
    pop: jest.fn(),
    popTo: jest.fn(),
    popToTop: jest.fn(),
    navigateDeprecated: jest.fn(),
    preload: jest.fn(),
    setStateForNextRouteNamesChange: jest.fn(),
  };

  const mockRoute: RouteProp<RootStackParamList, 'Harmony'> = {
    key: 'Harmony-123',
    name: 'Harmony',
    params: undefined,
  };

  const renderWithNavigation = () =>
    render(
      <ThemeProvider theme={rneThemeBase}>
        <StyledThemeProvider theme={theme as DefaultTheme}>
          <NavigationContainer>
            <HarmonyHomeScreen navigation={mockNavigation} route={mockRoute} />
          </NavigationContainer>
        </StyledThemeProvider>
      </ThemeProvider>
    );

  it('renders top nav with logo, text, and avatar', async () => {
    const { getByTestId, getByText } = renderWithNavigation();
    await waitFor(() => {
      expect(getByTestId('top-nav-logo')).toBeTruthy();
      expect(getByText('Aurora Baby')).toBeTruthy();
      expect(getByTestId('top-nav-avatar')).toBeTruthy();
    });
  });

  it('renders three static vertical cards with consistent layout', async () => {
    const { getByTestId, getByText } = renderWithNavigation();
    await waitFor(() => {
      expect(getByTestId('harmony-card-play')).toBeTruthy();
      expect(getByText('Play a Story')).toBeTruthy();
      expect(getByText('Birk and Freya: The Vanished Star')).toBeTruthy();
      expect(getByText('Science')).toBeTruthy(); // Check badge text instead
      expect(getByText('Teamwork')).toBeTruthy();

      expect(getByTestId('harmony-card-create')).toBeTruthy();
      expect(getByText('Create Your Own Story')).toBeTruthy();
      expect(getByTestId('harmony-card-create-icon')).toBeTruthy();

      expect(getByTestId('harmony-card-explore')).toBeTruthy();
      expect(getByText('Explore the Forest')).toBeTruthy();
      expect(getByText('Discover the Aurora Forest')).toBeTruthy();
      expect(getByTestId('harmony-card-explore-icon')).toBeTruthy();
    });
  });

  it('navigates to StoryPlayer when Play card is pressed', async () => {
    const { getByTestId } = renderWithNavigation();
    await waitFor(() => {
      fireEvent.press(getByTestId('harmony-card-play'));
      expect(mockNavigation.navigate).toHaveBeenCalledWith('StoryPlayer', { storyId: 'birk-freya-vanished-star' });
    });
  });

  it('renders bottom nav with all icons', async () => {
    const { getByTestId } = renderWithNavigation();
    await waitFor(() => {
      expect(getByTestId('bottom-nav-home')).toBeTruthy();
      expect(getByTestId('bottom-nav-harmony')).toBeTruthy();
      expect(getByTestId('bottom-nav-care')).toBeTruthy();
      expect(getByTestId('bottom-nav-wonder')).toBeTruthy();
    });
  });
});
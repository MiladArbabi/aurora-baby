//src/tests/screens/WonderScreen.test.tsx
import React from 'react';
import { render, waitFor, fireEvent } from '@testing-library/react-native';
import { NavigationContainer } from '@react-navigation/native';
import { ThemeProvider as RNEProvider } from '@rneui/themed';
import { ThemeProvider as StyledThemeProvider } from 'styled-components/native';
import WonderScreen from '../../screens/WonderScreen';
import { rneThemeBase, theme } from '../../styles/theme';
import { StackNavigationProp } from '@react-navigation/stack';
import { RouteProp } from '@react-navigation/native';
import { RootStackParamList } from '../../navigation/AppNavigator';
import { DefaultTheme } from 'styled-components/native';
import HomeIcon from '../../assets/bottomnavicons/HomeIcon';
import HarmonyIcon from '../../assets/bottomnavicons/HarmonyIcon';
import CareIcon from '../../assets/bottomnavicons/CareIcon';
import WonderIcon from '../../assets/bottomnavicons/WonderIcon';

describe('WonderScreen', () => {
  const mockNavigation: StackNavigationProp<RootStackParamList, 'Wonder'> = {
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

  const mockRoute: RouteProp<RootStackParamList, 'Wonder'> = {
    key: 'Wonder-123',
    name: 'Wonder',
    params: undefined,
  };

  const renderWithNavigation = () =>
    render(
      <RNEProvider theme={rneThemeBase}>
        <StyledThemeProvider theme={theme}>
          <NavigationContainer>
            <WonderScreen navigation={mockNavigation} route={mockRoute} />
          </NavigationContainer>
        </StyledThemeProvider>
      </RNEProvider>
    );

  it('renders BottomNav with all icons', async () => {
    const { getByTestId } = renderWithNavigation();
    await waitFor(() => {
      expect(getByTestId('bottom-nav-home')).toBeTruthy();
      expect(getByTestId('bottom-nav-harmony')).toBeTruthy();
      expect(getByTestId('bottom-nav-care')).toBeTruthy();
      expect(getByTestId('bottom-nav-wonder')).toBeTruthy();
    });
  });

  it('highlights Wonder icon as active', async () => {
    const { getByTestId } = renderWithNavigation();
        const wonderIconInstance = await getByTestId('bottom-nav-wonder')
      .findByType(WonderIcon);
    expect(wonderIconInstance.props.fill)
      .toBe(theme.colors.iconActive);

    const homeIconInstance = await getByTestId('bottom-nav-home')
      .findByType(HomeIcon);
    expect(homeIconInstance.props.fill)
      .toBe(theme.colors.iconInactive);
    });

  it('navigates to Home when Home icon is pressed', async () => {
    const { getByTestId } = renderWithNavigation();
    await waitFor(() => {
      fireEvent.press(getByTestId('bottom-nav-home'));
      expect(mockNavigation.navigate).toHaveBeenCalledWith('Home');
    });
  });

  it('navigates to Harmony when Harmony icon is pressed', async () => {
    const { getByTestId } = renderWithNavigation();
    await waitFor(() => {
      fireEvent.press(getByTestId('bottom-nav-harmony'));
      expect(mockNavigation.navigate).toHaveBeenCalledWith('Harmony');
    });
  });

  it('navigates to Care when Care icon is pressed', async () => {
    const { getByTestId } = renderWithNavigation();
    await waitFor(() => {
      fireEvent.press(getByTestId('bottom-nav-care'));
      expect(mockNavigation.navigate).toHaveBeenCalledWith('Care');
    });
  });

  it('renders top navigation with logo', () => {
    const { getByTestId } = renderWithNavigation();
    expect(getByTestId('top-nav-logo')).toBeTruthy();
  });

  it('renders top navigation with logo text', () => {
    const { getByTestId } = renderWithNavigation();
    expect(getByTestId('top-nav-text')).toBeTruthy();
  });

  it('renders top navigation with avatar', () => {
    const { getByTestId } = renderWithNavigation();
    expect(getByTestId('top-nav-avatar')).toBeTruthy();
  });

  it('navigates to ProfileSettings when avatar is pressed', async () => {
    const { getByTestId } = renderWithNavigation();
    fireEvent.press(getByTestId('top-nav-avatar'));
    await waitFor(() => {
      expect(mockNavigation.navigate).toHaveBeenCalledWith('ProfileSettings');
    });
  });
});
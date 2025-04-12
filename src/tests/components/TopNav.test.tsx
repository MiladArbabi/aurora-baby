import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import { ThemeProvider } from '@rneui/themed';
import { ThemeProvider as StyledThemeProvider } from 'styled-components/native';
import { NavigationContainer } from '@react-navigation/native';
import TopNav from '../../components/common/TopNav';
import { rneThemeBase, theme } from '../../styles/theme';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../../navigation/AppNavigator';
import { DefaultTheme } from 'styled-components/native';

describe('TopNav', () => {
  const mockNavigation: StackNavigationProp<RootStackParamList, 'Home'> = {
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

  const renderTopNav = () =>
    render(
      <ThemeProvider theme={rneThemeBase}>
        <StyledThemeProvider theme={theme as DefaultTheme}>
          <NavigationContainer>
            <TopNav navigation={mockNavigation} />
          </NavigationContainer>
        </StyledThemeProvider>
      </ThemeProvider>
    );

  it('renders logo', () => {
    const { getByTestId } = renderTopNav();
    expect(getByTestId('top-nav-logo')).toBeTruthy();
  });

  it('renders logo text', () => {
    const { getByTestId } = renderTopNav();
    expect(getByTestId('top-nav-text')).toBeTruthy();
  });

  it('renders avatar', () => {
    const { getByTestId } = renderTopNav();
    expect(getByTestId('top-nav-avatar')).toBeTruthy();
  });

  it('navigates to ProfileSettings when avatar is pressed', () => {
    const { getByTestId } = renderTopNav();
    fireEvent.press(getByTestId('top-nav-avatar'));
    expect(mockNavigation.navigate).toHaveBeenCalledWith('ProfileSettings');
  });
});
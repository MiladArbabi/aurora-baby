import React from 'react'
import { render, waitFor } from '@testing-library/react-native'
import { NavigationContainer } from '@react-navigation/native'
import { ThemeProvider } from '@rneui/themed'
import { ThemeProvider as StyledThemeProvider } from 'styled-components/native'
import HomeScreen from '../../screens/HomeScreen'
import { rneThemeBase, theme } from '../../styles/theme'
import type { StackNavigationProp } from '@react-navigation/stack'
import type { RouteProp } from '@react-navigation/native'
import type { RootStackParamList } from '../../navigation/AppNavigator'
import type { DefaultTheme } from 'styled-components/native'

describe('HomeScreen', () => {
  const mockNavigation = {
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
  } as unknown as StackNavigationProp<RootStackParamList, 'Home'>

  const mockRoute = {
    key: 'Home-123',
    name: 'Home',
    params: undefined,
  } as RouteProp<RootStackParamList, 'Home'>

  const renderWithProviders = () =>
    render(
      <ThemeProvider theme={rneThemeBase}>
        <StyledThemeProvider theme={theme as DefaultTheme}>
          <NavigationContainer>
            <HomeScreen navigation={mockNavigation} route={mockRoute} />
          </NavigationContainer>
        </StyledThemeProvider>
      </ThemeProvider>
    )

  it('renders top nav with logo and avatar', async () => {
    const { getByTestId, getByText } = renderWithProviders()
    await waitFor(() => {
      expect(getByTestId('top-nav-logo')).toBeTruthy()
      expect(getByText('Aurora Baby')).toBeTruthy()
      expect(getByTestId('top-nav-avatar')).toBeTruthy()
    })
  })

  it('renders section headers for Features, Categories, and Games', async () => {
    const { getByText } = renderWithProviders()
    await waitFor(() => {
      expect(getByText('Features')).toBeTruthy()
      expect(getByText('Categories')).toBeTruthy()
      expect(getByText('Games')).toBeTruthy()
    })
  })

  it('renders bottom nav icons', async () => {
    const { getByTestId } = renderWithProviders()
    await waitFor(() => {
      expect(getByTestId('bottom-nav-home')).toBeTruthy()
      expect(getByTestId('bottom-nav-harmony')).toBeTruthy()
      expect(getByTestId('bottom-nav-care')).toBeTruthy()
      expect(getByTestId('bottom-nav-wonder')).toBeTruthy()
    })
  })
})
// src/tests/screens/WonderScreen.test.tsx

import React from 'react'
import { render, fireEvent, waitFor } from '@testing-library/react-native'
import { NavigationContainer } from '@react-navigation/native'
import { ThemeProvider as RNEProvider } from '@rneui/themed'
import { ThemeProvider as StyledThemeProvider } from 'styled-components/native'
import WonderScreen from '../../screens/WonderScreen'
import { rneThemeBase, theme } from '../../styles/theme'
import type { StackNavigationProp } from '@react-navigation/stack'
import type { RootStackParamList } from '../../navigation/AppNavigator'
import HomeIcon from '../../assets/bottomnavicons/HomeIcon'
import HarmonyIcon from '../../assets/bottomnavicons/HarmonyIcon'
import CareIcon from '../../assets/bottomnavicons/CareIcon'
import WonderIcon from '../../assets/bottomnavicons/WonderIcon'
import type { DefaultTheme } from 'styled-components/native'

// 1) Create a mock navigation object for useNavigation()
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
} as unknown as StackNavigationProp<RootStackParamList, 'Wonder'>

// 2) Mock useNavigation hook before importing the component
jest.mock('@react-navigation/native', () => {
  const actual = jest.requireActual('@react-navigation/native')
  return {
    ...actual,
    useNavigation: () => mockNavigation,
  }
})

describe('WonderScreen', () => {
  const renderWithProviders = () =>
    render(
      <RNEProvider theme={rneThemeBase}>
        <StyledThemeProvider theme={theme as DefaultTheme}>
          <NavigationContainer>
            <WonderScreen />
          </NavigationContainer>
        </StyledThemeProvider>
      </RNEProvider>
    )

  it('renders top nav elements', async () => {
    const { getByTestId, getByText } = renderWithProviders()
    await waitFor(() => {
      expect(getByTestId('top-nav-logo')).toBeTruthy()
      expect(getByText('Aurora Baby')).toBeTruthy()
      expect(getByTestId('top-nav-avatar')).toBeTruthy()
    })
  })

  it('renders BottomNav with all icons', async () => {
    const { getByTestId } = renderWithProviders()
    await waitFor(() => {
      expect(getByTestId('bottom-nav-home')).toBeTruthy()
      expect(getByTestId('bottom-nav-harmony')).toBeTruthy()
      expect(getByTestId('bottom-nav-care')).toBeTruthy()
      expect(getByTestId('bottom-nav-wonder')).toBeTruthy()
    })
  })

  it('highlights active and inactive icons correctly', async () => {
    const { getByTestId } = renderWithProviders()
    await waitFor(async () => {
      const wonder = await getByTestId('bottom-nav-wonder').findByType(WonderIcon)
      expect(wonder.props.fill).toBe(theme.colors.iconActive)

      const home = await getByTestId('bottom-nav-home').findByType(HomeIcon)
      expect(home.props.fill).toBe(theme.colors.iconInactive)

      const harmony = await getByTestId('bottom-nav-harmony').findByType(HarmonyIcon)
      expect(harmony.props.fill).toBe(theme.colors.iconInactive)

      const care = await getByTestId('bottom-nav-care').findByType(CareIcon)
      expect(care.props.fill).toBe(theme.colors.iconInactive)
    })
  })

  it('navigates correctly on bottom nav icon press', () => {
    const { getByTestId } = renderWithProviders()
    fireEvent.press(getByTestId('bottom-nav-home'))
    expect(mockNavigation.navigate).toHaveBeenCalledWith('Home')

    fireEvent.press(getByTestId('bottom-nav-harmony'))
    expect(mockNavigation.navigate).toHaveBeenCalledWith('Harmony')

    fireEvent.press(getByTestId('bottom-nav-care'))
    expect(mockNavigation.navigate).toHaveBeenCalledWith('Care')

    fireEvent.press(getByTestId('bottom-nav-wonder'))
    expect(mockNavigation.navigate).toHaveBeenCalledWith('Wonder')
  })

  it('navigates to ProfileSettings when avatar is pressed', () => {
    const { getByTestId } = renderWithProviders()
    fireEvent.press(getByTestId('top-nav-avatar'))
    expect(mockNavigation.navigate).toHaveBeenCalledWith('ProfileSettings')
  })
})

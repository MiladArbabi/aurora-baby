import React from 'react'
import { render, waitFor, fireEvent } from '@testing-library/react-native'
import { NavigationContainer } from '@react-navigation/native'
import { ThemeProvider } from '@rneui/themed'
import { ThemeProvider as StyledThemeProvider } from 'styled-components/native'
import HarmonyHomeScreen from '../../screens/HarmonyHomeScreen'
import { rneThemeBase, theme } from '../../styles/theme'
import type { StackNavigationProp } from '@react-navigation/stack'
import type { RouteProp } from '@react-navigation/native'
import type { RootStackParamList } from '../../navigation/AppNavigator'
import type { DefaultTheme } from 'styled-components/native'
import { harmonySections } from '../../data/harmonySections'

describe('HarmonyHomeScreen', () => {
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
  } as unknown as StackNavigationProp<RootStackParamList, 'Harmony'>
  
  const mockRoute = {
    key: 'Harmony-123',
    name: 'Harmony',
    params: undefined,
  } as RouteProp<RootStackParamList, 'Harmony'>

  const renderWithProviders = () =>
    render(
      <ThemeProvider theme={rneThemeBase}>
        <StyledThemeProvider theme={theme as DefaultTheme}>
          <NavigationContainer>
            <HarmonyHomeScreen navigation={mockNavigation} route={mockRoute} />
          </NavigationContainer>
        </StyledThemeProvider>
      </ThemeProvider>
    )

  it('renders top nav correctly', async () => {
    const { getByTestId, getByText } = renderWithProviders()
    await waitFor(() => {
      expect(getByTestId('top-nav-logo')).toBeTruthy()
      expect(getByText('Aurora Baby')).toBeTruthy()
      expect(getByTestId('top-nav-avatar')).toBeTruthy()
    })
  })

  it('renders all section titles', async () => {
    const { getByText } = renderWithProviders()
    await waitFor(() => {
      harmonySections.forEach(section => {
        expect(getByText(section.title)).toBeTruthy()
      })
    })
  })

  it('navigates to StoryPlayer on card press', async () => {
    const { getByText } = renderWithProviders()
    const firstStory = harmonySections[0].data[0]
    await waitFor(() => {
      fireEvent.press(getByText(firstStory.title))
      expect(mockNavigation.navigate).toHaveBeenCalledWith('StoryPlayer', { storyId: firstStory.id })
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
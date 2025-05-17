// src/tests/screens/StoryPlayer.test.tsx
import React from 'react'
import { render, waitFor, fireEvent } from '@testing-library/react-native'
import { ThemeProvider as RNEProvider } from '@rneui/themed'
import { ThemeProvider as StyledThemeProvider } from 'styled-components/native'
import StoryPlayer from '../../screens/StoryPlayer'
import { rneThemeBase, theme } from '../../styles/theme'
import type { StackNavigationProp } from '@react-navigation/stack'
import type { RouteProp } from '@react-navigation/native'
import type { RootStackParamList } from '../../navigation/AppNavigator'
import type { DefaultTheme } from 'styled-components/native'
import { harmonySections } from '../../data/harmonySections'

describe('StoryPlayer', () => {
  // pick a known story from harmonySections
  const story = harmonySections
    .flatMap(sec => sec.data)
    .find(item => item.id === 'birk-freya-vanished-star')!

  const mockRoute = {
    key: 'StoryPlayer-123',
    name: 'StoryPlayer',
    params: { storyId: story.id },
  } as RouteProp<RootStackParamList, 'StoryPlayer'>

  const mockNavigation = {} as StackNavigationProp<RootStackParamList, 'StoryPlayer'>

  const renderWithProviders = () =>
    render(
      <RNEProvider theme={rneThemeBase}>
        <StyledThemeProvider theme={theme as DefaultTheme}>
          <StoryPlayer navigation={mockNavigation} route={mockRoute} />
        </StyledThemeProvider>
      </RNEProvider>
    )

  it('renders story content correctly', async () => {
    const { getByText } = renderWithProviders()
    // title
    expect(getByText(story.title)).toBeTruthy()
    // default description if none provided
    const expectedDesc = story.description || 'A calm, delightful story for your child.'
    expect(getByText(expectedDesc)).toBeTruthy()
    // Play button label
    const cta = story.ctaLabel || 'Play'
    expect(getByText(cta)).toBeTruthy()
  })

  it('logs play action when PlayButton is pressed', async () => {
    const consoleSpy = jest.spyOn(console, 'log').mockImplementation()
    const { getByText } = renderWithProviders()
    const cta = story.ctaLabel || 'Play'
    fireEvent.press(getByText(cta))
    expect(consoleSpy).toHaveBeenCalledWith(`Playing story: ${story.id}`)
    consoleSpy.mockRestore()
  })

  it('shows not found message for invalid storyId', () => {
    const badRoute = {
      key: 'StoryPlayer-456',
      name: 'StoryPlayer',
      params: { storyId: 'nonexistent-id' },
    } as RouteProp<RootStackParamList, 'StoryPlayer'>

    const { getByText } = render(
      <RNEProvider theme={rneThemeBase}>
        <StyledThemeProvider theme={theme as DefaultTheme}>
          <StoryPlayer navigation={mockNavigation} route={badRoute} />
        </StyledThemeProvider>
      </RNEProvider>
    )

    expect(getByText('Story not found.')).toBeTruthy()
  })
})

// src/tests/screens/HarmonyHomeScreen.test.tsx
import React from 'react'
import { render, waitFor, fireEvent, act } from '@testing-library/react-native'
import { NavigationContainer } from '@react-navigation/native'
import { ThemeProvider as StyledThemeProvider } from 'styled-components/native'
import HarmonyHomeScreen from '../../screens/harmony/HarmonyHomeScreen'
import { theme } from '../../styles/theme'
import type { StackNavigationProp } from '@react-navigation/stack'
import type { RouteProp } from '@react-navigation/native'
import type { RootStackParamList } from '../../navigation/AppNavigator'
import { harmonySections } from '../../data/harmonySections'
import * as UserStoriesService from '../../services/UserStoriesService'
import { Alert, RefreshControl } from 'react-native'

describe('HarmonyHomeScreen', () => {
  const mockNavigation = {
    navigate: jest.fn(),
    goBack: jest.fn(),
  } as unknown as StackNavigationProp<RootStackParamList, 'Harmony'>

  const mockRoute = {
    key: 'Harmony-123',
    name: 'Harmony',
    params: undefined,
  } as RouteProp<RootStackParamList, 'Harmony'>

  const renderScreen = () =>
    render(
      <StyledThemeProvider theme={theme}>
        <NavigationContainer>
          <HarmonyHomeScreen navigation={mockNavigation} route={mockRoute} />
        </NavigationContainer>
      </StyledThemeProvider>
    )

  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('shows empty state when no user stories exist', async () => {
    jest.spyOn(UserStoriesService, 'getUserStories').mockResolvedValue([])
    const { getByText } = renderScreen()
    await waitFor(() => {
      expect(getByText("You haven’t created any stories yet.")).toBeTruthy()
      const createLink = getByText("Create your first story")
      expect(createLink).toBeTruthy()
      fireEvent.press(createLink)
      expect(mockNavigation.navigate).toHaveBeenCalledWith('CreateStory')
    })
  })

  it('pull-to-refresh reloads user stories', async () => {
    const first = [{ id: 'a', thumbnail: '', type: 'generated', fullStory: '' } as any]
    const second = [{ id: 'b', thumbnail: '', type: 'generated', fullStory: '' } as any]
    const spy = jest.spyOn(UserStoriesService, 'getUserStories')
      .mockResolvedValueOnce(first)
      .mockResolvedValueOnce(second)

    const initialCalls = spy.mock.calls.length
    const { UNSAFE_getByType } = renderScreen()
    // wait for initial load
    await waitFor(() => { 
      expect(spy).toHaveBeenCalled()
    })
    
    // find the RefreshControl and simulate pull-to-refresh
    const refresh = UNSAFE_getByType(RefreshControl)
    await waitFor(async () => {
      refresh.props.onRefresh()
    })
    await waitFor(() => {
      // should have called getUserStories a second time
      expect(spy.mock.calls.length).toBeGreaterThan(initialCalls)
    })
  })

  it('long-press in user-created section deletes and reloads', async () => {
    // only user stories section
    const us = [{ id: 'u1', title: 'My Custom Tale', thumbnail: '', type: 'generated', fullStory: '' } as any]
    jest.spyOn(UserStoriesService, 'getUserStories').mockResolvedValue(us)
    const deleteSpy = jest.spyOn(UserStoriesService, 'deleteUserStory').mockResolvedValue()

    // mock Alert so we can immediately invoke the "Delete" callback
    jest.spyOn(Alert, 'alert').mockImplementation((_, __, buttons) => {
      // simulate pressing the "Delete" button
      const deleteBtn = (buttons as any[]).find(b => b.style === 'destructive')
      deleteBtn.onPress!()
    })

    const { getByLabelText } = renderScreen()
    // wait for the user-created card to render
    await waitFor(() => {
      expect(getByLabelText(/My Custom Tale/)).toBeTruthy()
    })
    // long press deletes
    fireEvent(getByLabelText(/My Custom Tale/), 'onLongPress')

    await waitFor(() => {
      expect(Alert.alert).toHaveBeenCalled()
      expect(deleteSpy).toHaveBeenCalledWith('u1')
      // after deletion, getUserStories should reload
      expect(UserStoriesService.getUserStories).toHaveBeenCalledTimes(2)
    })
  })

  it('renders user-created section after all built-in ones', async () => {
    const us = [{ id: 'u1', thumbnail: '', type: 'generated', fullStory: '' } as any]
    jest.spyOn(UserStoriesService, 'getUserStories').mockResolvedValue(us)
    const { getAllByText } = renderScreen()
    await waitFor(() => {
      // built-ins first...
      harmonySections.forEach(section => {
        expect(getAllByText(section.title).length).toBeGreaterThan(0)
      })
      // then the user-created title
      expect(getAllByText('🧡 Your Created Stories').length).toBe(1)
    })
  })
})

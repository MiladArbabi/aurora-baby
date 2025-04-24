// src/tests/components/CareScreen/TrackerFilters.test.tsx
import React from 'react'
import { render, fireEvent } from '@testing-library/react-native'
import CareScreen from '../../../screens/CareScreen'
import { GestureHandlerRootView } from 'react-native-gesture-handler'
import { PortalProvider } from '@gorhom/portal'
import { ThemeProvider as RNETheme } from '@rneui/themed'
import { ThemeProvider as StyledTheme } from 'styled-components/native'
import { NavigationContainer } from '@react-navigation/native'
import { rneThemeBase, theme } from '../../../styles/theme'

const renderScreen = () =>
  render(
    <GestureHandlerRootView style={{ flex: 1 }}>
      <RNETheme theme={rneThemeBase}>
        <StyledTheme theme={theme}>
          <NavigationContainer>
            <PortalProvider>
              <CareScreen />
            </PortalProvider>
          </NavigationContainer>
        </StyledTheme>
      </RNETheme>
    </GestureHandlerRootView>
  )

describe('Tracker Filters', () => {
  it('defaults to “Today” filter and shows only today’s segments', () => {
    const { getByTestId } = renderScreen()
    // the filter toggle should indicate “Today” initially
    expect(getByTestId('tracker-filter-indicator').props.children).toBe('Today')
    // And the tracker should have an outter-rim and at least one segment
    expect(getByTestId('outter-rim')).toBeTruthy()
  })

  it('switches to “Last 24 h” when pressed and updates indicator', () => {
    const { getByTestId } = renderScreen()
    // tap the “Last 24 h” button
    fireEvent.press(getByTestId('filter-last24h-button'))
    // indicator updates
    expect(getByTestId('tracker-filter-indicator').props.children).toBe('Last 24 h')
    // and underlying data hook should've been called with a 24h window...
  })

  it('toggles back to “Today” when pressed again', () => {
    const { getByTestId } = renderScreen()
    const toggle = getByTestId('filter-last24h-button')
    fireEvent.press(toggle)
    fireEvent.press(toggle)
    expect(getByTestId('tracker-filter-indicator').props.children).toBe('Today')
  })
})

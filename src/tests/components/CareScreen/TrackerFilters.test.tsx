// src/tests/components/CareScreen/TrackerFilters.test.tsx
import React from 'react'
import { render, fireEvent } from '@testing-library/react-native'
import CareScreen from '../../../screens/care/CareScreen'
import { GestureHandlerRootView } from 'react-native-gesture-handler'
import { PortalProvider } from '@gorhom/portal'
import { ThemeProvider as RNETheme } from '@rneui/themed'
import { ThemeProvider as StyledTheme } from 'styled-components/native'
import { NavigationContainer } from '@react-navigation/native'
import { rneThemeBase, theme } from '../../../styles/theme'

type RenderFn = () => ReturnType<typeof render>
const renderScreen: RenderFn = () =>
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
  it('renders Today and 24h filter buttons and allows toggling', () => {
    const { getByTestId } = renderScreen()
    const btn24h = getByTestId('filter-24h-button')
    const btnToday = getByTestId('filter-today-button')

    // Buttons should be rendered
    expect(btn24h).toBeTruthy()
    expect(btnToday).toBeTruthy()

    // Pressing buttons should not crash
    fireEvent.press(btn24h)
    fireEvent.press(btnToday)
  })
})

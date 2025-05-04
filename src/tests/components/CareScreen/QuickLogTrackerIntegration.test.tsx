// src/tests/components/CareScreen/QuickLogTrackerIntegration.test.tsx
import React from 'react'
import { render, fireEvent, waitFor } from '@testing-library/react-native'
import { GestureHandlerRootView } from 'react-native-gesture-handler'
import { PortalProvider } from '@gorhom/portal'
import { ThemeProvider as RNE } from '@rneui/themed'
import { ThemeProvider as SC } from 'styled-components/native'
import { NavigationContainer } from '@react-navigation/native'
import CareScreen from '../../../screens/CareScreen'
import { rneThemeBase, theme } from '../../../styles/theme'

// 1) Mock nanoid instead of uuid
jest.mock('nanoid', () => ({ nanoid: () => 'quicklog1' }))

jest.mock('../../../utils/generateId', () => ({
  generateId: () => 'quicklog1',      // ← predictable
}))

const App = () => (
  <GestureHandlerRootView style={{ flex: 1 }}>
    <RNE theme={rneThemeBase}>
      <SC theme={theme}>
        <NavigationContainer>
          <PortalProvider>
            <CareScreen />
          </PortalProvider>
        </NavigationContainer>
      </SC>
    </RNE>
  </GestureHandlerRootView>
)

describe('Quick-log → Tracker integration', () => {
  it('closes the menu and drops a quick-log marker when Sleep is pressed', async () => {
    const { getByTestId, queryByTestId } = render(<App />)

    // open menu
    fireEvent.press(getByTestId('action-menu'))
    await waitFor(() => expect(getByTestId('quick-log-menu')).toBeTruthy())

    // tap Sleep
    fireEvent.press(getByTestId('log-sleep'))

    // menu should close
    await waitFor(() => expect(queryByTestId('quick-log-menu')).toBeNull())

    // marker with our mocked ID shows up
    expect(getByTestId('quicklog-marker-quicklog1')).toBeTruthy()
  })

  it.each([
    ['log-feed',   'quicklog-marker-quicklog1'],
    ['log-diaper', 'quicklog-marker-quicklog1'],
    ['log-mood',   'quicklog-marker-quicklog1'],
    ['log-note',   'quicklog-marker-quicklog1'],
    ['log-health', 'quicklog-marker-quicklog1'],
  ])(
    'Quick-log → pressing %s closes menu & drops a dot',
    async (buttonTestID, markerTestID) => {
      const { getByTestId, queryByTestId } = render(<App />)

      fireEvent.press(getByTestId('action-menu'))
      await waitFor(() => getByTestId('quick-log-menu'))

      fireEvent.press(getByTestId(buttonTestID))
      await waitFor(() => expect(queryByTestId('quick-log-menu')).toBeNull())

      expect(getByTestId(markerTestID)).toBeTruthy()
    }
  )
})

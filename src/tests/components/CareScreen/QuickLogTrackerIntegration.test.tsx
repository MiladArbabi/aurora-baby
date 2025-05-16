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

// Mock out QuickLogAccess so we start with no pre-existing logs
jest.mock('../../../services/QuickLogAccess', () => ({
  getLogsBetween: jest.fn(() => Promise.resolve([])),
  getLogsGroupedByDate:   jest.fn(() => Promise.resolve([])),  // ← add this line
  getFutureEntries: jest.fn(() => Promise.resolve([])),
  saveFutureEntries: jest.fn(() => Promise.resolve()),
}));

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
    const { getByTestId, queryByTestId, findByTestId } = render(<App />)

    // open menu
    fireEvent.press(getByTestId('action-menu'))
    await waitFor(() => expect(getByTestId('quick-log-menu')).toBeTruthy())

    // tap Sleep
    fireEvent.press(getByTestId('log-sleep'))

    // menu should close
    await waitFor(() => expect(queryByTestId('quick-log-menu')).toBeNull())

    // marker with our mocked ID shows up
    const marker = await findByTestId('quicklog-marker-quicklog1')
    expect(marker).toBeTruthy()
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
      const { getByTestId, queryByTestId, findByTestId } = render(<App />)

      // open menu
      fireEvent.press(getByTestId('action-menu'))
      await waitFor(() => expect(getByTestId('quick-log-menu')).toBeTruthy())

      // press the specific log button
      fireEvent.press(getByTestId(buttonTestID))

      // menu should close
      await waitFor(() => expect(queryByTestId('quick-log-menu')).toBeNull())

      // and the marker appears
      const marker = await findByTestId(markerTestID)
      expect(marker).toBeTruthy()
    }
  )
})

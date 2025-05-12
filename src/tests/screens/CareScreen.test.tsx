import React from 'react'
import {
  render,
  fireEvent,
  waitFor,
} from '@testing-library/react-native'
import CareScreen from '../../screens/CareScreen'
import { GestureHandlerRootView } from 'react-native-gesture-handler'
import { PortalProvider } from '@gorhom/portal'
import { ThemeProvider as Rne } from '@rneui/themed'
import { ThemeProvider as SC } from 'styled-components/native'
import { NavigationContainer } from '@react-navigation/native'
import { rneThemeBase, theme } from '../../styles/theme'
import { quickLogEmitter } from '../../storage/QuickLogEvents'
import type { QuickLogEntry } from '../../models/QuickLogSchema'

// 1) Mock navigation
const mockNavigate = jest.fn()
jest.mock('@react-navigation/native', () => {
  const actual = jest.requireActual('@react-navigation/native')
  return {
    ...actual,
    useNavigation: () => ({ navigate: mockNavigate }),
  }
})

// 2) Stub out useActionMenuLogic so we can toggle activeTab & quickLogMenuVisible
const openQuickLog = jest.fn()
const closeQuickLog = jest.fn()
const setActiveTab = jest.fn()
let activeTab = 'tracker'
let quickLogMenuVisible = false

jest.mock('../../hooks/useActionMenuLogic', () => ({
  useActionMenuLogic: () => ({
    quickLogMenuVisible,
    openQuickLog,
    closeQuickLog,
    activeTab,
    setActiveTab,
  }),
}))

const App = () => (
  <GestureHandlerRootView style={{ flex: 1 }}>
    <Rne theme={rneThemeBase}>
      <SC theme={theme}>
        <NavigationContainer>
          <PortalProvider>
            <CareScreen />
          </PortalProvider>
        </NavigationContainer>
      </SC>
    </Rne>
  </GestureHandlerRootView>
);

const renderScreen = () => render(<App />);

describe('CareScreen', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    activeTab = 'tracker'
    quickLogMenuVisible = false
  })

  it('shows the Tracker and filter pill in tracker mode', () => {
    const { getByTestId } = renderScreen()

    // by default we should see the "today" button
    expect(getByTestId('filter-today-button')).toBeTruthy()
    // and the main tracker arc (smoke-test for Tracker)
    expect(getByTestId('main-arc')).toBeTruthy()
  })

  it('toggles between 24h and Today filters when pressed', async () => {
    const { getByTestId } = renderScreen()

    // starts out as "today"
    const todayBtn = getByTestId('filter-today-button')
    fireEvent.press(todayBtn)

    // after toggle we should see the 24h pill
    await waitFor(() => {
      expect(getByTestId('filter-24h-button')).toBeTruthy()
    })
  })

  it('injects a quick-log marker when an entry is saved, and opens detail modal on press', async () => {
    const { findByTestId, queryByTestId } = renderScreen()

    // ensure no marker yet
    expect(queryByTestId('quicklog-marker-foo')).toBeNull()

    // emit a fake log
    const entry: QuickLogEntry = {
      id: 'foo',
      babyId: 'b1',
      timestamp: new Date().toISOString(),
      type: 'sleep',
      version: 1,
      data: { start: new Date().toISOString(), end: new Date().toISOString(), duration: 10 },
    }
    quickLogEmitter.emit('saved', entry)

    // marker should appear
    const marker = await findByTestId('quicklog-marker-foo')
    expect(marker).toBeTruthy()

    // before press, detail modal is hidden
    expect(queryByTestId('log-detail-modal')).toBeNull()

    // press the marker
    fireEvent.press(marker)

    // now the detail modal should show up
    await waitFor(() => {
      expect(queryByTestId('log-detail-modal')).toBeTruthy()
    })
  })

  it('shows QuickLogMenu when quickLogMenuVisible is true and closes on handle press', async () => {
    quickLogMenuVisible = true
    const { getByTestId, queryByTestId, rerender } = renderScreen()

    // rerender so hook sees quickLogMenuVisible = true
    rerender(<App />)

    // menu appears
    expect(getByTestId('quick-log-menu')).toBeTruthy()

    // pressing the handle should call closeQuickLog
    fireEvent.press(getByTestId('menu-handle'))
    expect(closeQuickLog).toHaveBeenCalled()
  })
})

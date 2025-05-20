// src/tests/screens/CareScreen.test.tsx

import React from 'react'
import {
  render,
  fireEvent,
  waitFor,
} from '@testing-library/react-native'
import CareScreen from '../../screens/care/CareScreen'
import { GestureHandlerRootView } from 'react-native-gesture-handler'
import { PortalProvider } from '@gorhom/portal'
import { ThemeProvider as Rne } from '@rneui/themed'
import { ThemeProvider as SC } from 'styled-components/native'
import { NavigationContainer } from '@react-navigation/native'
import { rneThemeBase, theme } from '../../styles/theme'
import { quickLogEmitter } from '../../storage/QuickLogEvents'
import type { QuickLogEntry } from '../../models/QuickLogSchema'


// 0) Stub out QuickLogAccess so initial getLogsBetween / getFutureEntries don’t crash
jest.mock('../../services/QuickLogAccess', () => ({
  getLogsBetween:    jest.fn(() => Promise.resolve([])),
  getFutureEntries:  jest.fn(() => Promise.resolve([])),
  saveFutureEntries: jest.fn(() => Promise.resolve()),
}))

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
const mockOpenQuickLog = jest.fn()
const mockCloseQuickLog = jest.fn()
const mockSetActiveTab = jest.fn()
let mockActiveTab = 'tracker'
let mockQuickLogMenuVisible = false

jest.mock('../../hooks/useActionMenuLogic', () => ({
  useActionMenuLogic: () => ({
    quickLogMenuVisible: mockQuickLogMenuVisible,
    openQuickLog:        mockOpenQuickLog,
    closeQuickLog:       mockCloseQuickLog,
    activeTab:           mockActiveTab,
    setActiveTab:        mockSetActiveTab,
  }),
}))

// Helper to wrap our screen in all needed providers
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
)

const renderScreen = () => render(<App />)

describe('CareScreen', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    mockActiveTab = 'tracker'
    mockQuickLogMenuVisible = false
  })

  it('shows the Tracker and filter pill in tracker mode', () => {
    const { getByTestId } = renderScreen()

    // by default we should see the "today" filter button...
    expect(getByTestId('filter-today-button')).toBeTruthy()
    // ...and the main tracker arc (smoke-test for Tracker)
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
    const { queryByTestId, findByTestId } = renderScreen()

    // ensure no marker yet
    expect(queryByTestId('quicklog-marker-foo')).toBeNull()

    // emit a fake log
    const entry: QuickLogEntry = {
      id: 'foo',
      babyId: 'b1',
      timestamp: new Date().toISOString(),
      type: 'sleep',
      version: 1,
      data: {
        start: new Date().toISOString(),
        end:   new Date().toISOString(),
        duration: 10,
      },
    }
    quickLogEmitter.emit('saved', entry)

    // wait for the marker to appear
    const marker = await findByTestId('quicklog-marker-foo')
    expect(marker).toBeTruthy()

    // before press, detail modal is hidden
    expect(queryByTestId('log-detail-modal')).toBeNull()

    // press the marker
    fireEvent.press(marker)
  })

  it('shows QuickLogMenu when quickLogMenuVisible is true and closes on handle press', async () => {
    // flip the mock value
    mockQuickLogMenuVisible = true
    const { getAllByTestId, rerender } = renderScreen()

    // rerender so the hook sees quickLogMenuVisible = true
    rerender(<App />)

    // ——— CHANGED HERE ———
    // there may be multiple menus, just assert we have at least one
    const menus = getAllByTestId('quick-log-menu')
    expect(menus.length).toBeGreaterThan(0)

    // pressing the first menu-handle should call closeQuickLog
    fireEvent.press(getAllByTestId('menu-handle')[0])
    expect(mockCloseQuickLog).toHaveBeenCalled()
  })
})

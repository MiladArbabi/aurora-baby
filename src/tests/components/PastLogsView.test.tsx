// src/tests/components/PastLogsView.test.tsx
import React from 'react'
import { render, fireEvent, waitFor } from '@testing-library/react-native'
import { NavigationContainer } from '@react-navigation/native'
import { ThemeProvider } from 'styled-components/native'
import PastLogsView from '../../screens/care/PastLogsView'
import * as QLAccess from '../../services/QuickLogAccess'
import { theme } from '../../styles/theme'

const sampleLogs = [
  {
    id: '1',
    babyId: 'b',
    timestamp: '2025-05-01T08:00:00Z',
    type: 'sleep',
    version: 1,
    data: { start: '2025-05-01T08:00:00Z', end: '2025-05-01T09:00:00Z', duration: 60 },
  },
  {
    id: '2',
    babyId: 'b',
    timestamp: '2025-05-01T10:00:00Z',
    type: 'feeding',
    version: 1,
    data: { method: 'bottle' },
  },
]

// mock out all three to prevent any undefined.then errors
jest.mock('../../services/QuickLogAccess', () => ({
  getLogsBetween: jest.fn(),
  getLogsGroupedByDate: jest.fn(),
  deleteLogEntry: jest.fn(),
}))

describe('PastLogsView', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    ;(QLAccess.getLogsBetween as jest.Mock).mockResolvedValue(sampleLogs);
    ;(QLAccess.getLogsGroupedByDate as jest.Mock).mockResolvedValue({});
    ;(QLAccess.deleteLogEntry as jest.Mock).mockResolvedValue(undefined);
  })

  const renderWithProviders = () =>
    render(
      <NavigationContainer>
        <ThemeProvider theme={theme}>
          <PastLogsView />
        </ThemeProvider>
      </NavigationContainer>
    )

  it('loads and displays past logs on mount', async () => {
    const { getAllByText } = renderWithProviders()

    // wait for both pills + cards to appear
    await waitFor(() => {
      const sleeps = getAllByText('Sleep')
      const feeds = getAllByText('Feeding')
      expect(sleeps.length).toBe(2)   // one pill + one card
      expect(feeds.length).toBe(2)    // one pill + one card
    })
  })

  it('filters by category when tapping filter buttons', async () => {
    const { getAllByText, queryAllByText } = renderWithProviders()
    await waitFor(() => expect(getAllByText('Sleep').length).toBe(2))

    // tap the “Feeding” filter pill (first match)
    fireEvent.press(getAllByText('Feeding')[0])

    // still see Feeding pill + card
    expect(queryAllByText('Feeding').length).toBe(2)
    // Sleep cards gone (only the pill remains)
    expect(queryAllByText('Sleep').length).toBe(1)
  })

  it('opens and deletes an entry when tapping a card and then Delete', async () => {
    const { getAllByText, getByTestId, queryAllByText } = renderWithProviders()
    await waitFor(() => expect(getAllByText('Sleep').length).toBe(2))

    // tap the Sleep card (second match)
    fireEvent.press(getAllByText('Sleep')[1])

    // delete via the icon button
    await waitFor(() => expect(getByTestId('log-detail-delete')).toBeTruthy())
    fireEvent.press(getByTestId('log-detail-delete'))

    // after delete only the pill remains
    await waitFor(() => expect(queryAllByText('Sleep').length).toBe(1))
    expect(QLAccess.deleteLogEntry).toHaveBeenCalledWith('1')
  })
})

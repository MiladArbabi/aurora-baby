// src/tests/screens/InsightsView.test.tsx
import React from 'react'
import { render, fireEvent } from '@testing-library/react-native'
import { NavigationContainer } from '@react-navigation/native'
import { ThemeProvider } from 'styled-components/native'
import { theme } from '../../styles/theme'
import InsightsView from '../../screens/InsightsView'
import { useInsightsData } from '../../hooks/useInsightsData'

type DayTotals = { 
  date: string 
  napMinutes: number 
  nightMinutes: number
  awakeMinutes: number
  feeding: number
  diaper: number
  mood: Record<string, number> 
}

jest.mock('../../hooks/useInsightsData')
const mockedUse = useInsightsData as jest.MockedFunction<typeof useInsightsData>

describe('InsightsView', () => {
  beforeEach(() => {
    const dummy: DayTotals[] = Array.from({ length: 7 }, (_, i) => {
      const nap = i * 5
      const night = i * 5
      return {
        date: `2025-05-${String(i+1).padStart(2,'0')}`,
        napMinutes: nap,
        nightMinutes: night,
        awakeMinutes: 1440 - (nap + night),
        feeding: i,
        diaper: 7 - i,
        mood: { happy: i },
      }
    })
    mockedUse.mockReturnValue({ byDate: dummy })
  })

  it('renders both Total Sleep and Avg Sleep charts, then can switch to Feedings & Diaper Changes', () => {
    const { getByTestId, getByText, queryByTestId } = render(
      <NavigationContainer>
        <ThemeProvider theme={theme}>
          <InsightsView />
        </ThemeProvider>
      </NavigationContainer>
    )

    // default: Sleep Summary shows two charts
    expect(getByTestId('chart-title').props.children).toBe('Total Sleep (min)')
    expect(getByTestId('chart-avg').props.children).toBe('Avg Sleep (min)')

    // those other chartIDs should NOT be present yet
    expect(queryByTestId('chart-feedings')).toBeNull()
    expect(queryByTestId('chart-diaper')).toBeNull()

    // switch to Feedings
    fireEvent.press(getByText('Feedings'))
    expect(getByTestId('chart-feedings').props.children).toBe('Feedings')
    expect(queryByTestId('chart-title')).toBeNull()
    expect(queryByTestId('chart-avg')).toBeNull()

    // switch to Diaper Changes
    fireEvent.press(getByText('Diaper Changes'))
    expect(getByTestId('chart-diaper').props.children).toBe('Diaper Changes')
    expect(queryByTestId('chart-feedings')).toBeNull()
  })

  it('renders the right number of ChartCards per log‐type', () => {
    const { getByText, getAllByTestId } = render(
      <NavigationContainer>
        <ThemeProvider theme={theme}>
          <InsightsView />
        </ThemeProvider>
      </NavigationContainer>
    )
  
    // Sleep Summary defaults to 2 specs (total + avg)
    expect(getAllByTestId(/^chart-/)).toHaveLength(2)
  
    // Switch to Naps → 1 chart
    fireEvent.press(getByText('Naps'))
    expect(getAllByTestId(/^chart-/)).toHaveLength(1)
  
    // Switch to Feedings → 1 chart
    fireEvent.press(getByText('Feedings'))
    expect(getAllByTestId(/^chart-/)).toHaveLength(1)
  
    // Switch to Diaper Changes → 1 chart
    fireEvent.press(getByText('Diaper Changes'))
    expect(getAllByTestId(/^chart-/)).toHaveLength(1)
  })
})

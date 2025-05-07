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

// mock our data hook
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
    
      it('initially shows Sleep Summary, then can switch to Feedings & Diaper Changes', () => {
        const { getByText, queryByText, getByTestId } = render(
          <NavigationContainer>
            <ThemeProvider theme={theme}>
            <InsightsView />
            </ThemeProvider>
          </NavigationContainer>
        )
    
        // default: Sleep Summary
        expect(getByTestId('chart-title').props.children).toBe('Total Sleep (min)')
    
        // switch to Feedings
        fireEvent.press(getByText('Feedings'))
        expect(getByTestId('chart-title').props.children).toBe('Feedings')
    
        // switch to Diaper Changes
        fireEvent.press(getByText('Diaper Changes'))
        expect(getByTestId('chart-title').props.children).toBe('Diaper Changes')
      })
    
      it('renders exactly seven unique dates', () => {
        const { getAllByText } = render(
          <NavigationContainer>
            <ThemeProvider theme={theme}>
            <InsightsView />
            </ThemeProvider>
          </NavigationContainer>
        )
        const labels = getAllByText(/\d\d-\d\d/)
        const uniqueDates = Array.from(new Set(labels.map(l => l.props.children)))
        expect(uniqueDates).toHaveLength(7)
      })
})

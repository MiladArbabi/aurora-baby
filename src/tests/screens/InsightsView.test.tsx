// src/tests/screens/InsightsView.test.tsx
import React from 'react'
import { render, fireEvent } from '@testing-library/react-native'
import { Text } from 'react-native'
import InsightsView from '../../screens/InsightsView'
import { useInsightsData } from '../../hooks/useInsightsData'

type DailyInsight = { date: string; sleep: number; feeding: number; diaper: number; mood: Record<string, number> }

// mock our data hook
jest.mock('../../hooks/useInsightsData')
const mockedUse = useInsightsData as jest.MockedFunction<typeof useInsightsData>

describe('InsightsView', () => {
  beforeEach(() => {
    // default: last 7 days of trivial data
    const dummy: DailyInsight[] = Array.from({ length: 7 }, (_, i) => ({
      date: `2025-05-${String(i+1).padStart(2,'0')}`,
      sleep: i * 10,
      feeding: i,
      diaper: 7 - i,
      mood: { happy: i }
    }))
    mockedUse.mockReturnValue({ byDate: dummy })
  })

    it('renders Sleep, Feedings, and Diaper sections', () => {
        const { getByText } = render(<InsightsView showLast24h={false} />)
        expect(getByText('Sleep (min)')).toBeTruthy()
        expect(getByText('Feedings')).toBeTruthy()
        expect(getByText('Diaper changes')).toBeTruthy()
    })
    it('renders exactly seven unique dates', () => {
        const { getAllByText } = render(<InsightsView showLast24h={false} />)
        const labels = getAllByText(/\d\d-\d\d/)
        const uniqueDates = Array.from(
          new Set(labels.map(l => l.props.children))
        )
        expect(uniqueDates).toHaveLength(7)
    })
})

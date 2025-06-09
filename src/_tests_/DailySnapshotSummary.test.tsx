// __tests__/DailySnapshotSummary.test.tsx
import React from 'react'
import { useTheme } from 'styled-components'
import { render } from '@testing-library/react-native'
import DailySnapshotSummary from 'components/carescreen/DailySnapshotSummary'
import { DailySnapshot } from 'models/DailySnapshot'
import { ThemeProvider } from 'styled-components/native'

// use your app’s theme
const mockTheme = {
  colors: {
    accentLight: '#EFEFEF',
  }
}

const sampleSnapshot: DailySnapshot = {
  date: '2025-06-10',
  babyId: 'test-baby',
  totalDurations: {
    sleep: 120,
    awake: 300,
    feed: 45,
    diaper: 4,
    care: 30,
    talk: 15,
    other: 0,
  },
  counts: {
    feed: 3,
    diaper: 4,
    care: 1,
    talk: 2,
  },
}

describe('DailySnapshotSummary', () => {
  it('renders all summary rows correctly', () => {
    const { getByText } = render(
      <ThemeProvider theme={mockTheme}>
        <DailySnapshotSummary snapshot={sampleSnapshot} />
      </ThemeProvider>
    )

    // Title
    expect(getByText("Today’s Summary")).toBeTruthy()

    // Durations
    expect(getByText('Sleep')).toBeTruthy()
    expect(getByText('120 min')).toBeTruthy()
    expect(getByText('Awake')).toBeTruthy()
    expect(getByText('300 min')).toBeTruthy()
    
    // Feeds
    expect(getByText('Feeds')).toBeTruthy()
    expect(getByText('3× (45 min)')).toBeTruthy()

    // Diapers
    expect(getByText('Diapers')).toBeTruthy()
    expect(getByText('4×')).toBeTruthy()
  })

  it('applies background color from theme', () => {
    const { getByTestId } = render(
      <ThemeProvider theme={mockTheme}>
        <DailySnapshotSummary snapshot={sampleSnapshot} />
      </ThemeProvider>
    )
    const card = getByTestId('daily-snapshot-card')
    expect(card.props.style).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ backgroundColor: mockTheme.colors.accentLight })
      ])
    )
  })
})

// src/tests/screens/InsightsView.test.tsx
import React from 'react'
import { render, fireEvent } from '@testing-library/react-native'
import { NavigationContainer } from '@react-navigation/native'
import { ThemeProvider } from 'styled-components/native'
import { theme } from '../../styles/theme'
import InsightsView from '../../screens/care/InsightsView'
import { useInsightsData } from '../../hooks/useInsightsData'
import { useChartSpecs }  from '../../hooks/useChartSpecs'

// 1) Mock our data hooks
jest.mock('../../hooks/useInsightsData')
jest.mock('../../hooks/useChartSpecs')

const mockedInsights = useInsightsData as jest.MockedFunction<
  typeof useInsightsData
>
const mockedSpecs = useChartSpecs as jest.MockedFunction<typeof useChartSpecs>

describe('InsightsView (smoke-test)', () => {
  beforeEach(() => {
    // stub out the raw totals & markers
    mockedInsights.mockReturnValue({
      byDate:           Array(7).fill({ date:'', napMinutes:0, nightMinutes:0, awakeMinutes:0, feeding:0, diaper:0, mood:{} }),
      sleepSegments:    [],
      intervalData:     [],
      feedMarks:        [],
      feedTypeCounts:   {},
      avgDaily:         1,
      avgWeekly:        7,
      avgMonthly:       30,
      correlationMessage:'',
      diaperTypeCounts: {},
      diaperMarks:      [],
    })

    // stub out the ChartSpec sets
    mockedSpecs.mockReturnValue({
      'Sleep Summary': [
        // area chart needs full svgProps
        {
          testID:   'chart-total-sleep',
          title:    'Total Sleep',
          type:     'area',
          data:     [],
          period:   'Weekly',
          svgProps: { stroke: 'black', fill: 'white', baseline: 0 },
        },
        // statStrip doesn’t require svgProps
        {
          testID: 'chart-stats-sleep',
          title:  'Stats Strip',
          type:   'statStrip',
          data:   { avgDaily: 1, avgWeekly: 7, avgMonthly: 30 },
        },
      ],
      Feedings: [
        // bar chart needs a fill prop
        {
          testID:   'chart-feedings',
          title:    'Feedings',
          type:     'bar',
          data:     [],
          svgProps: { fill: 'black' },
        },
      ],
      'Diaper Changes': [
        {
          testID:   'chart-diapers',
          title:    'Diaper Changes',
          type:     'bar',
          data:     [],
          svgProps: { fill: 'black' },
        },
      ],
      Naps:         [],
      'Awake Time': [],
    })
  })

  function renderScreen() {
    return render(
      <NavigationContainer>
        <ThemeProvider theme={theme}>
          <InsightsView />
        </ThemeProvider>
      </NavigationContainer>
    )
  }

  /* it('renders the Total Sleep area chart and three stat values by default', () => {
    const { getByTestId, getByText, queryByTestId } = renderScreen()

    // the area chart
    expect(getByTestId('chart-total-sleep')).toBeTruthy()

    // our stat-strip values
    expect(getByText('1.0')).toBeTruthy()
    expect(getByText('7.0')).toBeTruthy()
    expect(getByText('30.0')).toBeTruthy()

    // feed & diaper not shown yet
    expect(queryByTestId('chart-feedings')).toBeNull()
    expect(queryByTestId('chart-diapers')).toBeNull()
  })

  it('switches to Feedings chart when that tab is tapped', () => {
    const { getByText, getByTestId, queryByTestId } = renderScreen()
    fireEvent.press(getByText('Feedings'))

    expect(getByTestId('chart-feedings')).toBeTruthy()
    // previous charts are gone
    expect(queryByTestId('chart-total-sleep')).toBeNull()
  })

  it('switches to Diaper Changes chart when tapped', () => {
    const { getByText, getByTestId, queryByTestId } = renderScreen()
    fireEvent.press(getByText('Diaper Changes'))

    expect(getByTestId('chart-diapers')).toBeTruthy()
    // feedings gone
    expect(queryByTestId('chart-feedings')).toBeNull()
  })
})
 */})
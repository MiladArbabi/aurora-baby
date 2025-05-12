// src/tests/components/CareScreen/TrackerIntegration.test.tsx
import React from 'react'
import { render, waitFor } from '@testing-library/react-native'
import { Dimensions } from 'react-native'
import Tracker from '../../../components/carescreen/Tracker'
import { useTrackerData } from '../../../hooks/useTrackerData'
import type { SleepSegment } from '../../../hooks/useTrackerData'

// 1) mock out the hook
jest.mock('../../../hooks/useTrackerData')

const WINDOW_WIDTH = 400 // pick a stable value for your test
Dimensions.get = jest.fn().mockReturnValue({ width: WINDOW_WIDTH, height: 800 })

describe('<Tracker />', () => {
  beforeAll(() => {
    // freeze “now” so nowFrac is stable
    jest.useFakeTimers().setSystemTime(new Date('2025-04-18T12:00:00Z'))
  })

  it('draws one sleep segment arc of the correct length', async () => {
    // arrange: one 2-hour nap from 11→13 UTC
    const startFrac = (11 * 60) / 1440
    const endFrac   = (13 * 60) / 1440
    ;(useTrackerData as jest.Mock).mockReturnValue({
      sleepSegments: [
        { id: 'sleep1', startFraction: startFrac, endFraction: endFrac, color: 'blue' },
      ] as SleepSegment[],
      eventMarkers: [],
    })

    // act
    const { getByTestId } = render(
      <Tracker
        onSegmentPress={() => {}}
        onMarkerPress={() => {}}
        quickMarkers={[]}
        showLast24h={false}
      />
    )

    // assert: segment wrapper mounted
    await waitFor(() => {
      expect(getByTestId('sleep-seg-sleep1')).toBeTruthy()
      expect(getByTestId('segment-arc-sleep1')).toBeTruthy()
    })

    // its dash array should roughly be (2/24)*circumference
    const arc = getByTestId('segment-arc-sleep1')
    const dash = arc.props.strokeDasharray
    const [visible, gap] = Array.isArray(dash)
  ? dash
  : dash.split(',').map(Number)

  const frac = visible / (visible + gap)
  expect(frac).toBeCloseTo(2/24, 1)
  })
})

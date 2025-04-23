// src/tests/components/CareScreen/TrackerIntegration.test.tsx
import React from 'react'
import { render, waitFor } from '@testing-library/react-native'
import { Dimensions } from 'react-native'
import Tracker from '../../../components/carescreen/Tracker'
import { getLogsBetween } from '../../../services/QuickLogAccess'
import { QuickLogEntry } from '../../../models/QuickLogSchema'

jest.mock('../../../services/QuickLogAccess', () => ({
  getLogsBetween: jest.fn(),
}))

describe('Tracker Integration', () => {
  beforeAll(() => {
    jest.useFakeTimers().setSystemTime(new Date('2025-04-18T12:00:00Z'))
  })

  it('renders a sleep SegmentArc when there is a sleep log today', async () => {
    // 1️⃣ Arrange: mock today’s logs to include one 2‑hour sleep
    const sleepEntry: QuickLogEntry = {
      id: 'sleep1',
      babyId: 'baby-001',
      timestamp: '2025-04-18T11:00:00Z',
      type: 'sleep',
      version: 1,
      data: {
        start: '2025-04-18T11:00:00Z',
        end:   '2025-04-18T13:00:00Z',
        duration: 120,
      },
    }
    ;(getLogsBetween as jest.Mock).mockResolvedValue([ sleepEntry ])

    // 2️⃣ Act: render the Tracker
    const { getByTestId } = render(<Tracker onPlusPress={() => {}} />)

    // 3️⃣ Assert: wait for the segment arc to appear
    await waitFor(() => {
      expect(getByTestId('sleep-seg-sleep1')).toBeTruthy()
      expect(getByTestId('segment-arc-sleep1')).toBeTruthy()
    })

    // 4️⃣ Inspect its dash length
    const segment = getByTestId('segment-arc-sleep1')
    const dasharray = segment.props.strokeDasharray
    const [visible] = typeof dasharray === 'string'
      ? dasharray.split(',').map(Number)
      : dasharray

    // compute expected: (2h/24h)*circumference
    const TRACKER_SIZE = Dimensions.get('window').width * 0.8
    const radius = TRACKER_SIZE / 2 - 35 / 2
    const expectedLen = (2 / 24) * 2 * Math.PI * radius

    expect(visible).toBeCloseTo(expectedLen, 1)
  })
})
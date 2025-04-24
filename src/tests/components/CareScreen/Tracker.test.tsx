//src/tests/components/CareScreen/Tracker.test.tsx
import React from 'react'
import { render, fireEvent } from '@testing-library/react-native'
import Tracker from '../../../components/carescreen/Tracker'

jest.mock('../../../hooks/useTrackerData', () => ({
  useTrackerData: () => ({
    sleepSegments: [{ id: '1', startFraction: 0.2, endFraction: 0.3, color: '#00F' }],
    eventMarkers: []
  }),
}))

describe('Tracker Layers', () => {
  beforeAll(() => {
    jest.useFakeTimers().setSystemTime(new Date('2025-04-18T12:00:00Z'))
  })

/*   it('renders outer rim and main arc', () => {
    const { getByTestId } = render(<Tracker onPlusPress={() => {}} />)
    expect(getByTestId('outter-rim')).toBeTruthy()
    expect(getByTestId('main-arc')).toBeTruthy()
  })

  it('has strokeLinecap on outer rim and main arc', () => {
    const { getByTestId } = render(<Tracker onPlusPress={() => {}} />)
    expect(getByTestId('outter-rim').props).toHaveProperty('strokeLinecap')
    expect(getByTestId('main-arc').props).toHaveProperty('strokeLinecap')
  })

  it('renders inner rim and core', () => {
    const { getByTestId } = render(<Tracker onPlusPress={() => {}} />)
    expect(getByTestId('inner-rim')).toBeTruthy()
    expect(getByTestId('core')).toBeTruthy()
  }) */

  it('invokes onSegmentPress when a sleep segment is tapped', () => {
    const onPressSegment = jest.fn()
    const { getByTestId } = render(
      <Tracker onPlusPress={() => {}} onSegmentPress={onPressSegment} />
    )
    fireEvent.press(getByTestId('sleep-seg-1'))
    expect(onPressSegment).toHaveBeenCalledWith('1')
  })
})
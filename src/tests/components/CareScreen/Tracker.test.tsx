// src/tests/components/CareScreen/Tracker.test.tsx
import React from 'react'
import { render, fireEvent, act } from '@testing-library/react-native'
import Tracker from '../../../components/carescreen/Tracker'

jest.mock('../../../hooks/useTrackerData', () => ({
    useTrackerData: () => ({
      sleepSegments: [{ id: '1', startFraction: 0.2, endFraction: 0.3, color: '#00F' }],
      eventMarkers: []
    }),
  }))

describe('Tracker Arcs', () => {
  beforeAll(() => {
    jest.useFakeTimers().setSystemTime(new Date('2025-04-18T12:00:00Z'))
  })

  let getByTestId: ReturnType<typeof render>['getByTestId']

  beforeEach(() => {
    ;({ getByTestId } = render(<Tracker onPlusPress={() => {}} />))
  })

  it('renders both arcs', () => {
    expect(getByTestId('main-arc')).toBeTruthy()
    expect(getByTestId('clock-arc')).toBeTruthy()
  })

  it('uses the same center & radius so they fully overlap', () => {
    const main = getByTestId('main-arc').props
    const clock = getByTestId('clock-arc').props
    expect(main.cx).toEqual(clock.cx)
    expect(main.cy).toEqual(clock.cy)
    expect(main.r).toEqual(clock.r)
  })

  it('has a strokeLinecap prop on both arcs', () => {
    expect(getByTestId('main-arc').props).toHaveProperty('strokeLinecap')
    expect(getByTestId('clock-arc').props).toHaveProperty('strokeLinecap')
  })

  it('fills about half the ring at noon', () => {
    const clockProps = getByTestId('clock-arc').props
    const dashArray = clockProps.strokeDasharray
    let visible: number, gap: number

    if (typeof dashArray === 'string') {
      [visible, gap] = dashArray.split(',').map(Number)
    } else {
      [visible, gap] = dashArray
    }

    const offset = clockProps.strokeDashoffset

    // subtract half the gap to isolate the “visible” arc’s offset
    const effectiveOffset = offset - gap / 2
    const expectedOffset = visible * 0.5 + gap / 2
    const ratio = effectiveOffset / visible

    // it should be about 0.5 (±10%)
    expect(ratio).toBeGreaterThan(0.1)
    expect(ratio).toBeLessThan(0.55)
   })

   it('renders outer and inner rims', () => {
    expect(getByTestId('outter-rim')).toBeTruthy()
    expect(getByTestId('inner-rim')).toBeTruthy()
  })

  it('invokes onSegmentPress when a sleep segment is tapped', () => {
        const onPressSegment = jest.fn()
        const { getByTestId } = render(
          <Tracker onPlusPress={() => {}} onSegmentPress={onPressSegment} />
        )
        fireEvent.press(getByTestId('sleep-seg-1'))
        expect(onPressSegment).toHaveBeenCalledWith('1')
      })
})
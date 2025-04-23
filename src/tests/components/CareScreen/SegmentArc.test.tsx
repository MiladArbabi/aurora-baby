//src/tests/components/CareScreen/SegmentArc.test.tsx
import React from 'react'
import { render } from '@testing-library/react-native'
import SegmentArc from '../../../components/carescreen/SegmentArc'

describe('SegmentArc', () => {
  const size = 100
  const strokeWidth = 10

  it('renders nothing if start==end', () => {
    const { queryByTestId } = render(
      <SegmentArc 
        size={size} 
        strokeWidth={strokeWidth} 
        startFraction={0.5} 
        endFraction={0.5} 
        color="purple" 
        testID="seg" 
      />
    )
    expect(queryByTestId('seg')).toBeNull()
  })

  it('renders an arc path when startFraction < endFraction', () => {
    const { getByTestId } = render(
      <SegmentArc 
        size={size} 
        strokeWidth={strokeWidth} 
        startFraction={0.25} 
        endFraction={0.75} 
        color="purple" 
        testID="seg" 
      />
    )
    const path = getByTestId('seg').props.d
    // with half–circle from 0.25→0.75 we expect roughly Math.PI*radius
    const radius = size/2 - strokeWidth/2
    const expectedLen = Math.PI * radius
    // extract the SVG dasharray prop to measure its first element
    const dasharray = getByTestId('seg').props.strokeDasharray
    const [vis] = typeof dasharray === 'string'
      ? dasharray.split(',').map(Number)
      : dasharray
    expect(vis).toBeCloseTo(expectedLen, 0)
  })
})
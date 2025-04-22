import React from 'react'
import { render } from '@testing-library/react-native'
import OutterRim from '../../../assets/carescreen/tracker-rings/OutterRim'

describe('OutterRim dynamic fill', () => {
  const size = 100
  const strokeWidth = 10
  const radius = size / 2 - strokeWidth / 2
  const circumference = 2 * Math.PI * radius

  it('defaults to full circle when no progress prop is passed', () => {
    const { getByTestId } = render(
      <OutterRim
        size={size}
        strokeWidth={strokeWidth}
        color="red"
        testID="rim"
      />
    )

    // capture the rendered Circle props
    const circle = getByTestId('rim').props

    // parse dasharray
    const rawArray = circle.strokeDasharray
    let vRaw: any, gRaw: any
    if (typeof rawArray === 'string') {
      [vRaw, gRaw] = rawArray.split(',')
    } else {
      [vRaw, gRaw] = rawArray
    }
    const visible = Number(vRaw)
    const gap = Number(gRaw)

    // should be full circumference for both visible and gap
    expect(visible).toBeCloseTo(circumference, 2)
    expect(gap).toBeCloseTo(circumference, 2)

    // strokeDashoffset should be zero
    const offset = Number(circle.strokeDashoffset)
    expect(offset).toBeCloseTo(0, 2)
  })

  it('renders correct dashoffset for 50% progress', () => {
    const { getByTestId } = render(
      <OutterRim
        size={size}
        strokeWidth={strokeWidth}
        color="red"
        progress={0.5}
        testID="rim"
      />
    )

    // capture the rendered Circle props
    const circle = getByTestId('rim').props

    const offset = Number(circle.strokeDashoffset)
    expect(offset).toBeCloseTo(circumference * 0.5, 2)
  })
})
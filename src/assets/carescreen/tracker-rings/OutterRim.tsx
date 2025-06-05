import React from 'react'
import Svg, { Circle } from 'react-native-svg'

interface RimProps {
  size: number
  strokeWidth: number
  color: string
  testID: string
  progress?: number
  accessible?: boolean
  accessibilityLabel?: string
}

const ClockArc: React.FC<RimProps> = ({
  size,
  strokeWidth,
  color,
  testID,
  progress = 1,
}) => {
  const radius = size / 2 - strokeWidth / 2
  const cx = size / 2
  const cy = size / 2
  const circumference = 2 * Math.PI * radius
  const dashArray = `${circumference},${circumference}`
  const dashOffset = circumference * (1 - progress)

  return (
    <Svg width={size} height={size}>
      <Circle
        testID={testID}
        cx={cx}
        cy={cy}
        r={radius}
        fill="none"
        stroke={color}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeDasharray={dashArray}
        strokeDashoffset={dashOffset}
        rotation={-90}
        origin={`${cx}, ${cy}`}
      />
    </Svg>
  )
}

export default ClockArc
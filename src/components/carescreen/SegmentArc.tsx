//src/components/carescreen/SegmentArc.tsx
import React from 'react'
import Svg, { Path } from 'react-native-svg'

interface SegmentArcProps {
  size: number
  strokeWidth: number
  startFraction: number
  endFraction: number
  color: string
  testID?: string
}

const SegmentArc: React.FC<SegmentArcProps> = ({
  size,
  strokeWidth,
  startFraction,
  endFraction,
  color,
  testID,
}) => {
  const fraction = endFraction - startFraction
  if (fraction <= 0) {
    return null
  }

  const radius = size / 2 - strokeWidth / 2
  const cx = size / 2
  const cy = size / 2
  const circumference = 2 * Math.PI * radius

  const visible = circumference * fraction
  // pass as number[] for a true numeric dash array
  const dashArray = [visible, circumference]

  const rotation = startFraction * 360 - 90

  const d = `
    M ${cx} ${cy - radius}
    A ${radius} ${radius} 0 1 1 ${cx} ${cy + radius}
    A ${radius} ${radius} 0 1 1 ${cx} ${cy - radius}
  `

  return (
    <Svg width={size} height={size}>
      <Path
        testID={testID}
        d={d}
        stroke={color}
        strokeWidth={strokeWidth}
        fill="none"
        strokeLinecap="round"
        strokeDasharray={dashArray}
        rotation={rotation}
        origin={`${cx}, ${cy}`}
      />
    </Svg>
  )
}

export default SegmentArc
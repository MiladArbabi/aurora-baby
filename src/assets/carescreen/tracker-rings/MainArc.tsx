// src/assets/carescreen/tracker-rings/MainArc.tsx
import React from 'react'
import { Svg, Circle } from 'react-native-svg'

interface ArcProps {
  size: number
  strokeWidth: number
  color: string
  testID: string
}

const MainArc: React.FC<ArcProps> = ({ size, strokeWidth, color, testID }) => {
  const radius = (size - strokeWidth) / 2
  const cx = size / 2
  const cy = size / 2
  const circumference = 2 * Math.PI * radius
  const gap = circumference * 0.1     // 10% gap
  const visible = circumference * 0.9  // 99% stroke

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
        strokeLinecap="round"              // make ends round
        strokeDasharray={`${visible}, ${gap}`}
        strokeDashoffset={gap / 2}         // center the gap at the top
        rotation={180}
        origin={`${cx}, ${cy}`}
      />
    </Svg>
  )
}

export default MainArc
// src/assets/carescreen/tracker-rings/ClockArc.tsx
import React from 'react'
import Svg, { Circle } from 'react-native-svg'

interface ClockArcProps {
  size: number
  strokeWidth: number
  color: string
  progress: number  // 0–1 fraction of the day
}

const ClockArc: React.FC<ClockArcProps> = ({
  size,
  strokeWidth,
  color,
  progress,
}) => {
  const radius = (size - strokeWidth) / 2
  const cx = size / 2
  const cy = size / 2
  const circumference = 2 * Math.PI * radius
  const gap = circumference * 0.1 // 10% gap
  const visible = circumference * 0.9 // 90% stroke
  // move the dash so that “progress” of the visible segment is drawn
  const dashOffset = visible * (1 - progress) + gap / 2

  return (
    <Svg width={size} height={size}>
      <Circle
        testID="clock-arc"
        cx={cx}
        cy={cy}
        r={radius}
        fill="none"
        stroke={color}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeDasharray={`${visible},${gap}`}
        strokeDashoffset={dashOffset}
        rotation={180} 
        origin={`${cx}, ${cy}`}
      />
    </Svg>
  )
}

export default ClockArc
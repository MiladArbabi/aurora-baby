//src/components/carescreen/SegmentArc.tsx
import React from 'react'
import Svg, { Path, Circle } from 'react-native-svg'

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
  const radius = size / 2 - strokeWidth / 2
  const cx = size / 2
  const cy = size / 2

  // compute start coordinates for initial dot
  const startAngleRad = startFraction * Math.PI * 2 - Math.PI / 2
  const startX = cx + radius * Math.cos(startAngleRad)
  const startY = cy + radius * Math.sin(startAngleRad)

  // arc path only when positive fraction
  let dashArray: number[] = []
  let pathRotation = 0
  if (fraction > 0) {
    const circumference = 2 * Math.PI * radius
    const visible = circumference * fraction
    dashArray = [visible, circumference]
    pathRotation = startFraction * 360 - 90
  }

  // define full circular path
  const d = `
    M ${cx} ${cy - radius}
    A ${radius} ${radius} 0 1 1 ${cx} ${cy + radius}
    A ${radius} ${radius} 0 1 1 ${cx} ${cy - radius}
  `

  return (
    <Svg width={size} height={size}>
      {/* initial dot at segment start */}
      <Circle
        cx={startX}
        cy={startY}
        r={strokeWidth / 2}
        fill={color}
        testID={testID ? `${testID}-dot` : undefined}
      />
      {/* arc path for duration */}
      {fraction > 0 && (
        <Path
          testID={testID}
          d={d}
          stroke={color}
          strokeWidth={strokeWidth}
          fill="none"
          strokeLinecap="round"
          strokeDasharray={dashArray}
          rotation={pathRotation}
          origin={`${cx}, ${cy}`}
        />
      )}
    </Svg>
  )
}

export default SegmentArc
// src/assets/carescreen/tracker-rings/InnerRim.tsx
import React from 'react'
import Svg, { Circle } from 'react-native-svg'

interface RimProps {
  size: number
  strokeWidth: number
  color: string
  testID: string
}

const InnerRim: React.FC<RimProps> = ({ size, strokeWidth, color, testID }) => {
  const radius = size / 2
  const cx = size / 2
  const cy = size / 2

  return (
    <Svg width={size} height={size}>
      <Circle
        testID={testID}
        cx={cx}
        cy={cy}
        r={radius - strokeWidth/2}
        fill="none"
        stroke={color}
        strokeWidth={strokeWidth} 
        strokeLinecap="round"    
        rotation={-90}
        origin={`${cx}, ${cy}`}
      />
    </Svg>
  )
}

export default InnerRim
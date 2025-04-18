import React from 'react'
import Svg, { Circle } from 'react-native-svg'

interface CoreProps {
  size: number
  color: string
}

const Core: React.FC<CoreProps> = ({ size, color }) => {
  const radius = size / 2
  const cx = size / 2
  const cy = size / 2

  return (
    <Svg width={size} height={size}>
      <Circle
        testID="core"
        cx={cx}
        cy={cy}
        r={radius}
        fill={color}
      />
    </Svg>
  )
}

export default Core
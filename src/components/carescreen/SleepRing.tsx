// src/components/carescreen/SleepRing.tsx
import React from 'react'
import Svg, { Circle, Path } from 'react-native-svg'
import { TouchableOpacity } from 'react-native'

interface Props {
  size: number
  startFrac: number
  endFrac: number
  color: string
  onPress?: () => void
}

const SleepRing: React.FC<Props> = ({ size, startFrac, endFrac, color, onPress }) => {
  const strokeWidth = 35
  const r = size/2 - strokeWidth/2
  const cx = size/2
  const cy = size/2

  // compute circle position
  const angle0 = startFrac * 2*Math.PI - Math.PI/2
  const x0 = cx + r * Math.cos(angle0)
  const y0 = cy + r * Math.sin(angle0)

  // arc dashes
  const circ = 2*Math.PI*r
  const visible = Math.max(0, (endFrac - startFrac)*circ)

  const d = `
    M ${cx} ${cy - r}
    A ${r} ${r} 0 1 1 ${cx} ${cy + r}
    A ${r} ${r} 0 1 1 ${cx} ${cy - r}
  `

  return (
    <TouchableOpacity
      style={{ position: 'absolute', width: size, height: size }}
      onPress={onPress}
      activeOpacity={0.7}
    >
        <Svg width={size} height={size} onPress={onPress}>
        {/* dot */}
        <Circle cx={x0} cy={y0} r={strokeWidth/2} fill={color} />
        {/* arc */}
        {visible > 0 && (
            <Path
            d={d}
            stroke={color}
            strokeWidth={strokeWidth}
            fill="none"
            strokeLinecap="round"
            strokeDasharray={[visible, circ - visible]}
            rotation={startFrac*360 - 90}
            origin={`${cx}, ${cy}`}
            />
        )}
        </Svg>
    </TouchableOpacity>
  )
}
export default SleepRing

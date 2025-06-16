// src/components/carescreen/EventOverlay.tsx
import React from 'react'
import Svg, { G } from 'react-native-svg'
import type { ViewStyle } from 'react-native'
import FeedIcon from '../../assets/carescreen/QuickLogMenu/FeedingButton'
import DiaperIcon from '../../assets/carescreen/QuickLogMenu/DiaperButton'
/* import CareIcon from '../../assets/carescreen/QuickLogMenu/CareButton'
import TalkIcon from '../../assets/carescreen/QuickLogMenu/TalkButton'
import OtherIcon from '../../assets/carescreen/QuickLogMenu/OtherButton' */

export type InstantEvent = {
  id: string
  timestamp: string
  category: 'feed'|'diaper'|'care'|'talk'|'other'
}

const ICON_SIZE = 30

function iconFor(category: InstantEvent['category']) {
  switch (category) {
    case 'feed':   return FeedIcon
    case 'diaper': return DiaperIcon
    case 'care':   return FeedIcon
    case 'talk':   return DiaperIcon
    case 'other':  return FeedIcon
  }
}

export function EventOverlay({
  events,
  size,
  radius,
  onPress,
  style,
}: {
  events: InstantEvent[]
  size: number
  radius: number
  onPress: (id: string) => void
  style?: ViewStyle
}) {
  const cx = size / 2
  const cy = size / 2

  return (
    <Svg width={size} height={size} style={style}>
      {events.map(e => {
        const d = new Date(e.timestamp)
        const frac = (d.getHours()*60 + d.getMinutes()) / (24*60)
        const angle = frac * 2*Math.PI - Math.PI/2
        const x = cx + Math.cos(angle) * radius
        const y = cy + Math.sin(angle) * radius
        const Icon = iconFor(e.category)

        return (
          <G
            key={e.id}
            x={x - ICON_SIZE/2}
            y={y - ICON_SIZE/2}
            onPress={() => onPress(e.id)}
          >
            <Icon width={ICON_SIZE} height={ICON_SIZE} />
          </G>
        )
      })}
    </Svg>
  )
}
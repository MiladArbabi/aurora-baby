// src/components/carescreen/CategoryRing.tsx
import React, { memo } from 'react'
import Svg, { Path, Text } from 'react-native-svg'
import { ViewStyle, StyleProp } from 'react-native'
import type { LogSlice } from '../../models/LogSlice'

interface CategoryRingProps {
  size: number  
  style?: StyleProp<ViewStyle>
  strokeWidth: number        // thickness of this ring
  fillColor: string           // color to fill when mask[h] === true
  separatorColor?: string    // same faint lines as SliceRing
  testID?: string
  placeholderColor?: string // color to fill when mask[h] === false
  accessible?: boolean       // for accessibility purposes
  accessibilityLabel?: string
  slices: LogSlice[];            // ← new: array of LogSlice
  fallbackMask?: boolean[]; 
  onSlicePress?: (hourIndex: number) => void // callback when a slice is pressed
  onSliceLongPress?: (hourIndex: number) => void // long-press
  dimFuture?: number // if true, dims future slices
  confirmedIds: Set<string>
  aiSuggestedIds: Set<string>
  mode?: 'edit' | 'view' // mode for rendering (e.g. edit mode)
}

/**
 * A memoized component that draws exactly one slice’s SVG path.
 * It only re-renders if any of these props actually change:
 *  - slice.id, slice.startTime, slice.endTime, fillColor or dimFuture.
 */
const SlicePath = memo<{
    slice: LogSlice
    center: number
    innerRadius: number
    outerRadius: number
    fillColor: string
    nowAngle: number
    onSlicePress?: (hourIdx: number) => void
    onSliceLongPress?: (hourIdx: number) => void
    isAiSuggested: boolean
    mode?:'edit' | 'view'
  }>(function SlicePath({
    slice,
    center,
    innerRadius,
    outerRadius,
    fillColor,
    nowAngle,
    onSlicePress,
    onSliceLongPress,
    isAiSuggested,
    mode = 'view',
  }) {
    // convert times to angles (degrees)
    const dateStart = new Date(slice.startTime)
    const totalMinutesStart = dateStart.getHours() * 60 + dateStart.getMinutes() + dateStart.getSeconds()/60
    const startAngle = (totalMinutesStart / (24 * 60)) * 360
  
    const dateEnd = new Date(slice.endTime)
    const totalMinutesEnd = dateEnd.getHours() * 60 + dateEnd.getMinutes() + dateEnd.getSeconds()/60
    const endAngle = (totalMinutesEnd / (24 * 60)) * 360
  
    // build the “d” attribute for this slice’s path
    const describeSlice = (
      centerX: number,
      centerY: number,
      innerR: number,
      outerR: number,
      startA: number,
      endA: number
    ) => {
      const polarToCartesian = (
        cx: number,
        cy: number,
        r: number,
        angleDeg: number
      ) => {
        const angleRad = (angleDeg - 90) * Math.PI / 180.0
        return {
          x: cx + r * Math.cos(angleRad),
          y: cy + r * Math.sin(angleRad),
        }
      }
  
      const outerStart = polarToCartesian(centerX, centerY, outerR, endA)
      const outerEnd   = polarToCartesian(centerX, centerY, outerR, startA)
      const innerStart = polarToCartesian(centerX, centerY, innerR, startA)
      const innerEnd   = polarToCartesian(centerX, centerY, innerR, endA)
      const largeArcFlag = endA - startA <= 180 ? '0' : '1'
  
      return [
        `M ${outerStart.x} ${outerStart.y}`,
        `A ${outerR} ${outerR} 0 ${largeArcFlag} 0 ${outerEnd.x} ${outerEnd.y}`,
        `L ${innerStart.x} ${innerStart.y}`,
        `A ${innerR} ${innerR} 0 ${largeArcFlag} 1 ${innerEnd.x} ${innerEnd.y}`,
        'Z',
      ].join(' ')
    }
  
    const pathD = describeSlice(center, center, innerRadius, outerRadius, startAngle, endAngle)
  
    const sliceIsFuture = startAngle >= nowAngle
    const opacity = sliceIsFuture ? 0.3 : 1
  
    // compute hourIndex from startAngle
    const hourIndex = Math.floor(startAngle / (360 / 24))
  
    return (
      <>
        <Path
          key={slice.id}
          d={pathD}
          fill={fillColor}
          fillOpacity={opacity}
          onPress={mode === 'edit'
                  ? undefined
                  : () => {
                    console.log('[CategoryRing] slice pressed', slice.id, '→ hourIndex', hourIndex)
                  onSlicePress?.(hourIndex)
                }
              }
              onLongPress={mode === 'edit'
              ? undefined
              : () => {
                console.log('[CategoryRing] slice long-pressed', slice.id, '→ hourIndex', hourIndex)
              onSliceLongPress?.(hourIndex)
            }
          }
        />
        {isAiSuggested && (() => {
          // compute midpoint of this arc
          const midAngle = (startAngle + endAngle) / 2
          const midRadius = (innerRadius + outerRadius) / 2
          const angleRad = (midAngle - 90) * Math.PI / 180
          const x = center + midRadius * Math.cos(angleRad)
          const y = center + midRadius * Math.sin(angleRad)
    
          return (
            <Text
              x={x}
              y={y}
              fontSize={innerRadius * 0.2}
              textAnchor="middle"
              alignmentBaseline="middle"
            >
              ✨
            </Text>
          )
        })()}
      </>
    )
  }, (prev, next) => {
    // re-render only if slice timing, fillColor, or nowAngle changed:
    return (
      prev.slice.id === next.slice.id &&
      prev.slice.startTime === next.slice.startTime &&
      prev.slice.endTime === next.slice.endTime &&
      prev.fillColor === next.fillColor &&
      prev.nowAngle === next.nowAngle
    )
  })

const polarToCartesian = (
  centerX: number,
  centerY: number,
  radius: number,
  angleInDegrees: number
) => {
  const angleInRadians = (angleInDegrees - 90) * Math.PI / 180.0
  return {
    x: centerX + radius * Math.cos(angleInRadians),
    y: centerY + radius * Math.sin(angleInRadians),
  }
}

const describeSlice = (
  centerX: number,
  centerY: number,
  innerRadius: number,
  outerRadius: number,
  startAngle: number,
  endAngle: number
) => {
  const outerStart = polarToCartesian(centerX, centerY, outerRadius, endAngle)
  const outerEnd   = polarToCartesian(centerX, centerY, outerRadius, startAngle)
  const innerStart = polarToCartesian(centerX, centerY, innerRadius, startAngle)
  const innerEnd   = polarToCartesian(centerX, centerY, innerRadius, endAngle)
  const largeArcFlag = endAngle - startAngle <= 180 ? '0' : '1'

  return [
    `M ${outerStart.x} ${outerStart.y}`,
    `A ${outerRadius} ${outerRadius} 0 ${largeArcFlag} 0 ${outerEnd.x} ${outerEnd.y}`,
    `L ${innerStart.x} ${innerStart.y}`,
    `A ${innerRadius} ${innerRadius} 0 ${largeArcFlag} 1 ${innerEnd.x} ${innerEnd.y}`,
    'Z',
  ].join(' ')
}

// Single arc component (for both real slices and placeholders)
const ArcPath = memo<{
  startAngle: number
  endAngle: number
  center: number
  innerRadius: number
  outerRadius: number
  color: string
  opacity: number
  onPress?: () => void
  showMarker?: boolean
}>(
  ({
    startAngle,
    endAngle,
    center,
    innerRadius,
    outerRadius,
    color,
    opacity,
    onPress,
    showMarker,
  }) => {
    const d = describeSlice(center, center, innerRadius, outerRadius, startAngle, endAngle)
    return (
      <>
        <Path d={d} fill={color} fillOpacity={opacity} onPress={onPress} />
        {showMarker && (() => {
          // ✨ AI marker
          const mid = (startAngle + endAngle) / 2
          const midR = (innerRadius + outerRadius) / 2
          const { x, y } = polarToCartesian(center, center, midR, mid)
          return (
            <Text x={x} y={y} textAnchor="middle" alignmentBaseline="middle">
              ✨
            </Text>
          )
        })()}
      </>
    )
  },
  // only re-render if key props change
  (a, b) =>
    a.startAngle === b.startAngle &&
    a.endAngle === b.endAngle &&
    a.color === b.color &&
    a.opacity === b.opacity
)

const CategoryRing: React.FC<CategoryRingProps> = ({
  size,
  strokeWidth,
  fillColor,
  placeholderColor = 'rgba(113, 1, 218, 0.15)',
  separatorColor = 'rgba(74, 74, 74, 0.05)',
  testID,
  onSlicePress,
  onSliceLongPress,
  slices,
  style,
  dimFuture,
  aiSuggestedIds,
  mode = 'view',
}) => {
  const isEdit = mode === 'edit'
  const center = size / 2
  const outerRadius = size / 2
  const innerRadius = outerRadius - strokeWidth

  // Convert a timestamp to angle (in degrees)
  const timeToAngle = (iso: string) => {
      const date = new Date(iso)
      const totalMinutes = date.getHours() * 60 + date.getMinutes() + date.getSeconds() / 60
      return (totalMinutes / (24 * 60)) * 360
    }
  
  // Determine the cutoff angle for “now” (in degrees)
  const nowAngle = (typeof dimFuture === 'number')
    ? dimFuture * 360
    : 360 // if dimFuture is undefined, treat everything as “past”

    const filledSlices: React.ReactNode[] = slices.map(slice => (
          <SlicePath
            key={slice.id}
            slice={slice}
            center={center}
            innerRadius={innerRadius}
            outerRadius={outerRadius}
            fillColor={fillColor}
            nowAngle={nowAngle}
            onSlicePress={isEdit ? undefined : onSlicePress}
            onSliceLongPress={isEdit ? undefined : onSliceLongPress}
            isAiSuggested={aiSuggestedIds.has(slice.id)}
            mode={mode}
          />
        ))
    // 1) Build and sort slice intervals
  const intervals = slices
  .map(s => {
    const start = new Date(s.startTime)
    const end   = new Date(s.endTime)
    const toAngle = (d: Date) =>
      ((d.getHours() * 60 + d.getMinutes() + d.getSeconds() / 60) / (24 * 60)) * 360
    return { startAngle: toAngle(start), endAngle: toAngle(end), id: s.id }
  })
  .sort((a, b) => a.startAngle - b.startAngle)    

   // 2) Compute gaps BETWEEN intervals (and before/after)
   const gaps: { startAngle: number; endAngle: number }[] = []
   if (intervals.length === 0) {
     // entire circle empty
     gaps.push({ startAngle: 0, endAngle: 360 })
   } else {
     // gap before first
     if (intervals[0].startAngle > 0) {
       gaps.push({ startAngle: 0, endAngle: intervals[0].startAngle })
     }
     // between slices
     intervals.forEach((cur, i) => {
       const next = intervals[i + 1]
       if (next && next.startAngle > cur.endAngle) {
         gaps.push({ startAngle: cur.endAngle, endAngle: next.startAngle })
       }
     })
     // after last
     const last = intervals[intervals.length - 1]
     if (last.endAngle < 360) {
       gaps.push({ startAngle: last.endAngle, endAngle: 360 })
     }
   }      

      // 3) Render placeholder arcs first
  const placeholderArcs = gaps.map((gap, i) => (
    <ArcPath
      key={`gap-${i}`}
      startAngle={gap.startAngle}
      endAngle={gap.endAngle}
      center={center}
      innerRadius={innerRadius}
      outerRadius={outerRadius}
      color={placeholderColor}        // using the new prop
      opacity={0.3}
    />
  ))    
  
    // 4) Render actual slice arcs on top
    const sliceArcs = intervals.map(({ startAngle, endAngle, id }) => {
      const isFuture = startAngle >= nowAngle
      return (
        <ArcPath
          key={id}
          startAngle={startAngle}
          endAngle={endAngle}
          center={center}
          innerRadius={innerRadius}
          outerRadius={outerRadius}
          color={fillColor}
          opacity={isFuture ? 0.6 : 1}
          onPress={isEdit 
            ? undefined 
            : () => onSlicePress?.(Math.floor(startAngle / (360 / 24)))}
          showMarker={aiSuggestedIds.has(id)}
        />
      )
    })      
      
   // 5) Hourly separators
   const separators = Array.from({ length: 24 }).map((_, i) => {
    const sA = (i * 360) / 24
    const eA = ((i + 1) * 360) / 24
    const d = describeSlice(center, center, innerRadius, outerRadius, sA, eA)
    return (
      <Path
        key={`sep-${i}`}
        d={d}
        fill="transparent"
        stroke={separatorColor}
        strokeWidth={1}
      />
    )
  })

  return (
    <Svg width={size} height={size} testID={testID}>
      {placeholderArcs} 
      {sliceArcs}
      {separators}  
      {filledSlices}
    </Svg>
  )
}

export default CategoryRing

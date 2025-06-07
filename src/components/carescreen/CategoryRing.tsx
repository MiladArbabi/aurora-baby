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
  accessible?: boolean       // for accessibility purposes
  accessibilityLabel?: string
  slices: LogSlice[];            // ← new: array of LogSlice
  fallbackMask?: boolean[]; 
  onSlicePress?: (hourIndex: number) => void // callback when a slice is pressed
  dimFuture?: number // if true, dims future slices
  confirmedIds: Set<string>
  aiSuggestedIds: Set<string>
  mode?: 'normal' | 'edit' | 'view' // mode for rendering (e.g. edit mode)
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
    isAiSuggested: boolean
    mode?: 'normal' | 'edit' | 'view'
  }>(function SlicePath({
    slice,
    center,
    innerRadius,
    outerRadius,
    fillColor,
    nowAngle,
    onSlicePress,
    isAiSuggested,
    mode,
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
    const opacity = sliceIsFuture ? 0.6 : 1
  
    // compute hourIndex from startAngle
    const hourIndex = Math.floor(startAngle / (360 / 24))
  
    return (
      <>
        <Path
          key={slice.id}
          d={pathD}
          fill={fillColor}
          fillOpacity={opacity}
          onPress={() => {
            console.log('[CategoryRing] slice pressed', slice.id, '→ hourIndex', hourIndex)
            onSlicePress?.(hourIndex)
          }}
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

const CategoryRing: React.FC<CategoryRingProps> = ({
  size,
  strokeWidth,
  fillColor,
  separatorColor = 'rgba(0,0,0,0.1)',
  testID,
  onSlicePress,
  slices,
  style,
  dimFuture,
  aiSuggestedIds
}) => {
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
            onSlicePress={onSlicePress}
            isAiSuggested={aiSuggestedIds.has(slice.id)}
          />
        ))
      
        const separators: React.ReactNode[] = []
        for (let i = 0; i < 24; i++) {
          const startAngle = (i * 360) / 24
          const endAngle   = ((i + 1) * 360) / 24
          const d = describeSlice(center, center, innerRadius, outerRadius, startAngle, endAngle)
          separators.push(
            <Path
              key={`sep-${i}`}
              d={d}
              fill="transparent"
              stroke={separatorColor}
              strokeWidth={1}
            />
          )
        }

  return (
    <Svg width={size} height={size} testID={testID}>
       {separators}
      {filledSlices}
    </Svg>
  )
}

export default CategoryRing

import React from 'react'
import { View, StyleSheet } from 'react-native'
import Svg, { Rect, Line, Text as SvgText } from 'react-native-svg'
import { parseISO, format, startOfWeek, subWeeks, startOfMonth, subMonths } from 'date-fns'

export type Interval = {
  date:          string    // full ISO date string 'YYYY-MM-DD'
  startFraction: number     // 0–1 of the day
  endFraction:   number
  color:         string
}

export const TimelineChart: React.FC<{
  intervals: Interval[]
  period: 'Daily' | 'Weekly' | 'Monthly'
  /** optional extra markers (e.g. feed events) */
  markers?: { fraction: number; color: string; label: string }[]
    }> = ({ intervals, period, markers }) => {
  // group intervals into rows by period
  type Row = { label: string; items: Interval[] }
  let rows: Row[] = []

  if (period === 'Daily') {
    // each interval on its own date
    rows = intervals.map(iv => ({
      label: format(parseISO(iv.date), 'MM-dd'),
      items: [iv],
    }))
  } else if (period === 'Weekly') {
    const weekMap = new Map<string, Interval[]>()
    intervals.forEach(iv => {
      const d = parseISO(iv.date)
      const weekStart = startOfWeek(d, { weekStartsOn: 1 })
      const key = format(weekStart, 'yyyy-\'W\'II')
      const arr = weekMap.get(key) ?? []
      arr.push(iv)
      weekMap.set(key, arr)
    })
    rows = Array.from(weekMap.entries()).map(([week, items]) => ({ label: week, items }))
  } else {
    const monMap = new Map<string, Interval[]>()
    intervals.forEach(iv => {
      const d = parseISO(iv.date)
      const monStart = startOfMonth(d)
      const key = format(monStart, 'MMM yyyy')
      const arr = monMap.get(key) ?? []
      arr.push(iv)
      monMap.set(key, arr)
    })
    rows = Array.from(monMap.entries()).map(([mon, items]) => ({ label: mon, items }))
  }

  const MARGIN = { top: 20, right: 20, bottom: 30, left: 60 }
  const ROW_HEIGHT = 30
  const width = 300
  const height = rows.length * ROW_HEIGHT + MARGIN.top + MARGIN.bottom

  // domain from 20:00 (fraction 20/24) through next‐day 09:00 (fraction 33/24)
  const DAY_START = 20 / 24
  const DAY_END = 33 / 24
  const DOMAIN_SPAN = DAY_END - DAY_START

  const toX = (frac: number) => {
    const f = frac < DAY_START ? frac + 1 : frac
    return MARGIN.left + ((f - DAY_START) / DOMAIN_SPAN) * width
  }

  return (
    <View style={styles.container}>
      <Svg width={width + MARGIN.left + MARGIN.right} height={height}>
        {/* Y-axis labels */}
        {rows.map((row, rowIndex) => {
          const y = MARGIN.top + rowIndex * ROW_HEIGHT + ROW_HEIGHT / 2 + 4
          return (
            <SvgText
              key={row.label}
              x={MARGIN.left - 6}
              y={y}
              fontSize="10"
              fill="#AAA"
              textAnchor="end"
            >
              {row.label}
            </SvgText>
          )
        })}

        {/* X-axis line */}
        <Line
          x1={MARGIN.left}
          y1={MARGIN.top + rows.length * ROW_HEIGHT}
          x2={MARGIN.left + width}
          y2={MARGIN.top + rows.length * ROW_HEIGHT}
          stroke="#555"
        />

        {/* X-axis ticks every 2 hours from 20→9 */}
        {Array.from({ length: 8 }).map((_, i) => {
          const hour = 20 + i * 2
          const x = toX((hour % 24) / 24)
          return (
            <React.Fragment key={i}>
              <Line
                x1={x}
                y1={MARGIN.top + rows.length * ROW_HEIGHT}
                x2={x}
                y2={MARGIN.top + rows.length * ROW_HEIGHT + 6}
                stroke="#AAA"
              />
              <SvgText
                x={x}
                y={MARGIN.top + rows.length * ROW_HEIGHT + 18}
                fontSize="8"
                fill="#AAA"
                textAnchor="middle"
              >
                {`${hour % 24}:00`}
              </SvgText>
            </React.Fragment>
          )
        })}

        {/* Bars */}
        {rows.map((row, rowIndex) =>
          row.items.map((iv, idx) => {
            const y = MARGIN.top + rowIndex * ROW_HEIGHT + ROW_HEIGHT / 4
            const x0 = toX(iv.startFraction)
            const x1 = toX(iv.endFraction)
            return (
              <Rect
                key={`${row.label}-${idx}`}
                x={x0}
                y={y}
                width={Math.max(1, x1 - x0)}
                height={ROW_HEIGHT / 2}
                fill={iv.color}
                rx={4}
              />
            )
          })
        )}
        {/* Feed Markers */}
        {markers?.map((m, i) => {
          const x = toX(m.fraction)
          return (
            <Line
            key={`feed-${i}`}
            x1={x} y1={MARGIN.top}
            x2={x} y2={height - MARGIN.bottom}
            stroke={m.color}
            strokeWidth={2}
            strokeDasharray={[2,4]}
            />
          )
        })}
      </Svg>
    </View>
  )
}

const styles = StyleSheet.create({
  container: { alignItems: 'center', paddingVertical: 8 }
})

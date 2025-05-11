//src/hooks/useChartSpecs.ts
import { useMemo } from 'react'
import { subDays, subWeeks, subMonths, startOfDay, startOfWeek, addDays, addWeeks, startOfMonth } from 'date-fns'
import { useTheme } from 'styled-components/native'
import type { ChartSpec } from 'components/carescreen/ChartCard'
import { useInsightsData } from './useInsightsData'
import { Interval } from 'components/carescreen/TimelineChart'

type LogType = 
'Sleep Summary' 
| 'Naps' 
| 'Awake Time' 
| 'Feedings' 
| 'Diaper Changes'

export function useChartSpecs
    (period: 'Daily'|'Weekly'|'Monthly',
        sleepFilter: 'total'|'night'|'nap',
        periodOffset: number,
        showLast24h: boolean) {

const theme = useTheme() 
const todayISO = new Date().toISOString().slice(0,10)

const {
    byDate,
    sleepSegments,
    intervalData,
    feedMarks,
    feedTypeCounts,
    avgDaily, avgWeekly, avgMonthly,
    correlationMessage,
    diaperTypeCounts,
    diaperMarks,
  } = useInsightsData(showLast24h)

// per-period dummy timeline if intervalData is empty
  const dummyTimeline = (() => {
    if (period === 'Daily') {
      return [
        { date: todayISO, startFraction: 22/24, endFraction: 6/24, color: '#7986CB' },
        { date: todayISO, startFraction: 20/23, endFraction: 6/20, color: '#FFD1B3' },
        { date: todayISO, startFraction: 21/23, endFraction: 6/18, color: '#A4B9CC' },
      ]
    }
    if (period === 'Weekly') {
      return [0,1,2].map(i => ({
        date: subWeeks(new Date(), i).toISOString().slice(0,10),
        startFraction: 22/24,
        endFraction:   6/24,
        color: ['#7986CB','#FFD1B3','#A4B9CC'][i],
      }))
    }
    // Monthly
    return [0,1,2].map(i => ({
      date: subMonths(new Date(), i).toISOString().slice(0,10),
      startFraction: 22/24,
      endFraction:   6/24,
      color: ['#7986CB','#FFD1B3','#A4B9CC'][i],
    }))
  })()
  const timelinePayload = intervalData.length > 0
    ? intervalData
    : dummyTimeline
    
      // each day you’ve already broken out nap1, nap2, nap3
      type DayWithNaps = { nap1: number; nap2: number; nap3: number; /*…*/ };
    
      /* // build a per-day map of up to 3 nap durations:
      const napBuckets = byDate.map(day => ({
        nap1: day.napDurations[0] || 0,
        nap2: day.napDurations[1] || 0,
        nap3: day.napDurations[2] || 0,
      })) */
    
        // 🔥 smoke-test for Naps stackedBar: 3 days of dummy nap durations
      const napBuckets = [
        { nap1: 30/60, nap2: 20/60, nap3: 10/60 },
        { nap1: 45/60, nap2: 30/60, nap3: 20/60 },
        { nap1: 25/60, nap2: 35/60, nap3: 15/60 },
    
      ];
    
      // colors for each “stack”:
      const napColors = [
        theme.colors.darkAccent,       // nap1
        theme.colors.background,       // nap2
        theme.colors.highlight,        // nap3
      ];
    
      // 🔥 smoke-test for Awake-Windows stackedBar …
        const awakeBuckets = [
          { w1: 60/60,  w2: 120/60, w3: 30/60,  w4: 450/60 },  // dummy window durations
          { w1: 95/60,  w2: 100/60, w3: 50/60,  w4: 380/60 },
          { w1: 75/60,  w2: 110/60, w3: 40/60,  w4: 420/60 },
        ]
        const wakeColors = [
          theme.colors.secondaryAccent, 
          theme.colors.primary, 
          theme.colors.darkAccent, 
          theme.colors.aiGenerated,
        ]
    
    // ─── Smoke-test feeding data ────────────────────────────────
    const todayKey = new Date().toISOString().slice(0,10)
    const dummyFeedCounts   = [3, 5, 2, 4, 6, 3, 5]  // one bar per day
    const dummyFeedTypeData = { breast: 8, bottle: 12, solid: 4 }
    const dummyFeedIntervals: { date: string; startFraction: number; endFraction: number; color: string }[] = (() => {
      if (period === 'Daily') {
        // all on today
        return [
          { date: todayISO, startFraction: 8/24,   endFraction: 8.1/24, color: theme.colors.primary },
          { date: todayISO, startFraction: 12/24,  endFraction: 12.05/24, color: theme.colors.secondaryAccent },
          { date: todayISO, startFraction: 18/24,  endFraction: 18.1/24, color: theme.colors.accent },
        ]
      } else if (period === 'Weekly') {
        // one per week for 0,1,2 weeks ago
        return [0,1,2].map(i => {
          const date = subWeeks(new Date(), i).toISOString().slice(0,10)
          const colors = [ theme.colors.primary, theme.colors.secondaryAccent, theme.colors.accent ]
          return { date, startFraction: 10/24, endFraction: 10.2/24, color: colors[i] }
        })
      } else {
        // one per month for 0,1,2 months ago
        return [0,1,2].map(i => {
          const date = subMonths(new Date(), i).toISOString().slice(0,10)
          const colors = [ theme.colors.primary, theme.colors.secondaryAccent, theme.colors.accent ]
          return { date, startFraction: 14/24, endFraction: 14.2/24, color: colors[i] }
        })
      }
    })()
    
    const dummyFeedMarkers = [
      { fraction: 8/24,  color: theme.colors.primary,        label:'breast' },
      { fraction:12/24,  color: theme.colors.accent,         label:'bottle' },
      { fraction:18/24,  color: theme.colors.secondaryAccent,label:'solid'  },
    ]
    const dummyCorrelation = '❗ No real data—this is just a smoke-test insight.'
    
    // precompute each series
  // const totalSleep = byDate.map(d => d.napMinutes + d.nightMinutes)
  const nightSleep = byDate.map(d => d.nightMinutes)
  const napSleep   = byDate.map(d => d.napMinutes)

  /* const dates = byDate.map(d => d.date.slice(5))
  const totalSleep = byDate.map(d => d.napMinutes + d.nightMinutes) */
  // smoke-test: dummy 7-day total sleep (in minutes) 
  // - Replace with above, once in production
  const dates = ['Mon','Tue','Wed','Thu','Fri','Sat','Sun']
  const totalSleep = [420, 480, 360, 540, 300, 600, 450]

      // Smoke-test to see if the gauge works
    // - Replace with above, once in production
    const timelineSegments = [
        { from: 0 / 24, to:  4 / 24, color: '#E57373' },  // midnight→4 AM
        { from: 4 / 24, to:  8 / 24, color: '#BA68C8' },  // 4 AM→8 AM
        { from: 8 / 24, to: 12 / 24, color: '#7986CB' },  // 8 AM→12 PM
        { from:12 / 24, to: 16 / 24, color: '#4DB6AC' },  // 12 PM→4 PM
        { from:16 / 24, to: 20 / 24, color: '#AED581' },  // 4 PM→8 PM
        { from:20 / 24, to: 24 / 24, color: '#FFD54F' },  // 8 PM→midnight
      ]

      const gaugeTitle = useMemo(() => {
        const now = new Date()
        let label: string
    
        if (period === 'Daily') {
          const start = subDays(startOfDay(now), periodOffset)
          label = periodOffset === 0
            ? `Today (${start.getMonth()+1}/${start.getDate()})`
            : `${periodOffset} day${periodOffset>1?'s':''} ago`
        } else if (period === 'Weekly') {
          const weekStart = subWeeks(startOfWeek(now, { weekStartsOn: 1 }), periodOffset)
          const weekEnd = addWeeks(weekStart, 1)
          label = periodOffset === 0
            ? `This week (${weekStart.getMonth()+1}/${weekStart.getDate()}–${weekEnd.getMonth()+1}/${weekEnd.getDate()})`
            : periodOffset === 1
              ? `Last week (${weekStart.getMonth()+1}/${weekStart.getDate()}–${weekEnd.getMonth()+1}/${weekEnd.getDate()})`
              : `${periodOffset} weeks ago`
        } else {
          const monthStart = subMonths(startOfMonth(now), periodOffset)
          label = periodOffset === 0
            ? `This month (${monthStart.getMonth()+1}/${monthStart.getFullYear()})`
            : periodOffset === 1
              ? `Last month (${monthStart.getMonth()+1}/${monthStart.getFullYear()})`
              : `${periodOffset} months ago`
        }
    
        return label
      }, [period, periodOffset])

// ─── Smoke-test diaper data ────────────────────────────────
const dummyDiaperBuckets = [
  { wet: 2, dirty: 1 },
  { wet: 3, dirty: 2 },
  { wet: 1, dirty: 3 },
  { wet: 4, dirty: 0 },
  { wet: 2, dirty: 2 },
  { wet: 3, dirty: 1 },
  { wet: 2, dirty: 2 },
]  // 7 periods of [wet,dirty]

// breakdown totals
const dummyDiaperTypeData = { wet: 17, dirty: 11 }

// timing intervals & markers
const dummyDiaperIntervals = [
  { date: todayKey, startFraction:  7/24, endFraction: 7.1/24, color: theme.colors.primary },
  { date: todayKey, startFraction: 12/24, endFraction:12.1/24, color: theme.colors.accent },
  { date: todayKey, startFraction: 18/24, endFraction:18.1/24, color: theme.colors.secondaryAccent },
]
const dummyDiaperMarkers = [
  { fraction:  7/24, color: theme.colors.primary,        label: 'wet'   },
  { fraction: 12/24, color: theme.colors.accent,         label: 'dirty' },
  { fraction: 18/24, color: theme.colors.secondaryAccent,label: 'wet'   },
]

// ── SMOKE-TEST TIMELINE DATA ─────────────────────────────────────
const SMOKE_FEED_TIMELINE: Interval[] = [
    { date: '2025-05-01', startFraction:  2/24, endFraction: 2.1/24, color: '#50E3C2' },
    { date: '2025-05-02', startFraction: 14/24, endFraction: 14.2/24, color: '#4A90E2' },
    { date: '2025-05-03', startFraction: 20/24, endFraction: 20.1/24, color: '#F5A623' },
  ]
  const SMOKE_FEED_MARKERS = [
    { fraction:  2.05/24, color: '#50E3C2', label: 'breast' },
    { fraction: 14.1 /24, color: '#4A90E2', label: 'bottle' },
    { fraction: 20.05/24, color: '#F5A623', label: 'solid'  },
  ]
  
  const SMOKE_DIAPER_TIMELINE: Interval[] = [
    { date: '2025-05-01', startFraction:  6/24, endFraction: 6.1/24, color: '#F5A623' },
    { date: '2025-05-02', startFraction: 12/24, endFraction:12.2/24, color: '#50E3C2' },
    { date: '2025-05-03', startFraction: 18/24, endFraction:18.1/24, color: '#4A90E2' },
  ]
  const SMOKE_DIAPER_MARKERS = [
    { fraction:  6.05/24, color: '#F5A623', label: 'wet'   },
    { fraction: 12.1 /24, color: '#50E3C2', label: 'dirty' },
    { fraction: 18.05/24, color: '#4A90E2', label: 'wet'   },
  ]

  const chartSpecs: Record<LogType, ChartSpec[]> = {
      'Sleep Summary': [
      {
        testID: 'chart-gauge',
        title:  gaugeTitle,
        type:   'gauge',
        data:   { segments: timelineSegments },
      },    
      {
        testID: 'chart-7day',
        title:
        sleepFilter === 'total' ? 'Total sleep duration'
        : sleepFilter === 'night'
        ? 'Total night time sleep duration'
        : 'Total nap time duration',
        type: 'area',
        data:
        sleepFilter === 'total' ? totalSleep
        : sleepFilter === 'night' ? nightSleep
        : napSleep,
        period,
        svgProps: {
        stroke:   theme.colors.primary,
        fill:     'rgba(76,175,80,0.2)',
        baseline: 14 * 60,
          },
        },
      {
        testID: 'chart-timeline',
        title: 'Sleep Intervals',
        type: 'timeline',
        data: timelinePayload, //Switch back to intervalData for production
        period,
      }
    ],
    'Naps': [
      {
        testID: 'chart-naps',
        title: period === 'Daily'
          ? 'Naps per Day'
          : period === 'Weekly'
          ? 'Naps per Week'
          : 'Naps per Month',
        type: 'stackedBar',
        data: napBuckets,
        keys: ['nap1','nap2','nap3'],
        colors: napColors,
        period,
      }
    ],
    'Awake Time': [
      {
        testID: 'chart-awakeStack',
        title: period === 'Daily' ? 'Awake Windows (Daily)'
            : period === 'Weekly'? 'Awake Windows (Weekly)'
            : 'Awake Windows (Monthly)',
        type: 'stackedBar',
        data: awakeBuckets,
        keys: ['w1','w2','w3','w4'],
        colors: wakeColors,
        period,
      }
    ],
    'Feedings': [
       // ─── 0) Stats strip
       {
        testID: 'chart-feed-stats',
        title: 'Feedings stats',
        type: 'statStrip',
        data: { avgDaily, avgWeekly, avgMonthly },
      },
      // ─── 1) Total feeds per period ───────────────────────────────
      {
        testID: 'chart-feed-counts',
        title:
          period === 'Daily'
            ? 'Feedings per Day'
            : period === 'Weekly'
              ? 'Feedings per Week'
              : 'Feedings per Month',
        type: 'bar',
        data: dummyFeedCounts, // swap out for byDate.map(d => d.feeding) during production
        svgProps: { fill: theme.colors.primary }
      },
  
      // ─── 2) Feeding‐type breakdown
      {
        testID: 'chart-feed-type',
        title: 'Feeding Types',
        type: 'donut',
        data: dummyFeedTypeData, // swap out for feedTypeCounts during production
        colors: [
          theme.colors.primary,
          theme.colors.secondaryAccent,
          theme.colors.accent,
        ],
      },
  
      // ─── 3) Annotated timeline
      {
        testID: 'chart-feed-timeline',
        title:  'Feeding vs Sleep',
        type:   'markerTimeline',
        intervals: SMOKE_FEED_TIMELINE,    // ← pulled up
        markers:   SMOKE_FEED_MARKERS,     // ← pulled up
        period,
      },
  
      // ─── 4) Correlation call‐out
      {
        testID: 'chart-feed-correlation',
        title: 'Insights',
        type: 'callout',
        data: dummyCorrelation, // swap out for correlationMessage during production
      },
    ],
  
          'Diaper Changes': [
      // (1) Total changes per period
      {
        testID: 'chart-diaper-total',
        title:
          period === 'Daily'
            ? 'Diapers per Day'
            : period === 'Weekly'
              ? 'Diapers per Week'
              : 'Diapers per Month',
        type: 'stackedBar',
        data: dummyDiaperBuckets,
        // swap out with byDate.map(d => ({ wet: d.mood['wet'] || 0, dirty: d.mood['dirty'] || 0 })) for production
        keys: ['wet','dirty'],
        colors: [theme.colors.primary, theme.colors.accent],
        period,
      },
      // (2) Wet vs. Dirty breakdown
      {
        testID: 'chart-diaper-type',
        title: 'Wet vs Dirty',
        type: 'donut',
        data: dummyDiaperTypeData, // swap out for diaperTypeCounts during production
        colors: [theme.colors.primary, theme.colors.accent],
      },
      // (3) Timing of changes
      {
        testID: 'chart-diaper-timing',
        title:  'Change Timing',
        type:   'markerTimeline',
        intervals: SMOKE_DIAPER_TIMELINE,  // ← pulled up
        markers:   SMOKE_DIAPER_MARKERS,   // ← pulled up
        period,
        },
      ],
    }
    return chartSpecs;
}
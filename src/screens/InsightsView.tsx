//src/screens/InsightsView.tsx (graphs)
import React, { useState } from 'react'
import { 
  View,
  Text, 
  StyleSheet, 
  ScrollView, 
  TouchableOpacity,
  Modal,
  PanResponder } from 'react-native'
import { useNavigation } from '@react-navigation/native'
import { StackNavigationProp } from '@react-navigation/stack'
import { useTheme } from 'styled-components/native'
import { startOfDay, subDays, startOfWeek, subWeeks, addWeeks, addDays,
  startOfMonth, subMonths, addMonths } from 'date-fns'
import Icon from 'react-native-vector-icons/Feather'

import { RootStackParamList } from '../navigation/AppNavigator'
import CareLayout from 'components/carescreen/CareLayout'
import { MiniTab } from 'components/carescreen/MiniNavBar'
import CalendarGrid from 'components/common/CalendarGrid'

import { useInsightsData } from '../hooks/useInsightsData'
import { ChartCard, ChartSpec } from '../components/carescreen/ChartCard'


type InsightsNavProp = StackNavigationProp<RootStackParamList, 'Care'>

const SPACING = {
  gutter: 16,
  small: 8,
  tiny: 4,
  cardPadding: 12,
  pillHeight: 32,
}

const logTypes = [
  'Sleep Summary',
  'Naps',
  'Awake Time',
  'Feedings',
  'Diaper Changes',
] as const
type LogType = typeof logTypes[number]

const monthNames = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];

const InsightsScreen: React.FC = () => {
  const navigation = useNavigation<InsightsNavProp>()
  const theme = useTheme()

  const [showLast24h, setShowLast24h] = useState(false)
  const { 
    byDate,
    sleepSegments, 
    intervalData,
    feedMarks, 
    feedTypeCounts, 
    avgDaily, avgWeekly, avgMonthly,
    correlationMessage, 
    diaperTypeCounts, 
    diaperMarks } = useInsightsData(showLast24h)
  const [period, setPeriod] = useState<'Daily'|'Weekly'|'Monthly'>('Weekly')
  const [logType, setLogType] = useState<LogType>('Sleep Summary')
  const [rangeEnd, setRangeEnd] = useState<Date>(new Date())

  // －－ filter for Sleep Summary area chart －－
  const [sleepFilter, setSleepFilter] = useState<'total'|'night'|'nap'>('total')
  // around line 20 in src/screens/InsightsView.tsx
  const [showDateModal,   setShowDateModal]   = useState(false)
   // how many periods back we are viewing (0 = current, 1 = yesterday / last week / last month, etc.)
   const [periodOffset, setPeriodOffset] = useState(0)

  // track the currently-viewed month in your custom date picker:
  const [pickerYear, setPickerYear]   = useState(new Date().getFullYear())
  const [pickerMonth, setPickerMonth] = useState(new Date().getMonth())  // 0–11

  // 1) store our selected range
  const [rangeStart, setRangeStart] = useState<Date>(
      // default to last 7 days
      new Date(Date.now() - 7 * 24 * 60 * 60 * 1000))

      // pan responder to detect left/right swipes
  const panResponder = React.useRef(
    PanResponder.create({
      onMoveShouldSetPanResponder: (_, { dx, dy }) => Math.abs(dx) > Math.abs(dy) && Math.abs(dx) > 10,
      onPanResponderRelease: (_, { dx }) => {
        if (dx < -20)  setPeriodOffset(o => o + 1)               // swipe left → older
        else if (dx > 20) setPeriodOffset(o => Math.max(0, o - 1)) // swipe right → newer (not beyond 0)
      },
    })
  ).current
  
    // 2) derive the button labels
    const formatLabel = (d: Date) =>
      `${monthNames[d.getMonth()]}-${d.getDate()}`
    const startLabel = formatLabel(rangeStart)
    const endLabel = formatLabel(rangeEnd)
  
    // 3) helper to apply one of the presets
    const applyPreset = (label: string) => {
      const now = new Date()
      let start: Date
      switch (label) {
        case 'Last 24h':
          start = new Date(Date.now() - 24 * 60 * 60 * 1000)
          break
        case '7 days':
          start = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
          break
        case '30 days':
          start = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
          break
        default:
          return
      }
      setRangeStart(start)
      setRangeEnd(now)
    }
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

/*   const timelineSegments = sleepSegments.map(seg => ({
    from: seg.startFraction,
    to:   seg.endFraction,
    color: seg.color,
  })) */

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

  /* // compute start/end of the current page based on period + offset
  const now = new Date()
  let windowStart: Date, windowEnd: Date

  if (period === 'Daily') {
    const day = subDays(startOfDay(now), periodOffset)
    windowStart = day
    windowEnd   = addDays(day, 1)
  } else if (period === 'Weekly') {
    const weekStart = subWeeks(startOfWeek(now, { weekStartsOn: 1 }), periodOffset)
    windowStart = weekStart
    windowEnd   = addWeeks(weekStart, 1)
  } else {
    const monthStart = subMonths(startOfMonth(now), periodOffset)
    windowStart = monthStart
    windowEnd   = addMonths(monthStart, 1)
  } */

  /* // now slice your sleepSegments into that window and scale to a 0–1 fraction ring:
  const fullSpan = windowEnd.getTime() - windowStart.getTime()
  const timelineSegments = sleepSegments
    .filter(seg => {
      const segStart = new Date(seg.startFraction).getTime()
      return segStart >= windowStart.getTime() && segStart < windowEnd.getTime()
    })
    .map(seg => {
      const a = new Date(seg.startFraction).getTime() - windowStart.getTime()
      const b = new Date(seg.endFraction  ).getTime() - windowStart.getTime()
      return {
        from: a / fullSpan,
        to:   b / fullSpan,
        color: seg.color,
      }
    }) */ 

  // fallback to smoke-test intervals if your pipeline isn’t hooked up yet
  const todayISO = new Date().toISOString().slice(0,10)

  // ── MODIFIED ──
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

  const handleNavigate = (tab: MiniTab) => {
    if (tab === 'graph') return
    if (tab === 'tracker') navigation.navigate('Care')
    if (tab === 'cards')   navigation.navigate('PastLogs')
  }

  // 1) compute a human-readable label for your current “window” based on period & offset
const gaugeTitle = React.useMemo(() => {
  const now = new Date()
  let start: Date, end: Date
  let label: string

  if (period === 'Daily') {
    // “current” day is offset=0, “1 day ago” offset=1, etc.
    start = subDays(startOfDay(now), periodOffset)
    end   = addDays(start, 1)
    if (periodOffset === 0) {
      label = `Today (${monthNames[start.getMonth()]} ${start.getDate()})`
    } else {
      const dayAgo = periodOffset
      label = `${dayAgo} day${dayAgo>1?'s':''} ago (${monthNames[start.getMonth()]} ${start.getDate()})`
    }

  } else if (period === 'Weekly') {
    // iso-week starting Monday
    const weekStart = subWeeks(startOfWeek(now, { weekStartsOn: 1 }), periodOffset)
    const weekEnd   = addWeeks(weekStart, 1)
    if (periodOffset === 0) {
      label = `This week (${monthNames[weekStart.getMonth()]} ${weekStart.getDate()}–${monthNames[weekEnd.getMonth()]} ${weekEnd.getDate()})`
    } else if (periodOffset === 1) {
      label = `Last week (${monthNames[weekStart.getMonth()]} ${weekStart.getDate()}–${monthNames[weekEnd.getMonth()]} ${weekEnd.getDate()})`
    } else {
      label = `${periodOffset} weeks ago (${monthNames[weekStart.getMonth()]} ${weekStart.getDate()}–${monthNames[weekEnd.getMonth()]} ${weekEnd.getDate()})`
    }

  } else { // Monthly
    const monthStart = subMonths(startOfMonth(now), periodOffset)
    if (periodOffset === 0) {
      label = `This month (${monthNames[monthStart.getMonth()]} ${monthStart.getFullYear()})`
    } else if (periodOffset === 1) {
      label = `Last month (${monthNames[monthStart.getMonth()]} ${monthStart.getFullYear()})`
    } else {
      label = `${periodOffset} months ago (${monthNames[monthStart.getMonth()]} ${monthStart.getFullYear()})`
    }
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
      title: 'Feeding vs Sleep',
      type: 'markerTimeline',
      intervals: dummyFeedIntervals, // swap out for intervalData during production
      markers: feedMarks.map(m => ({
        fraction: m.fraction,
        color:    m.color,
        label:    m.type,
      })),
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
      title: 'Change Timing',
      type: 'markerTimeline',
      intervals: dummyDiaperIntervals, // swap out for intervalData during production
      markers: dummyDiaperMarkers, 
      // swap out diaperMarks.map(m => ({ fraction: m.fraction, color:    m.color,label:    m.type,})) during production,
      period,
      },
    ],
  }

  return (
    <CareLayout 
      activeTab="graph" 
      onNavigate={handleNavigate}
      bgColor={theme.colors.darkBackground}
    >
      {/* make entire content scrollable */}
      <ScrollView style={styles.container} contentContainerStyle={styles.content}>

        {/* 1) Title + description */}
        <View style={styles.headerContainer}>
          <Text style={styles.heading}>Insights & Analytics</Text>
          <Text style={styles.subheading}>
            Discover how your little one’s sleep, feeds, and diapers ebb and flow over time.
          </Text>
        </View>

        {/* 2) Date‐range presets + Daily/Weekly/Monthly */}
        <View style={styles.selectorRow}>
          {/* segmented control */}
          <View style={styles.segmentedControl}>
            {(['Daily','Weekly','Monthly'] as const).map(p => (
              <TouchableOpacity
                key={p}
                onPress={() => setPeriod(p)}
                style={[
                  styles.segment,
                  period === p && styles.segmentActive,
                ]}
              >
                <Text
                  style={[
                    styles.segmentText,
                    period === p && styles.segmentTextActive,
                  ]}
                >
                  {p}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* single date-range button */}
          <TouchableOpacity
            style={styles.dateRangeButton}
            onPress={() => setShowDateModal(true)}
          >
            <Text style={styles.selectorText}>
              {startLabel} – {endLabel} ▾
            </Text>
          </TouchableOpacity>
        </View>

        {/* 3) Log-type horizontal picker */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.logTypeRow}
        >
          {logTypes.map(type => (
            <TouchableOpacity
              key={type}
              onPress={() => setLogType(type)}
              style={[
                styles.logTypeButton,
                logType === type && styles.logTypeButtonActive,
              ]}
            >
              <Text
                style={[
                  styles.logTypeText,
                  logType === type && styles.logTypeTextActive,
                ]}
              >
                {type}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* 4) Charts (dynamic by selected logType) */}
        {chartSpecs[logType].map(spec => {
          // the plain card
          const card = <ChartCard key={spec.testID} {...spec} />;
          
          // ─── Stat-strip row ──────────────
          if (spec.type === 'statStrip') {
            const { avgDaily, avgWeekly, avgMonthly } = spec.data as any;
            return (
              <View key={spec.testID} style={styles.statsRow}>
                {[
                  ['day', avgDaily],
                  ['week', avgWeekly],
                  ['month', avgMonthly],
                ].map(([lbl, val]) => (
                  <View key={lbl} style={styles.statCard}>
                    <Text style={styles.statValue}>{val.toFixed(1)}</Text>
                    <Text style={styles.statLabel}>{`/ ${lbl}`}</Text>
                  </View>
                ))}
              </View>
            )
          }

          // ─── Donut chart ─────────
          if (spec.type === 'donut') {
            return <ChartCard key={spec.testID} {...(spec as any)} />
          }

          // ─── Marker-timeline ────────────
          if (spec.type === 'markerTimeline') {
            return <ChartCard key={spec.testID} {...(spec as any)} />
          }

          // ─── Callout text ───────
          if (spec.type === 'callout') {
            return (
              <Text key={spec.testID} style={styles.calloutText}>
                {spec.data}
              </Text>
            )
          }

          // our special swipeable wrapper for the gauge
          if (spec.testID === 'chart-gauge') {
            return (
              <View
                key="swipe-gauge"
                {...panResponder.panHandlers}
                style={{ position: 'relative', marginVertical: 16 }}
              >
                {/* left arrow hint */}
                <Icon
                  name="chevron-left"
                  size={24}
                  color="rgba(255,255,255,0.5)"
                  style={[styles.arrow, { left: 8 }]}
                />
                {card}
                {/* right arrow hint */}
                <Icon
                  name="chevron-right"
                  size={24}
                  color="rgba(255,255,255,0.5)"
                  style={[styles.arrow, { right: 8 }]}
                />
              </View>
            )
          }

          // 7-day area  others remain as before
          if (spec.testID === 'chart-7day') {
            return (
              <React.Fragment key={spec.testID}>
                {card}
                {/* filter pills for total/night/nap */}
                <View style={styles.filterRow}>
                  {(['total','night','nap'] as const).map(option => {
                    const labels = {
                      total: 'Total sleep',
                      night: 'Night sleep',
                      nap:   'Nap sleep',
                    } as Record<typeof option, string>
                    const active = sleepFilter === option
                    return (
                      <TouchableOpacity
                        key={option}
                        onPress={() => setSleepFilter(option)}
                        style={[
                          styles.filterButton,
                          active && { backgroundColor: theme.colors.primary },
                        ]}
                      >
                        <Text
                          style={[
                            styles.filterText,
                            active && styles.filterTextActive,
                          ]}
                        >
                          {labels[option]}
                        </Text>
                      </TouchableOpacity>
                    )
                  })}
                </View>
              </React.Fragment>
            );
          }
          return card;
        })}
      </ScrollView>
      {/* DATE-RANGE BOTTOM-SHEET (presets + calendar) */}
      <Modal
        visible={showDateModal}
        animationType="slide"
        transparent
        onRequestClose={() => setShowDateModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            {/* presets */}
            <View style={styles.presetsRow}>
              {['Last 24h','7 days','30 days','Custom'].map(label => (
                <TouchableOpacity
                  key={label}
                  style={styles.presetButton}
                  onPress={() => {
                    if (label === 'Custom') return;
                    applyPreset(label);
                    setShowDateModal(false);
                  }}
                >
                  <Text style={styles.presetText}>{label}</Text>
                </TouchableOpacity>
              ))}
            </View>

            {/* calendar grid */}
            <CalendarGrid
              year={pickerYear}
              month={pickerMonth}
              // annotate that `range` has start & end properties
              onSelectDate={(range: { start: Date; end: Date }) => {
                setRangeStart(range.start);
                setRangeEnd(range.end);
                setShowDateModal(false);
              }}
            />
          </View>
        </View>
      </Modal>
    </CareLayout>
  )
}

export default InsightsScreen

const styles = StyleSheet.create({
  screen:           { flex: 1 },

  container:        { flex: 1 },
  content:          { paddingBottom: 16, paddingTop: 16 },

  card:             { margin: 16, padding: 12, borderRadius: 12 },
  cardTitle:        { fontSize: 16, fontWeight: '600', marginBottom: 8, color: '#FFF' },
  chart:            { flex: 1, aspectRatio: 1.8, marginHorizontal: 16 },
  axisRow:          { flexDirection: 'row', justifyContent: 'space-between', marginTop: 4 },
  axisLabel:        { fontSize: 10, color: '#FFF' },

  /** Header moved up by 50px **/
  headerContainer:  {
    paddingHorizontal: SPACING.gutter,
    paddingBottom:    SPACING.small,
    alignItems:       'center',
  },
  heading:          {
    fontSize:   20,
    fontWeight: '700',
    color:      '#FFF',
    marginBottom: 4,
  },
  subheading:       {
    fontSize: 14,
    color:    '#DDD',
    textAlign: 'center',
  },

  /** Date‐range & period selector **/
  selectorRow:      {
    flexDirection:  'row',
    alignItems:     'center',
    paddingHorizontal: 16,
    marginTop:      12,
    marginBottom:   8,
  },
  selectorCell:     { flex: 1, justifyContent: 'center' },
  selectorText:     { fontSize: 14, color: '#FFF' },
  separator:        {
    width: 1,
    height: 24,
    backgroundColor: '#555',
    marginHorizontal: 12,
  },
  periodButton:     {
    paddingHorizontal: 8,
    paddingVertical:   4,
    borderRadius:      4,
  },
  periodButtonActive:{},               // color applied inline
  periodText:       { fontSize: 12, color: '#FFF' },
  periodTextActive: { fontWeight: '700' },

  /** New: horizontal log‐type picker **/
  logTypeRow:       {
    paddingHorizontal: 16,
    paddingVertical:   8,
  },
  logTypeButton:    {
    height: 32,
    marginRight: 12,
    paddingVertical:   6,
    paddingHorizontal: 12,
    borderRadius:      20,
    backgroundColor:   'rgba(255,255,255,0.2)',
  },
  logTypeButtonActive: {
    backgroundColor:   '#FFF',
  },
  logTypeText:      {
    fontSize: 12,
    color:    '#DDD',
  },
  logTypeTextActive:{
    color:    '#000',
    fontWeight:'600',
  },
  outerScroll: {
    flex: 1,               // take up all available space
  },
  outerContent: {
    paddingBottom: 16,     // keep a bit of bottom padding
  },
  chartContainer: {
    width: '100%',
    paddingVertical: 8,
  },
  filterRow: {
        flexDirection:  'row',
        justifyContent: 'center',
        marginBottom:   8,
      },
  filterButton: {
        marginHorizontal: 8,
        paddingHorizontal: 12,
        paddingVertical:   6,
        borderRadius:      16,
        backgroundColor:   'rgba(255,255,255,0.15)',
      },
      filterText: {
        color: '#FFF',
        fontSize: 12,
      },
      filterTextActive: {
        fontWeight: '600',
    },
    modalOverlay: {
      flex:           1,
      backgroundColor:'rgba(0,0,0,0.5)',
      justifyContent: 'flex-end',
    },
    modalContent: {
      backgroundColor:'#fff',
      padding:         16,
      borderTopLeftRadius: 12,
      borderTopRightRadius:12,
    },
    // top‐row segmented & date-range
segmentedControl: {
  flexDirection: 'row',
  backgroundColor: 'rgba(255,255,255,0.1)',
  borderRadius:  20,
  overflow:      'hidden',
},
segment: {
  flex:     1,
  padding:  6,
  alignItems:'center',
},
segmentActive: {
  backgroundColor: '#FFF',
},
segmentText: {
  fontSize:12,
  color:    '#DDD',
},
segmentTextActive: {
  color:    '#000',
  fontWeight:'600',
},
dateRangeButton: {
  marginLeft:     12,
  paddingHorizontal:12,
  paddingVertical:  6,
  borderRadius:     16,
  backgroundColor:  'rgba(255,255,255,0.15)',
},

// bottom-sheet
presetsRow: {
  flexDirection:    'row',
  justifyContent:   'space-around',
  marginBottom:     12,
},
presetButton: {
  paddingHorizontal:8,
  paddingVertical:  4,
  borderRadius:     12,
  backgroundColor:  'rgba(0,0,0,0.05)',
},
presetText: {
  fontSize: 12,
},
arrow: {
  position:  'absolute',
  top:       '50%',
  marginTop: -12,
  zIndex:    10,
},

statsRow: {
  flexDirection: 'row',
  justifyContent: 'space-around',
  marginVertical: 8,
},
statCard: {
  alignItems: 'center',
  padding: 8,
  backgroundColor: 'rgba(255,255,255,0.1)',
  borderRadius: 8,
},
statValue: {
  fontSize: 20,
  fontWeight: '700',
  color: '#FFF',
},
statLabel: {
  fontSize: 12,
  color: '#DDD',
},
calloutText: {
  marginHorizontal: 16,
  marginVertical: 8,
  color: '#FFD54F',
  fontStyle: 'italic',
},
})
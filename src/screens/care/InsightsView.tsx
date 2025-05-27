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

import { RootStackParamList } from '../../navigation/AppNavigator'
import CareLayout from '../../components/carescreen/CareLayout'
import { MiniTab } from '../../components/carescreen/MiniNavBar'
import CalendarGrid from '../../components/common/CalendarGrid'

import { useInsightsData } from '../../hooks/useInsightsData'
import { ChartCard, ChartSpec } from '../../components/carescreen/ChartCard'
import { useChartSpecs } from '../../hooks/useChartSpecs'

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

/*   const timelineSegments = sleepSegments.map(seg => ({
    from: seg.startFraction,
    to:   seg.endFraction,
    color: seg.color,
  })) */

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

  // ── new ── pull in the precomputed specs
  const chartSpecs = useChartSpecs(
    period,
    sleepFilter,
    periodOffset,
    showLast24h
  )

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
        {chartSpecs[logType].map((spec: ChartSpec) => {
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
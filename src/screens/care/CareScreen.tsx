// src/screens/CareScreen.tsx
import React, { useCallback, useState } from 'react'
import {
  View,
  StyleSheet,
  LayoutChangeEvent,
  Text,
  TouchableOpacity,
  Dimensions
} from 'react-native'
import { useNavigation } from '@react-navigation/native'
import { StackNavigationProp } from '@react-navigation/stack'
import { useTheme } from 'styled-components/native'
import { RootStackParamList } from '../../navigation/AppNavigator'

import CareLayout from '../../components/carescreen/CareLayout'
import { MiniTab } from '../../components/carescreen/MiniNavBar'
import { useTrackerData } from '../../hooks/useTrackerData'
import TrackerFilter from '../../components/carescreen/TrackerFilter'
import CategoryRing from '../../components/carescreen/CategoryRing'
import OutterRim from '../../assets/carescreen/tracker-rings/OutterRim'

import FillNextDayLogsIcon from '../../assets/carescreen/common/FillNextDayLogsIcon'
import ClearLogs from '../../assets/carescreen/common/ClearLogs'
import ShareIcon from '../../assets/carescreen/common/ShareIcon'

type CareNavProp = StackNavigationProp<RootStackParamList, 'Care'>

const RING_SIZE = Dimensions.get('window').width * 0.9
const RING_THICKNESS = 30
const GAP = 4
const CLOCK_STROKE_WIDTH = 10
const CLOCK_STROKE_EXTRA = CLOCK_STROKE_WIDTH / 2

const CareScreen: React.FC = () => {
  const navigation = useNavigation<CareNavProp>()
  const theme = useTheme()

  // Show last 24h vs today
  const [showLast24h, setShowLast24h] = useState(false)
  // Example “isGenerating” flag (for any future‐generation button)
  const [isGenerating, setIsGenerating] = useState(false)

  // Pull hourlyCategories and nowFrac from our custom hook
  const { hourlyCategories, nowFrac } = useTrackerData(showLast24h)

  // Build boolean masks for each category ring
  const sleepMask: boolean[] = Array(24).fill(false)
  const feedDiaperMask: boolean[] = Array(24).fill(false)
  const showerEssMask: boolean[] = Array(24).fill(false)

  for (let h = 0; h < 24; h++) {
    switch (hourlyCategories[h]) {
      case 'sleep':
        sleepMask[h] = true
        break
      case 'feedDiaper':
        feedDiaperMask[h] = true
        break
      case 'showerEss':
        showerEssMask[h] = true
        break
      default:
        // any other hour is “awake/play”
        break
    }
  }

  // Toggle between “last 24h” and “today”
  const handleToggleFilter = useCallback(() => {
    setShowLast24h((v) => !v)
  }, [])

  // Bottom‐tab navigation handler
  const handleNavigate = (tab: MiniTab) => {
    if (tab === 'cards') navigation.navigate('PastLogs')
    else if (tab === 'tracker') return // already here
    else if (tab === 'graph') navigation.navigate('Insights')
    else if (tab === 'future') navigation.navigate('InferredLogs')
  }

  // Log container heights (if needed)
  const logLayout = (name: string) => (e: LayoutChangeEvent) => {
    console.log(`${name} row height:`, e.nativeEvent.layout.height)
  }

  // Render the four “00:00 / 06:00 / 12:00 / 18:00” labels
  const renderTimeLabels = () => {
    // Total wrapper size = RING_SIZE + 2 * CLOCK_STROKE_EXTRA
    const wrapperSize = RING_SIZE + CLOCK_STROKE_EXTRA * 2
    const center = wrapperSize / 2

    // Compute “empty circle” radius inside the innermost ring:
    const emptyRadius =
      RING_SIZE / 2.5 - (RING_THICKNESS + GAP) * 2 - RING_THICKNESS / 2

    // Polar → Cartesian helper
    const toCartesian = (angleDeg: number, radius: number) => {
      const angleRad = (angleDeg - 90) * (Math.PI / 180)
      return {
        x: center + radius * Math.cos(angleRad),
        y: center + radius * Math.sin(angleRad),
      }
    }

    // Place labels at hours 0, 6, 12, 18
    const labels = [
      { text: '00:00', idx: 0 },
      { text: '06:00', idx: 6 },
      { text: '12:00', idx: 12 },
      { text: '18:00', idx: 18 },
    ]

    return labels.map(({ text, idx }) => {
      const angleDeg = idx * (360 / 24) // 15° × idx
      const { x, y } = toCartesian(angleDeg, emptyRadius)
      return (
        <Text
          key={text}
          style={[
            styles.timeLabel,
            {
              left: x - 16, // offset by half of label width (32px)
              top: y - 8,   // offset by half of label height (16px)
            },
          ]}
        >
          {text}
        </Text>
      )
    })
  }

  // Example handlers for the three icons (Clear, Fill, Share)
  // Currently, they log to console or toggle a flag.
  const handleClearAll = () => {
    console.log('Clear‐all icon pressed')
    // TODO: implement logic (if still needed) or remove
  }

  const handleFillNextDay = () => {
    console.log('Fill Next‐Day icon pressed')
    setIsGenerating(true)
    // TODO: trigger AI/rule‐based generation if still desired
    setTimeout(() => setIsGenerating(false), 1000)
  }

  const handleShare = () => {
    console.log('Share icon pressed')
    navigation.navigate('EndOfDayExport')
  }

  return (
    <CareLayout activeTab="tracker" onNavigate={handleNavigate} bgColor={theme.colors.accent}>
      {/* ── 1. Icons section (flex:1) ─────────────────────────── */}
      <View style={styles.buttonsContainer}>
        <TouchableOpacity onPress={handleClearAll} style={styles.iconWrapper}>
          <ClearLogs width={50} height={50} fill="#D0021B" />
        </TouchableOpacity>

        <TouchableOpacity
          onPress={handleFillNextDay}
          disabled={isGenerating}
          style={styles.iconWrapper}
        >
          <FillNextDayLogsIcon width={50} height={50} fill="#50E3C2" />
        </TouchableOpacity>

        <TouchableOpacity onPress={handleShare} style={styles.iconWrapper}>
          <ShareIcon width={75} height={75} fill="#453F4E" />
        </TouchableOpacity>
      </View>

      {/* ── 2. Tracker section (flex:4) ───────────────────────── */}
      <View style={styles.trackerContainer}>
        <View style={styles.ringWrapper}>

          {/* ───── 1) sleep / awake (outermost) ───── */}
          <View
            style={{
              position: 'absolute',
              width: RING_SIZE,
              height: RING_SIZE,
              top: CLOCK_STROKE_EXTRA,
              left: CLOCK_STROKE_EXTRA,
            }}
          >
            {/* 
              1a) Awake ring (warm yellow) 
              → wrap in an absolute child so it sits at (0,0) inside this parent 
            */}
            <View style={{ position: 'absolute', top: 0, left: 0 }}>
              <CategoryRing
                size={RING_SIZE}
                strokeWidth={RING_THICKNESS}
                mask={sleepMask.map(isSleep => !isSleep)}
                fillColor="#FFD54F"                 // warm yellow for awake
                separatorColor="rgba(0,0,0,0.1)"
                testID="awake-ring"
              />
            </View>

            {/* 
              1b) Sleep ring (light blue) 
              → also wrapped absolutely so it perfectly overlaps the awake‐ring beneath 
            */}
            <View style={{ position: 'absolute', top: 0, left: 0 }}>
              <CategoryRing
                size={RING_SIZE}
                strokeWidth={RING_THICKNESS}
                mask={sleepMask}
                fillColor="#A3B1E0"                 // light blue for sleep
                separatorColor="rgba(0,0,0,0.1)"
                testID="sleep-ring"
              />
            </View>
          </View>

          {/* ───── 2) feed/diaper ring (middle) ───── */}
          <View
            style={{
              position: 'absolute',
              width: RING_SIZE - 2 * (RING_THICKNESS + GAP),
              height: RING_SIZE - 2 * (RING_THICKNESS + GAP),
              top: CLOCK_STROKE_EXTRA + (RING_THICKNESS + GAP),
              left: CLOCK_STROKE_EXTRA + (RING_THICKNESS + GAP),
            }}
          >
            <CategoryRing
              size={RING_SIZE - 2 * (RING_THICKNESS + GAP)}
              strokeWidth={RING_THICKNESS}
              mask={feedDiaperMask}
              fillColor="#FFE0B2"
              separatorColor="rgba(0,0,0,0.1)"
              testID="feed-ring"
            />
          </View>

          {/* ───── 3) essentials ring (inner) ───── */}
          <View
            style={{
              position: 'absolute',
              width: RING_SIZE - 4 * (RING_THICKNESS + GAP),
              height: RING_SIZE - 4 * (RING_THICKNESS + GAP),
              top: CLOCK_STROKE_EXTRA + 2 * (RING_THICKNESS + GAP),
              left: CLOCK_STROKE_EXTRA + 2 * (RING_THICKNESS + GAP),
            }}
          >
            <CategoryRing
              size={RING_SIZE - 4 * (RING_THICKNESS + GAP)}
              strokeWidth={RING_THICKNESS}
              mask={showerEssMask}
              fillColor="#F0F4C3"
              separatorColor="rgba(0,0,0,0.1)"
              testID="essentials-ring"
            />
          </View>

          {/* ───── 4) current‐time arc ───── */}
          <View style={styles.arcAbsolute}>
            <OutterRim
              size={RING_SIZE + CLOCK_STROKE_EXTRA * 2}
              strokeWidth={CLOCK_STROKE_WIDTH}
              color="#FFFFFF"
              progress={nowFrac}
              testID="time-arc"
            />
          </View>
        </View>

        {/* …time‐of‐day labels, etc. */}
        <View style={styles.labelsWrapper}>
          {renderTimeLabels()}
        </View>
      </View>


      {/* ── 3. Filter section (flex:1) ──────────────────────────── */}
      <View style={styles.filterContainer} onLayout={logLayout('Filter')}>
        <TrackerFilter showLast24h={showLast24h} onToggle={handleToggleFilter} />
      </View>
    </CareLayout>
  )
}

export default CareScreen

const styles = StyleSheet.create({
  screen: { flex: 1 },

  // Icons section (flex:1)
  buttonsContainer: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    marginHorizontal: 16,
  },
  iconWrapper: {
    marginHorizontal: 12,
  },

  // Tracker section (flex:4)
  trackerContainer: {
    flex: 4,
    justifyContent: 'center',
    alignItems: 'center',
  },
  ringWrapper: {
    width: RING_SIZE + CLOCK_STROKE_EXTRA * 2,
    height: RING_SIZE + CLOCK_STROKE_EXTRA * 2,
  },
  arcAbsolute: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
  },

  // Time‐of‐day labels (positioned inside trackerContainer)
  labelsWrapper: {
    position: 'absolute',
    width: RING_SIZE + CLOCK_STROKE_EXTRA * 2,
    height: RING_SIZE + CLOCK_STROKE_EXTRA * 2,
    justifyContent: 'center',
    alignItems: 'center',
  },
  timeLabel: {
    position: 'absolute',
    fontSize: 12,
    color: 'rgba(0,0,0,0.6)',
    width: 32,
    textAlign: 'center',
  },

  // Filter section (flex:1)
  filterContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
})

//src/screens/InsightsView.tsx (graphs)
import React, { useState } from 'react'
import { 
  View,
  Text, 
  StyleSheet, 
  ScrollView, 
  TouchableOpacity } from 'react-native'
import { useNavigation } from '@react-navigation/native'
import { StackNavigationProp } from '@react-navigation/stack'
import { useTheme } from 'styled-components/native'
import { RootStackParamList } from '../navigation/AppNavigator'
import CareLayout from 'components/carescreen/CareLayout'
import { MiniTab } from 'components/carescreen/MiniNavBar'

import { LineChart, BarChart, Grid } from 'react-native-svg-charts'
import { useInsightsData } from '../hooks/useInsightsData'

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
  'Night Time Sleep',
  'Feedings',
  'Diaper Changes',
] as const
type LogType = typeof logTypes[number]

const InsightsScreen: React.FC = () => {
  const navigation = useNavigation<InsightsNavProp>()
  const theme = useTheme()

  const [showLast24h, setShowLast24h] = useState(false)
  const { byDate } = useInsightsData(showLast24h)
  const [period, setPeriod] = useState<'Daily'|'Weekly'|'Monthly'>('Weekly')
  const [logType, setLogType] = useState<LogType>('Sleep Summary')

  const dates = byDate.map(d => d.date.slice(5))
  const totalSleep = byDate.map(d => d.napMinutes + d.nightMinutes)

  const handleNavigate = (tab: MiniTab) => {
    if (tab === 'graph') return
    if (tab === 'tracker') navigation.navigate('Care')
    if (tab === 'cards')   navigation.navigate('PastLogs')
  }

  const renderLogTypeCharts = () => {
    switch (logType) {
      case 'Sleep Summary':
        return (
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Total Sleep (min)</Text>
            <LineChart
              style={styles.chart}
              data={totalSleep}
              svg={{ stroke: theme.colors.primary }}
              contentInset={{ top: 20, bottom: 20 }}
            >
              <Grid />
            </LineChart>
            <View style={styles.axisRow}>
              {dates.map((d, i) => (
                <Text key={i} style={styles.axisLabel}>{d}</Text>
              ))}
            </View>
          </View>
        )

      case 'Naps':
      return (
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Naps (min)</Text>
          <BarChart
            style={styles.chart}
            data={byDate.map(d => d.napMinutes)}
            svg={{ fill: theme.colors.accent }}
            contentInset={{ top: 20, bottom: 20 }}
          >
            <Grid/>
          </BarChart>
        </View>
      );

      case 'Awake Time':
      return (
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Awake (min)</Text>
          <LineChart
            style={styles.chart}
            data={byDate.map(d => d.awakeMinutes)}
            svg={{ stroke: theme.colors.accent }}
            contentInset={{ top: 20, bottom: 20 }}
          >
            <Grid/>
          </LineChart>
        </View>
      );

        case 'Night Time Sleep':
          return (
            <View style={styles.card}>
              <Text style={styles.cardTitle}>Night Sleep (min)</Text>
              <BarChart
                style={styles.chart}
                data={byDate.map(d => d.nightMinutes)}
                svg={{ fill: theme.colors.secondaryBackground }}
                contentInset={{ top: 20, bottom: 20 }}
              >
                <Grid/>
              </BarChart>
            </View>
          );

          case 'Feedings':
            return (
              <View style={styles.card}>
                <Text style={styles.cardTitle}>Feedings</Text>
                <BarChart
                  style={styles.chart}
                  data={byDate.map(d => d.feeding)}
                  svg={{ fill: theme.colors.secondaryBackground }}
                  contentInset={{ top: 20, bottom: 20 }}
                >
                  <Grid/>
                </BarChart>
              </View>
            );

            case 'Diaper Changes':
              return (
                <View style={styles.card}>
                  <Text style={styles.cardTitle}>Diaper Changes</Text>
                  <BarChart
                    style={styles.chart}
                    data={byDate.map(d => d.diaper)}
                    svg={{ fill: theme.colors.accent }}
                    contentInset={{ top: 20, bottom: 20 }}
                  >
                    <Grid/>
                  </BarChart>
                </View>
              );

      default:
        return null
    }
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

        {/* 2) Date‐range & period selector */}
        <View style={styles.selectorRow}>
          <TouchableOpacity style={styles.selectorCell}>
            <Text style={styles.selectorText}>Last 7 days ▾</Text>
          </TouchableOpacity>
          <View style={styles.separator} />
          <View style={styles.selectorCell}>
            {['Daily','Weekly','Monthly'].map(p => (
              <TouchableOpacity
                key={p}
                onPress={() => setPeriod(p as any)}
                style={[
                  styles.periodButton,
                  period === p && styles.periodButtonActive,
                ]}
              >
                <Text
                  style={[
                    styles.periodText,
                    period === p && styles.periodTextActive,
                  ]}
                >
                  {p}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
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
        {renderLogTypeCharts()}
      </ScrollView>
    </CareLayout>
  )
}

export default InsightsScreen

const styles = StyleSheet.create({
  screen:           { flex: 1 },

  container:        { flex: 1 },
  content:          { paddingBottom: 16, paddingTop: 16, marginTop: 50 },

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
  }
})
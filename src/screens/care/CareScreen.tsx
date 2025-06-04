// src/screens/CareScreen.tsx
import React, { useCallback, useState, useEffect } from 'react'
import {
  View,
  StyleSheet,
  LayoutChangeEvent,
  Text as NativeText,
  Text,
} from 'react-native'
import { useNavigation } from '@react-navigation/native'
import { StackNavigationProp } from '@react-navigation/stack'
import { useTheme } from 'styled-components/native'
import { RootStackParamList } from '../../navigation/AppNavigator'
import styled from 'styled-components/native'
import { DefaultTheme } from 'styled-components/native';

import CareLayout from '../../components/carescreen/CareLayout'
import MiniNavBar, { MiniTab } from '../../components/carescreen/MiniNavBar'
import Tracker, { QuickMarker } from '../../components/carescreen/Tracker'
import { colorMap } from '../../hooks/useTrackerData'
import TrackerFilter from '../../components/carescreen/TrackerFilter'
import QuickLogMenu from '../../components/carescreen/QuickLogMenu'
import LogDetailModal from '../../components/carescreen/LogDetailModal'
import QuickLogButton from '../../components/carescreen/QuickLogButton'
import WhisprVoiceButton from '../../components/whispr/WhisprVoiceButton'
import EndOfDayExport from './EndOfDayExportScreen'
import Button from '../../components/common/Button'

import { 
  getLogsBetween, 
  getFutureEntries, 
  saveFutureEntries, 
  deleteLogEntry
} from '../../services/QuickLogAccess'
import { QuickLogEntry } from '../../models/QuickLogSchema'
import { quickLogEmitter } from '../../storage/QuickLogEvents';
import { generateAIQuickLogs } from '../../services/LlamaLogGenerator'

type CareNavProp = StackNavigationProp<RootStackParamList, 'Care'>

// Replace common/Button with a styled wrapper for centering and wrapping text
const ShareButton = styled.TouchableOpacity`
  background-color: ${({ theme }: { theme: DefaultTheme }) => theme.colors.secondaryBackground};
  padding-vertical: ${({ theme }: { theme: DefaultTheme }) => theme.spacing.medium}px;
  padding-horizontal: ${({ theme }: { theme: DefaultTheme }) => theme.spacing.large}px;
  border-radius: 8px;
  align-self: center;
  margin-bottom: ${({ theme }: { theme: DefaultTheme }) => theme.spacing.medium}px;
`
const ShareLabel = styled.Text`
  color: ${({ theme }: { theme: DefaultTheme }) => theme.colors.background};
  font-size: 16px;
  text-align: center;
  flex-wrap: wrap;
`

const CareScreen: React.FC = () => {
  const navigation = useNavigation<CareNavProp>()
  const theme = useTheme()

  const [quickLogMarkers, setQuickLogMarkers] = useState<QuickMarker[]>([])
  const [quickLogEntries, setQuickLogEntries] = useState<QuickLogEntry[]>([])
  const [selectedLog, setSelectedLog] = useState<QuickLogEntry | null>(null)
  const [futureEntries, setFutureEntries] = useState<QuickLogEntry[]>([])
  const [showLast24h, setShowLast24h] = useState(false)
  const [isQuickLogOpen, setQuickLogOpen] = useState(false)

  useEffect(() => {
    const now = new Date()
    const start = showLast24h
      ? new Date(now.getTime() - 24*60*60*1000)
      : new Date(now.getFullYear(), now.getMonth(), now.getDate())
    getLogsBetween(start.toISOString(), now.toISOString())
      .then(entries => {
        setQuickLogEntries(entries)
        const seededMarkers = entries
        .filter(e => e.type !== 'sleep')
        .map(e => {
          // always use the timestamp field—even for 'sleep'
          const t = new Date(e.timestamp)
          const fraction =
            (t.getHours()*60 + t.getMinutes() + t.getSeconds()/60) / 1440
                 return { id: e.id, fraction, color: colorMap[e.type], type: e.type }
        })
        setQuickLogMarkers(seededMarkers)
      })
      .catch(err => console.error('[CareScreen] fetch logs:', err))
  }, [showLast24h])

  const handleLogged = useCallback((entry: QuickLogEntry) => {
    try {
      if (entry.type !== 'sleep') {
      const t = new Date(entry.timestamp)
      const fraction =
        (t.getHours() * 60 + t.getMinutes() + t.getSeconds() / 60) / 1440;
      setQuickLogMarkers(existing =>
        existing.some(m => m.id === entry.id)
          ? existing
          : [...existing, { id: entry.id, fraction, color: colorMap[entry.type], type: entry.type }]
      );
    }
      setQuickLogEntries(existing => [entry, ...existing]);
    } catch (err) {
      console.error('[CareScreen] handleLogged error:', err)
    }
  }, [])

  useEffect(() => {
    const onSaved = (entry: QuickLogEntry) => handleLogged(entry)
    quickLogEmitter.on('saved', onSaved)
    return () => {
      quickLogEmitter.off('saved', onSaved)
    }
  }, [handleLogged])

  const handleMarkerPress = useCallback(
    (id: string) => {
      const entry = quickLogEntries.find(e => e.id === id)
      if (entry) setSelectedLog(entry)
    },
    [quickLogEntries]
  )

  useEffect(() => {
    getFutureEntries().then(setFutureEntries).catch(console.error);
    const handler = (entry: QuickLogEntry) =>
      setFutureEntries((f) => [...f, entry]);
    quickLogEmitter.on('future-saved', handler);
    return () => {
      quickLogEmitter.off('future-saved', handler);
    };
  }, []);

  const handleSegmentPress = useCallback((id: string) => {}, [])
  const handleToggleFilter = useCallback(() => setShowLast24h(v => !v), [])

  const handleDeleteLog = useCallback(async (id: string) => {
    try {
      await deleteLogEntry({ id } as QuickLogEntry);
      setQuickLogEntries(prev => prev.filter(e => e.id !== id));
      setQuickLogMarkers(prev => prev.filter(m => m.id !== id));
      setSelectedLog(null);
    } catch (err) {
      console.error('[CareScreen] deleteLog error:', err);
    }
  }, []);

  function handleGenerateFuture(hoursAhead: number) {
    const now = new Date()
    const start = new Date(now.getTime() - (showLast24h ? 24 : now.getHours() * 60 + now.getMinutes()) * 60 * 1000)
    getLogsBetween(start.toISOString(), now.toISOString())
      .then((recent) => generateAIQuickLogs(recent, hoursAhead))
      .then((suggestions: QuickLogEntry[]) => saveFutureEntries(suggestions))
      .then(() => navigation.navigate('Care'))
      .catch(err => console.error('[CareScreen] future-logs generation error:', err))
  }

  const handleNavigate = (tab: MiniTab) => {
    if (tab === 'cards') navigation.navigate('PastLogs');
    else if (tab === 'tracker') return;     // already on Care
    else if (tab === 'graph') navigation.navigate('Insights');
    else if (tab === 'future') navigation.navigate('InferredLogs');
  };

  const logLayout = (name: string) => (e: LayoutChangeEvent) => {
    console.log(`${name} row height:`, e.nativeEvent.layout.height)
  }

  return (
    <CareLayout activeTab="tracker" onNavigate={handleNavigate} bgColor={theme.colors.accent}>
      <View style={{ borderRadius: 25 }}>
       <ShareButton onPress={() => navigation.navigate('EndOfDayExport')}>
        <ShareLabel>
          Share Today’s Logs
        </ShareLabel>
       </ShareButton>
      </View>
      <Tracker
        quickMarkers={quickLogMarkers}
        onMarkerPress={handleMarkerPress}
        onSegmentPress={handleSegmentPress}
        showLast24h={showLast24h}
        onLayout={logLayout('Tracker')}
      />
      <View style={[styles.row, { flex: 1 }]} onLayout={logLayout('Filter')}>
        <TrackerFilter showLast24h={showLast24h} onToggle={handleToggleFilter} />
      </View>

      <View style={styles.actionButtonsContainer}>
        <QuickLogButton onPress={() => setQuickLogOpen(true)} />
        <WhisprVoiceButton />
      </View>

      <QuickLogMenu visible={isQuickLogOpen} onClose={() => setQuickLogOpen(false)} />

      <LogDetailModal
        visible={!!selectedLog}
        entry={selectedLog!}
        onClose={() => setSelectedLog(null)}
        onDelete={handleDeleteLog}
      />
    </CareLayout>
  )
}

export default CareScreen

const styles = StyleSheet.create({
  screen: { flex: 1 },
  row: {
    width: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  actionButtonsContainer: {
    position: 'absolute',
    bottom: 50,
    left: 150,
    right: 0,
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 20,
  },
})

// src/components/carescreen/CareLayout.tsx
import React, { useState, useEffect, useCallback } from 'react'
import { SafeAreaView, View, StyleSheet } from 'react-native'
import { useTheme } from 'styled-components/native'
import TopNav from '../common/TopNav'
import MiniNavBar, { MiniTab } from '../carescreen/MiniNavBar'
import BottomNav from '../common/BottomNav'
import { useNavigation } from '@react-navigation/native'
import { StackNavigationProp } from '@react-navigation/stack'
import { RootStackParamList } from '../../navigation/AppNavigator'
import { LogEntry } from '../../models/LogSchema'
import {LogRepository} from '../../storage/LogRepository'

type CareNavProp = StackNavigationProp<RootStackParamList, 'Care'>

interface Props {
  activeTab: MiniTab
  onNavigate: (tab: MiniTab) => void
  children: React.ReactNode
  bgColor?: string
}

export default function CareLayout({ activeTab, onNavigate, children, bgColor }: Props) {
    const navigation = useNavigation<CareNavProp>()
    const theme = useTheme()
    const [LogEntries, setLogEntries] = useState<LogEntry[]>([])

  // fetch the last 24h / today’s logs
  useEffect(() => {
    const now = new Date()
    const start = new Date(
      Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate(), 0, 0, 0)
    )
    LogRepository.getEntriesBetween(start.toISOString(), now.toISOString())
      .then(setLogEntries)
      .catch(console.error)
  }, [])

  const handleNewAiLog = useCallback((raw: string) => {
    try {
      const entries = JSON.parse(raw) as LogEntry[]
      entries.forEach(entry => setLogEntries(e => [entry, ...e]))
    } catch (err) {
      console.error('[CareLayout] invalid AI JSON:', err)
    }
  }, [])

  const handleLogged = useCallback((entry: LogEntry) => {
    setLogEntries(e => [entry, ...e])
  }, [])

  return (
    <SafeAreaView style={[styles.screen, 
    { backgroundColor: bgColor ?? theme.colors.background }]}>
      <View style={styles.top}><TopNav navigation={navigation} /></View>
      <View style={styles.nav}><MiniNavBar activeTab={activeTab} onNavigate={onNavigate} /></View>

      <View style={styles.body}>{children}</View>

      <View style={styles.bottom}><BottomNav navigation={navigation} activeScreen="Care" /></View>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  screen: { flex: 1 },
  top:    { flex: 1 },
  nav:    { flex: 1 },
  body:   { flex: 5 },
  actions:{ flex: 1 },
  bottom: { flex: 1 },
})

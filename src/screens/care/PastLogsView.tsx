// src/screens/PastLogsView.tsx
import React, { useEffect, useState, useCallback } from 'react'
import {
  View,
  Text,
  ScrollView,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
} from 'react-native'
import { useTheme } from 'styled-components/native'
import { QuickLogEntry } from '../../models/QuickLogSchema'
import { quickLogEmitter } from '../../storage/QuickLogEvents';
import { getLogsBetween, deleteLogEntry  } from '../../services/QuickLogAccess'
import CareLayout from 'components/carescreen/CareLayout'
import { MiniTab } from '../../components/carescreen/MiniNavBar'
import { StackNavigationProp } from '@react-navigation/stack'
import { useNavigation } from '@react-navigation/native'
import { RootStackParamList } from '../../navigation/AppNavigator'
import LogDetailModal from 'components/carescreen/LogDetailModal'
import { startOfToday } from 'date-fns';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window')
const CARD_WIDTH = SCREEN_WIDTH * 0.9
const CARD_HEIGHT = SCREEN_HEIGHT * 0.075

const categories = ['all','sleep','feeding','diaper','mood','health','note'] as const
type Category = typeof categories[number]
const borderColors: Record<Category,string> = {
  all:'#999', sleep:'#4A90E2', feeding:'#50E3C2',
  diaper:'#F5A623', mood:'#FFB400', health:'#F44336', note:'#2196F3',
}

type CardsNavProp = StackNavigationProp<RootStackParamList,'PastLogs'>

export default function PastLogsView() {
  const navigation = useNavigation<CardsNavProp>()
  const theme = useTheme()
  const [entries, setEntries] = useState<QuickLogEntry[]>([])
  const [selectedCategory, setSelectedCategory] = useState<Category>('all')
  const [selectedEntry, setSelectedEntry] = useState<QuickLogEntry | null>(null)

  // helper: relative‐day label
  const getDayLabel = (ts: string) => {
    const date = new Date(ts)
    const now = new Date()
    // midnight today
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())
    const diffMs = date.getTime() - today.getTime()
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24))
    if (diffDays === 0) return 'Today'
    if (diffDays === -1) return 'Yesterday'
    if (diffDays === 1) return 'Tomorrow'
    if (diffDays < 0) return `${-diffDays} days ago`
    if (diffDays > 0) return `In ${diffDays} days`
    return `In ${diffDays} days`
  }

  // fetch once
  // fetch & sort once
  useEffect(() => {
    getLogsBetween(
      new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
      new Date().toISOString()
    )
    .then((logs: QuickLogEntry[]) => {
      const sorted = [...logs].sort(
        (a: QuickLogEntry, b: QuickLogEntry) =>
          new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
      )
      setEntries(sorted)
    })
    .catch(console.error)
  }, [])

  // whenever any new entry is saved, prepend it into the list:
  useEffect(() => {
    const handler = (entry: QuickLogEntry) => {
      setEntries(es => [entry, ...es]);
    };
    quickLogEmitter.on('saved', handler);
    return () => {
      quickLogEmitter.off('saved', handler);
    };
  }, []);

  const filtered = selectedCategory==='all'
    ? entries
    : entries.filter(e=>e.type===selectedCategory)

  const renderCard = useCallback(
    ({item}:{item:QuickLogEntry})=>(
      <TouchableOpacity
        style={[styles.card,{borderColor:borderColors[item.type]}]}
        onPress={() => setSelectedEntry(item)}
      >
        <Text style={styles.type}>
          {item.type[0].toUpperCase()+item.type.slice(1)}
        </Text>
        {/* right: time + relative‐day */}
        <View style={styles.timeContainer}>
          <Text style={styles.timestamp}>
            {new Date(item.timestamp).toLocaleTimeString([], {
              hour: '2-digit',
              minute: '2-digit',
            })}
          </Text>
          <Text style={styles.dayLabel}>{getDayLabel(item.timestamp)}</Text>
        </View>
      </TouchableOpacity>
    ),[]
  )

  async function handleGenerateFuture(hoursAhead: number) {
    // 1) Grab recent logs & baby profile
    const recent = await getLogsBetween(past)
    const profile = await getBabyProfile(recent[0]?.babyId) 
  
    // 2) Ask your AI endpoint for recommendations
    const suggestions: QuickLogEntry[] = await generateAIQuickLogs(recent, profile, hoursAhead)
  
    // 3) Persist & emit them as “future” entries
    await saveFutureEntries(suggestions)
    // 4) Update your local state so the pills insert dashed strokes immediately
    setEntries(es => [...suggestions, ...es])
  }

  const handleNavigate = (tab: MiniTab) => {
    if (tab==='cards') return
    if (tab==='tracker') navigation.navigate('Care')
    if (tab==='graph')   navigation.navigate('Insights')
  }

  return (
    <CareLayout
      activeTab="cards"
      onNavigate={handleNavigate}
      bgColor={theme.colors.background}
    >
      {/* Cards list */}
      <FlatList
          data={filtered}
          keyExtractor={e=>e.id}
          renderItem={renderCard}
          contentContainerStyle={{ paddingVertical: 16 }}
          // 1. Slide all of your non-scrolling UI into ListHeaderComponent
          ListHeaderComponent={() => (
            <View>
              <View style={[styles.pillRow, { backgroundColor: theme.colors.background,}]}>
              <TouchableOpacity
                style={styles.pill}
                onPress={() => handleGenerateFuture(24)}
                >
                  <Text style={styles.pillText}>Fill next-day logs</Text>
                </TouchableOpacity>
                <TouchableOpacity
                style={styles.pill}
                onPress={() => handleGenerateFuture(168)}
                >
                  <Text style={styles.pillText}>Fill next-week logs</Text>
                </TouchableOpacity>
              </View>
              {/* LogType Filters */}
              <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.filterRow}
              >
              {categories.map(cat=>(
                <TouchableOpacity
                key={cat}
                style={[
                styles.filterButton,
                selectedCategory===cat && styles.filterButtonActive
                ]}
                onPress={()=>setSelectedCategory(cat)}
              >
              <Text style={
                selectedCategory===cat
                  ? styles.filterTextActive
                  : styles.filterText
              }>
                {cat.charAt(0).toUpperCase()+cat.slice(1)}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>
      )}
       // 2. Tell FlatList that header (index 0) should stick
      stickyHeaderIndices={[0]}
      // 3. Let the FlatList itself fill remaining space
      style={{ flex: 1 }}
      />  
      {/* Modal */}
      {selectedEntry && (
        <LogDetailModal
          entry={selectedEntry}
          visible={true}
          onClose={() => setSelectedEntry(null)}
          onDelete={(id: string) => {
            // 1. remove it locally
            setEntries(es => es.filter(e => e.id !== id));
            // 2. close the modal
            setSelectedEntry(null);
            // 3. call your backend deletion (if you have one)
            deleteLogEntry(id).catch(console.error);
          }}
        />
      )}
    </CareLayout>
  )
}

const styles = StyleSheet.create({
  filterRow: {
    paddingVertical: 6,
    paddingHorizontal: 16,
  },
  filterButton: {
    height: CARD_WIDTH * 0.085,
    paddingHorizontal: 12,
    paddingVertical: 6,
    marginRight: 8,
    borderRadius: 8,
    backgroundColor: '#eee',
  },
  filterButtonActive: { backgroundColor: '#aaa' },
  filterText: { color: '#333' },
  filterTextActive: { color: '#fff' },

  card: {
    width: CARD_WIDTH,
    height: CARD_HEIGHT,
    borderWidth: 2,
    borderRadius: 12,
    paddingHorizontal: 12,
    marginVertical: 8,
    alignSelf: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  type: { fontSize: 16, fontWeight: '600' },
  timestamp: { color: '#000' },
  timeContainer: { color: '#000', fontSize: 12, alignItems: 'flex-end', },
  dayLabel: { color: '#666', fontSize: 12, marginTop: 4 },
  pillRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    paddingVertical: 12
  },
  pill: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
    borderWidth: 1,      // pick your accent color
    marginHorizontal: 8,
  },
  pillText: {
    fontWeight: '600',
  },
})

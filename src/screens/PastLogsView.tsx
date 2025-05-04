import React, { useEffect, useState, useCallback } from 'react'
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
  ScrollView
} from 'react-native'
import { QuickLogEntry } from '../models/QuickLogSchema'
import { getLogsBetween } from '../services/QuickLogAccess'
import { generateAIQuickLogs } from '../services/LlamaLogGenerator'
import LogDetailModal from '../components/carescreen/LogDetailModal'

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window')
const CARD_WIDTH = SCREEN_WIDTH * 0.9
const CARD_HEIGHT = SCREEN_HEIGHT * 0.075

const categories = [
  'all',
  'sleep',
  'feeding',
  'diaper',
  'mood',
  'health',
  'note',
] as const
type Category = typeof categories[number]

// map category to border color
const borderColors: Record<Category, string> = {
  all: '#999',
  sleep: '#4A90E2',
  feeding: '#50E3C2',
  diaper: '#F5A623',
  mood: '#FFB400',
  health: '#F44336',
  note: '#2196F3',
}

export default function PastLogsView() {
  const [entries, setEntries] = useState<QuickLogEntry[]>([])
  const [aiEntries, setAiEntries] = useState<QuickLogEntry[]>([])
  const [selectedEntry, setSelectedEntry] = useState<QuickLogEntry | null>(null)
  const [loadingAI, setLoadingAI] = useState(false)
  const [selectedCategory, setSelectedCategory] = useState<Category>('all')

  const [start, end] = React.useMemo(() => {
    const end = new Date().toISOString()
    const start = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString()
    return [start, end] as const
  }, [])

  useEffect(() => {
    getLogsBetween(start, end)
      .then(setEntries)
      .catch(console.error)
  }, [start, end])

  const fetchAISuggestions = useCallback(async () => {
    setLoadingAI(true)
    try {
      const suggestions = await generateAIQuickLogs(entries, 24)
      setAiEntries(suggestions)
    } catch (err) {
      console.error('[PastLogsView] AI fetch failed:', err)
    } finally {
      setLoadingAI(false)
    }
  }, [entries])

  // filter by category
  const filteredEntries = selectedCategory === 'all'
    ? entries
    : entries.filter(e => e.type === selectedCategory)
  const filteredAiEntries = selectedCategory === 'all'
    ? aiEntries
    : aiEntries.filter(e => e.type === selectedCategory)

  const renderCard = ({ item }: { item: QuickLogEntry }) => (
    <TouchableOpacity
    onPress={() => setSelectedEntry(item)}
      style={[
        styles.card,
        { borderColor: borderColors[item.type]},
      ]}
    >
        <Text style={styles.type}>
          {item.type.charAt(0).toUpperCase() + item.type.slice(1)}
        </Text>      
        <Text style={styles.timestamp}>
          {new Date(item.timestamp).toLocaleTimeString([], { hour: '2-digit', minute:'2-digit' })}
        </Text>
    </TouchableOpacity>
  )

  return (
    <View style={styles.container}>
      {/* Category Filter */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.filterRow}
      >
        {categories.map(cat => (
          <TouchableOpacity
            key={cat}
            style={[
              styles.filterButton,
              selectedCategory === cat && styles.filterButtonActive,
            ]}
            onPress={() => setSelectedCategory(cat)}
          >
            <Text
              style={
                selectedCategory === cat
                  ? styles.filterTextActive
                  : styles.filterText
              }
            >
              {cat.charAt(0).toUpperCase() + cat.slice(1)}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Real logs */}
      <FlatList
        data={filteredEntries}
        keyExtractor={e => `real-${e.id}`}
        renderItem={renderCard}
        ListEmptyComponent={<Text style={styles.empty}>No logs yet.</Text>}
      />

      {/* AI logs button */}
      <TouchableOpacity
        accessibilityRole="button"
        style={styles.aiButton}
        onPress={fetchAISuggestions}
        disabled={loadingAI}
      >
        <Text style={styles.aiButtonText}>
          {loadingAI ? 'Generating...' : 'Generate AI-Suggested Logs'}
        </Text>
      </TouchableOpacity>

      {/* AI-suggested logs */}
      {filteredAiEntries.length > 0 && (
        <>
          <Text style={[styles.header, { marginTop: 16 }]}>AI Suggestions</Text>
          <FlatList
            data={filteredAiEntries}
            keyExtractor={e => `ai-${e.id}`}
            renderItem={renderCard}
          />
        </>
      )}
      {/* Log detail modal */}
      <LogDetailModal
        visible={!!selectedEntry}
        entry={selectedEntry!}
        onClose={() => setSelectedEntry(null)}
        onSave={(updated) => {
          setSelectedEntry(null)
        }}
        />
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'flex-start'
  },
  filterRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    marginBottom: 8
  },
  filterButton: {
    height:CARD_HEIGHT / 2,
    paddingVertical: 6,
    paddingHorizontal: 12,
    marginLeft: 8,
    marginRight: 8,
    marginBottom:24,
    borderRadius: 10,
    backgroundColor: '#EEE',
  },
  filterButtonActive: {
    backgroundColor: '#AAA',
  },
  filterText: { fontSize: 14, color: '#333' },
  filterTextActive: { fontSize: 14, color: '#FFF' },
  card: {
    width: CARD_WIDTH,
    height: CARD_HEIGHT,
    borderWidth: 2,
    borderRadius: 12,
    paddingHorizontal: 12,
    marginVertical: 8,
    backgroundColor: '#FFF',
    flexDirection: 'row',
    justifyContent: 'flex-start',
    alignItems: 'center'
  },
  type: { fontWeight: '600', fontSize: 16, textAlign: 'left', flex: 1 },
  timestamp: { color: '#666', textAlign: 'right' },
  empty: { textAlign: 'center', marginTop: 20, color: '#999' },
  aiButton: {
    marginTop: 12,
    paddingVertical: 10,
    paddingHorizontal: 16,
    backgroundColor: '#50E3C2',
    borderRadius: 8,
  },
  aiButtonText: { color: '#FFF', fontWeight: '600' },
  header: { fontSize: 18, fontWeight: '600' },
})
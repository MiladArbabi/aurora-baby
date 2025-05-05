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
import { QuickLogEntry } from '../models/QuickLogSchema'
import { getLogsBetween, deleteLogEntry  } from '../services/QuickLogAccess'
import CareLayout from 'components/carescreen/CareLayout'
import { MiniTab } from '../components/carescreen/MiniNavBar'
import { StackNavigationProp } from '@react-navigation/stack'
import { useNavigation } from '@react-navigation/native'
import { RootStackParamList } from '../navigation/AppNavigator'
import LogDetailModal from 'components/carescreen/LogDetailModal'

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

  // fetch once
  useEffect(() => {
    getLogsBetween(
      new Date(Date.now()-7*24*60*60*1000).toISOString(),
      new Date().toISOString()
    ).then(setEntries)
     .catch(console.error)
  },[])

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
        <Text style={styles.timestamp}>
          {new Date(item.timestamp).toLocaleTimeString([],{
            hour:'2-digit',minute:'2-digit'
          })}
        </Text>
      </TouchableOpacity>
    ),[]
  )

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
      <View style={{ flex: 1 }}>
        {/* Filters */}
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

        {/* Cards list */}
        <FlatList
          data={filtered}
          keyExtractor={e=>e.id}
          renderItem={renderCard}
          contentContainerStyle={{ paddingVertical: 16 }}
        />
      </View>
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
})

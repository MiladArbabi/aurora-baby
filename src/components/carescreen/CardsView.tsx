import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
} from 'react-native';
import { QuickLogEntry } from '../../models/QuickLogSchema';
import { getLogsBetween } from '../../services/QuickLogAccess';
import LogDetailModal from '../carescreen/LogDetailModal';
import SleepIcon from '../../assets/carescreen/QuickLogMenu/SleepButton';
import FeedIcon from '../../assets/carescreen/QuickLogMenu/FeedingButton';
import DiaperIcon from '../../assets/carescreen/QuickLogMenu/DiaperButton';
import MoodIcon from '../../assets/carescreen/QuickLogMenu/MoodButton';
import HealthIcon from '../../assets/carescreen/QuickLogMenu/HealthButton';
import NoteIcon from '../../assets/carescreen/QuickLogMenu/NotesButton';

const { width, height } = Dimensions.get('window');
const CARD_WIDTH = width * 0.9;
const CARD_HEIGHT = height * 0.1;

// Define icon size constants
const ICON_SIZE = 86; // Set desired icon size (width and height)

// Icon map with components supporting width, height, and fill props
const iconMap: Record<QuickLogEntry['type'], React.FC<any>> = {
  sleep: SleepIcon,
  feeding: FeedIcon,
  diaper: DiaperIcon,
  mood: MoodIcon,
  health: HealthIcon,
  note: NoteIcon,
};

const LOG_TYPES: Array<QuickLogEntry['type']> = [
  'sleep',
  'feeding',
  'diaper',
  'mood',
  'health',
  'note',
];

export default function CardsView() {
  const [entries, setEntries] = useState<QuickLogEntry[]>([]);
  const [filterType, setFilterType] = useState<'all' | QuickLogEntry['type']>('all');
  const [filterBarHeight, setFilterBarHeight] = useState(0);
  const [selectedLog, setSelectedLog] = useState<QuickLogEntry | null>(null); // State for selected log

  useEffect(() => {
    const end = new Date().toISOString();
    const start = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();
    getLogsBetween(start, end)
      .then(setEntries)
      .catch(console.error);
  }, []);

  const filtered = filterType === 'all'
    ? entries
    : entries.filter(e => e.type === filterType);

  const handleCardPress = (entry: QuickLogEntry) => {
    setSelectedLog(entry); // Set the selected log to show in modal
  };

  const handleCloseModal = () => {
    setSelectedLog(null); // Clear selected log to close modal
  };

  const renderCard = ({ item }: { item: QuickLogEntry }) => {
    const Icon = iconMap[item.type];
    const ts = new Date(item.timestamp);
    const time = ts.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const endTime = (item.type === 'sleep' && (item.data as any).end)
      ? ` – ${new Date((item.data as any).end).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`
      : '';

    return (
      <TouchableOpacity
        style={[styles.card, { borderColor: iconColors[item.type] }]}
        onPress={() => handleCardPress(item)}
        testID={`log-card-${item.id}`} // Added for testing
      >
        <View style={styles.left}>
          <Icon width={ICON_SIZE} height={ICON_SIZE} fill={iconColors[item.type]} />
          <Text style={styles.title}>{item.type.charAt(0).toUpperCase() + item.type.slice(1)}</Text>
        </View>
        <Text style={styles.time}>{time}{endTime}</Text>
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      {/* Filter bar */}
      <View
        style={styles.filterContainer}
        onLayout={(event) => {
          const { height } = event.nativeEvent.layout;
          setFilterBarHeight(height);
        }}
      >
        <FlatList
          data={['all', ...LOG_TYPES]}
          horizontal
          nestedScrollEnabled
          keyExtractor={t => t}
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.filters}
          renderItem={({ item }) => {
            const isSelected = item === filterType;
            const label = item === 'all'
              ? 'All'
              : item.charAt(0).toUpperCase() + item.slice(1);
            return (
              <TouchableOpacity
                onPress={() => setFilterType(item as any)}
                style={[
                  styles.filterBtn,
                  isSelected && { backgroundColor: '#ddd' },
                ]}
              >
                <Text style={styles.filterTxt}>{label}</Text>
              </TouchableOpacity>
            );
          }}
        />
      </View>

      {/* Cards list */}
      <FlatList
        data={filtered}
        keyExtractor={e => e.id}
        contentContainerStyle={[styles.list, { paddingTop: filterBarHeight }]}
        ListEmptyComponent={<Text style={styles.empty}>No logs yet.</Text>}
        renderItem={renderCard}
      />

      {/* Log Detail Modal */}
      <LogDetailModal
        visible={!!selectedLog}
        entry={selectedLog!}
        onClose={handleCloseModal}
        onSave={(updatedEntry) => {
          // Update the entries list with the saved entry
          setEntries((prev) =>
            prev.map((e) => (e.id === updatedEntry.id ? updatedEntry : e))
          );
          handleCloseModal();
        }}
      />
    </View>
  );
}

const iconColors: Record<QuickLogEntry['type'], string> = {
  sleep: '#4A90E2',
  feeding: '#50E3C2',
  diaper: '#F5A623',
  mood: '#F8E71C',
  health: '#D0021B',
  note: '#9013FE',
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  filterContainer: {},
  filters: {
    paddingVertical: 12,
    paddingHorizontal: 8,
    flexGrow: 1,
  },
  filterBtn: {
    paddingHorizontal: 12,
    height: 32,
    borderRadius: 15,
    borderWidth: 1,
    borderColor: '#ccc',
    marginHorizontal: 4,
    justifyContent: 'center',
    alignItems: 'center',
    minWidth: 60,
  },
  filterTxt: {
    fontSize: 14,
    textAlign: 'center',
  },
  list: {
    alignItems: 'flex-start',
    paddingBottom: 24,
  },
  empty: {
    marginTop: 40,
    textAlign: 'center',
    color: '#666',
  },
  card: {
    width: CARD_WIDTH,
    height: CARD_HEIGHT,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderWidth: 2,
    borderRadius: 15,
    padding: 12,
    marginVertical: 8,
    marginHorizontal: (width - CARD_WIDTH) / 2,
  },
  left: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  title: {
    marginLeft: 8,
    fontWeight: '600',
    fontSize: 16,
  },
  time: {
    fontSize: 14,
    color: '#555',
  },
});
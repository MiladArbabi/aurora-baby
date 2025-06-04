import React, { useState } from 'react';
import { Text, TouchableOpacity, StyleSheet, FlatList } from 'react-native';
import { useTheme } from 'styled-components/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { useNavigation } from '@react-navigation/native';
import LogDetailModal from '../../components/carescreen/LogDetailModal';
import CareLayout from 'components/carescreen/CareLayout';

import { RootStackParamList } from '../../navigation/AppNavigator';
import { QuickLogEntry } from '../../models/QuickLogSchema';
import InferredLogItem from '../../components/carescreen/InferredLogItem';

import { useFutureLogs } from '../../hooks/useFutureLogs';  //

type NavProp = StackNavigationProp<RootStackParamList, 'InferredLogs'>;

export default function InferredLogsScreen() {
  const navigation = useNavigation<NavProp>();
  const theme = useTheme();

    // (A) Use our custom hook to manage future-entries state & actions
    const {
      entries: futureEntries,
      count: storedCount,
      generateNextDay,
      clearAll,
      replaceOne,
      deleteOne,
    } = useFutureLogs();

  // (A) Count of stored future entries & full array to render
  const [selectedEntry, setSelectedEntry] = useState<QuickLogEntry | null>(null);
  const [modalVisible, setModalVisible] = useState(false);

  // (3) Simple navigator stub
  const handleNavigate = (tab: string) => {
    if (tab === 'cards') navigation.navigate('PastLogs');
    else if (tab === 'tracker') navigation.navigate('Care');
    else if (tab === 'graph') navigation.navigate('Insights');
    else if (tab === 'future') {/* already here */}
  };

  return (
    <CareLayout activeTab="future" onNavigate={handleNavigate} bgColor={theme.colors.accent}>
      <Text style={styles.infoText}>
        Stored future entries: {storedCount}
      </Text>

      {/* Generate Next-Day Logs */}
      <TouchableOpacity style={styles.button} onPress={generateNextDay}>
        <Text style={styles.buttonText}>Fill next-day logs</Text>
      </TouchableOpacity>

      {/* Clear All Future Logs */}
      <TouchableOpacity
        style={[styles.button, styles.clearButton]}
        onPress={clearAll}
      >
        <Text style={[styles.buttonText, styles.clearButtonText]}>
          Clear All Future Logs
        </Text>
      </TouchableOpacity>

      <FlatList
        data={futureEntries}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <InferredLogItem
            log={item as any}
            onPress={() => {
              setSelectedEntry(item);
              setModalVisible(true);
            }}
          />
        )}
        contentContainerStyle={styles.listContainer}
        ListEmptyComponent={() => (
          <Text style={styles.emptyText}>No future logs yet.</Text>
        )}
        style={styles.list}
      />

      {selectedEntry && (
        <LogDetailModal
          visible={modalVisible}
          entry={selectedEntry}
          onClose={() => {
            setModalVisible(false);
            setSelectedEntry(null);
          }}
          onSave={(updatedEntry) => {
            replaceOne(updatedEntry);
            setModalVisible(false);
            setSelectedEntry(null);
          }}
          onDelete={(id) => {
            deleteOne(id);
            setModalVisible(false);
            setSelectedEntry(null);
          }}
        />
      )}
    </CareLayout>
  );
}

const styles = StyleSheet.create({
  infoText: {
    fontSize: 18,
    color: '#333',
    marginVertical: 12,
    marginHorizontal: 16,
  },
  button: {
    backgroundColor: '#50E3C2',
    marginHorizontal: 16,
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 6,
    alignSelf: 'flex-start',
  },
  buttonText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '600',
  },
  clearButton: {
    backgroundColor: '#D0021B',
    marginTop: 12,
  },
  clearButtonText: {
    color: '#FFF',
  },
  listContainer: {
    marginTop: 20,
    paddingHorizontal: 16,
  },
  list: {
    flex: 1,
  },
  emptyText: {
    marginTop: 12,
    marginHorizontal: 16,
    color: '#666',
  },
});
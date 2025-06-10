// src/screens/care/EndOfDayExportScreen.tsx
import React, { useEffect, useState, useMemo } from 'react';
import { View, Text, Button, ScrollView, StyleSheet, Alert, Share } from 'react-native';
import { StackScreenProps } from '@react-navigation/stack';
import { RootStackParamList } from '../../navigation/AppNavigator';
import { format, startOfToday, endOfToday } from 'date-fns';
import { useTranslation } from 'react-i18next';
import styled from 'styled-components/native';

import { getBabyProfile } from 'storage/BabyProfileStorage';
import { getParentProfile } from '../../services/ParentProfileAccess';
import { LogEntry } from 'models/LogSchema';
import { LogRepository } from '../../storage/LogRepository';

import BackButton from '../../assets/icons/common/BackButton';

type Props = StackScreenProps<RootStackParamList, 'EndOfDayExport'>;

const HeaderRow = styled.View`
    flex-direction: row;
    align-items: center;
    margin-vertical: 24px;
  `;

export default function EndOfDayExportScreen({ navigation }: Props) {
    const { t } = useTranslation();
    const [todayLogs, setTodayLogs] = useState<LogEntry[]>([]);
    const [loading, setLoading] = useState(true);
    const [childName, setChildName] = useState<string | null>(null);
    const [parentName, setParentName] = useState<string | null>(null);
    const [relationString, setRelationString] = useState<string>('child'); 

  // compute “Jun 1, 2025” once
  const todayLabel = useMemo(() => format(new Date(), 'MMM d, yyyy'), []);

  useEffect(() => {
    (async () => {
        const logs = await LogRepository.getEntriesBetween(
            startOfToday().toISOString(),
            endOfToday().toISOString()
        );
      setTodayLogs(logs);

     // -------------------------------------------------------------------
     // 1) Fetch profiles so we can inject “Child (son/daughter of Parent)”
     // -------------------------------------------------------------------
     try {
       const child = await getBabyProfile();
       const parent = await getParentProfile();
       if (child) {
         setChildName(child.name);
       }
       if (parent) {
         setParentName(parent.name);
       }
     } catch (err) {
       console.warn('[EndOfDayExportScreen] could not load profiles', err);
     }
     // -------------------------------------------------------------------

      setLoading(false);
    })();
  }, []);

  // Render a LogEntry.data in readable form:
  function renderLogDetails(log: LogEntry): string {
        switch (log.type) {
          case 'feeding':
            const { method, quantity, notes } = log.data;
            return [
              `Method: ${method}`,
              quantity != null ? `Quantity: ${quantity}` : null,
              notes ? `Notes: ${notes}` : null,
            ]
            .filter(Boolean)
            .join(' · ');
    
          case 'diaper':
            const { status, notes: diaperNotes } = log.data;
            return `Status: ${status}` + (diaperNotes ? ` · Notes: ${diaperNotes}` : '');
    
          case 'sleep':
            const { start, end, duration } = log.data;
            return `From ${format(new Date(start), 'hh:mm a')} to ${format(new Date(end), 'hh:mm a')} (${duration} min)`;
    
          case 'mood':
            const { emoji, tags, subtype } = log.data;
            return `Emoji: ${emoji}` + (subtype ? ` · ${subtype}` : '') + (tags?.length ? ` · Tags: ${tags.join(', ')}` : '');
    
          case 'health':
            const { temperature, symptoms, notes: healthNotes } = log.data;
            return [
              temperature != null ? `Temp: ${temperature}°` : null,
              symptoms?.length ? `Symptoms: ${symptoms.join(', ')}` : null,
              healthNotes ? `Notes: ${healthNotes}` : null,
            ]
            .filter(Boolean)
            .join(' · ');
    
          case 'note':
            return `Note: ${log.data.text}`;
        }
      }

  const makeTitle = (): string => {
    let title = `Care Logs - ${todayLabel}`;
    if (childName && parentName) {
      title = `${childName} (${relationString} of ${parentName}) - ${todayLabel}`;
    }
    return title;
  };

  const handleShare = async () => {
    try {
        const header = ['Time','Type','Details'];
              const rows = todayLogs.map((log) => {
                const time = format(new Date(log.timestamp), 'HH:mm');
                // stringify the entire log.data object
                return [time, log.type, JSON.stringify(log.data || {})];
              });
              const csvLines = [header.join(','), ...rows.map((r) => r.join(','))];
              const csv = csvLines.join('\n');
        
              await Share.share({
                title: makeTitle(),
                message: csv,
              });

    } catch (e) {
      Alert.alert('Error', 'Could not open share dialog.');
    }
  };

  if (loading) {
    return (
      <View style={styles.center}>
        <Text>Loading…</Text>
      </View>
    );
  }

  // Re‐compute the screen heading:
  const headingBase = t('care.endOfDayExportTitle', { date: todayLabel });
  const screenHeading =
    childName && parentName
      ? `${childName} (${relationString} of ${parentName}) – ${todayLabel}`
      : headingBase

  return (
    <ScrollView contentContainerStyle={styles.container}>
        <HeaderRow>
          <BackButton onPress={() => navigation.goBack()} />
          {/* empty View just to keep some space to the right if needed */}
          <View style={{ flex: 1 }} />
        </HeaderRow>
        <Text style={styles.heading}>{screenHeading}</Text>

      {todayLogs.length === 0 ? (
        <Text style={styles.noLogs}>No logs recorded today.</Text>
      ) : (
        todayLogs.map((log, idx) => (
          <View key={idx} style={styles.logRow}>
            <Text style={styles.logTime}>
                {format(new Date(log.timestamp), 'hh:mm a')}
            </Text>
            <Text style={styles.logType}>{log.type.charAt(0).toUpperCase() + log.type.slice(1)}</Text>
            <Text style={styles.logDetail}>
                {renderLogDetails(log)}
            </Text>
          </View>
        ))
      )}

      <View style={styles.buttonContainer}>
        <Button
          title="Share Summary (CSV)"
          onPress={handleShare}
          disabled={todayLogs.length === 0}
        />
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 16,
    paddingBottom: 40,
  },
  heading: {
    fontSize: 20,
    fontWeight: '600',
    marginBottom: 16,
  },
  noLogs: {
    fontSize: 16,
    fontStyle: 'italic',
    color: '#666',
    marginBottom: 24,
  },
  logRow: {
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderColor: '#ccc',
    paddingVertical: 12,
    marginBottom: 8,
  },
  logTime: {
    fontWeight: '500',
    fontSize: 14,
    marginBottom: 4,
  },
  logType: {
    color: '#333',
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 2,
  },
  logDetail: {
    color: '#555',
    fontSize: 14,
    lineHeight: 20,
  },
  buttonContainer: {
    marginTop: 32,
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

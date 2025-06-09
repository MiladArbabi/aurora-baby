// src/screens/profile/GapSettingsScreen.tsx
import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, Button, StyleSheet, Alert, SafeAreaView } from 'react-native';
import { StackScreenProps } from '@react-navigation/stack';
import { RootStackParamList } from '../../navigation/AppNavigator';
import { getBabyProfile } from 'storage/BabyProfileStorage';
import BackButton from '../../assets/icons/common/BackButton';

import {
  getGapSettings,
  saveGapSettings,
  GapSettings,
} from '../../services/GapSettingsStorage';

type Props = StackScreenProps<RootStackParamList, 'GapSettings'>;

export default function GapSettingsScreen({ navigation }: Props) {
  const [feedingGapMinutes, setFeedingGapMinutes] = useState('');
  const [diaperGapHours, setDiaperGapHours] = useState('');
  const [sleepGapHours, setSleepGapHours] = useState('');
  const [childId, setChildId] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      const child = await getBabyProfile();
      if (!child) {
        Alert.alert('Error', 'No child profile found.');
        navigation.goBack();
        return;
      }
      setChildId(child.id);

      const existing: GapSettings = await getGapSettings(child.id);
      setFeedingGapMinutes(String(existing.feedingGapMinutes));
      setDiaperGapHours(String(existing.diaperGapHours));
      setSleepGapHours(String(existing.sleepGapHours));
    })();
  }, [navigation]);

  const handleSave = async () => {
    if (!childId) return;
    const newSettings: GapSettings = {
      feedingGapMinutes: parseInt(feedingGapMinutes, 10),
      diaperGapHours: parseInt(diaperGapHours, 10),
      sleepGapHours: parseInt(sleepGapHours, 10),
    };
    // Basic validation
    if (
      isNaN(newSettings.feedingGapMinutes) ||
      isNaN(newSettings.diaperGapHours) ||
      isNaN(newSettings.sleepGapHours)
    ) {
      Alert.alert('Invalid input', 'Please enter valid numbers.');
      return;
    }
    await saveGapSettings(childId, newSettings);
    Alert.alert('Saved', 'Gap thresholds updated.');
    navigation.goBack();
  };

  return (
    <SafeAreaView style={styles.safeArea}>
          {/* Top‐nav: Back button + Title */}
          <View style={styles.topNav}>
            <BackButton
              fill=""
              onPress={() => navigation.goBack()}
              style={styles.backIcon}
            />
            <Text style={styles.screenTitle}>Gap Settings</Text>
          </View>
    
          {/* Content */}
          <View style={styles.container}>
            <Text style={styles.label}>Feeding Gap (minutes)</Text>
            <TextInput
              style={styles.input}
              keyboardType="numeric"
              value={feedingGapMinutes}
              onChangeText={setFeedingGapMinutes}
            />
    
            <Text style={styles.label}>Diaper Gap (hours)</Text>
            <TextInput
              style={styles.input}
              keyboardType="numeric"
              value={diaperGapHours}
              onChangeText={setDiaperGapHours}
            />
    
            <Text style={styles.label}>Sleep Gap (hours)</Text>
            <TextInput
              style={styles.input}
              keyboardType="numeric"
              value={sleepGapHours}
              onChangeText={setSleepGapHours}
            />
    
            <View style={styles.saveButton}>
              <Button title="Save Thresholds" onPress={handleSave} />
            </View>
          </View>
    
          {/* Bottom‐nav placeholder */}
          <View style={styles.bottomNav}>
            <Text style={styles.bottomNavText}> {/* replace with actual nav icons */}
              Home | Care | Profile
            </Text>
          </View>
        </SafeAreaView>
  );
}

const styles = StyleSheet.create({
      safeArea: {
        flex: 1,
        backgroundColor: '#fff',
        marginVertical: 24
      },
      topNav: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 16,
        paddingVertical: 12,
        borderBottomWidth: 1,
        borderColor: '#eee',
      },
      backIcon: {
        marginRight: 12,
      },
      screenTitle: {
        fontSize: 20,
        fontWeight: '600',
      },
      container: {
        flex: 1,
        paddingHorizontal: 16,
        paddingTop: 24,
      },
      label: {
        fontSize: 16,
        marginBottom: 6,
        marginTop: 16,
      },
      input: {
        borderWidth: 1,
        borderColor: '#ccc',
        borderRadius: 6,
        padding: 12,
        fontSize: 16,
      },
      saveButton: {
        marginTop: 24,
        marginBottom: 16,
      },
      bottomNav: {
        height: 50,
        borderTopWidth: 1,
        borderColor: '#eee',
        justifyContent: 'center',
        alignItems: 'center',
      },
      bottomNavText: {
        color: '#888',
      },
    });

// src/screens/profile/TTSSettingsScreen.tsx
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  Alert,
  ScrollView,
} from 'react-native';
import { Picker } from '@react-native-picker/picker';
import { StackScreenProps } from '@react-navigation/stack';
import { RootStackParamList } from '../../navigation/AppNavigator';
import {
  setGlobalRateOverride,
  getGlobalRateOverride,
} from '../../services/TTSService';
import { setNightModeConfig, getNightModeConfig } from '../../utils/NightMode';
import AsyncStorage from '@react-native-async-storage/async-storage';
import BackButton from '../../assets/icons/common/BackButton';
import { useTranslation } from 'react-i18next';

const PROFILE_KEY = '@tts_default_profile';
const AVAILABLE_PROFILES = ['default', 'story', 'alert', 'soothing'] as const;
type ProfileName = typeof AVAILABLE_PROFILES[number];

type Props = StackScreenProps<RootStackParamList, 'TTSSettings'>;

export default function TTSSettingsScreen({ navigation }: Props) {
  const { t } = useTranslation();
  const [chosenProfile, setChosenProfile] = useState<ProfileName>('default');
  const [rateOverrideText, setRateOverrideText] = useState('');
  const [nightMode, setNightMode] = useState<'auto' | 'day' | 'night'>('auto');
  const [nightStart, setNightStart] = useState(18);
  const [nightEnd, setNightEnd] = useState(6);

  useEffect(() => {
    (async () => {
      try {
        const rawProfile = await AsyncStorage.getItem(PROFILE_KEY);
        if (rawProfile && AVAILABLE_PROFILES.includes(rawProfile as ProfileName)) {
          setChosenProfile(rawProfile as ProfileName);
        }

        const rawRate = await getGlobalRateOverride();
        if (rawRate !== null) {
          setRateOverrideText(String(rawRate));
        }

        const config = await getNightModeConfig();
        setNightMode(config.mode);
        setNightStart(config.nightStart || 18);
        setNightEnd(config.nightEnd || 6);
      } catch (err) {
        console.warn('Error loading TTS settings:', err);
      }
    })();
  }, []);

  const persistProfile = async (profile: ProfileName) => {
    try {
      await AsyncStorage.setItem(PROFILE_KEY, profile);
      setChosenProfile(profile);
      Alert.alert(t('ttsSettings.saved'), `${t('ttsSettings.profileSet')} "${profile}".`);
    } catch (err) {
      console.warn('Failed to save default profile:', err);
      Alert.alert(t('ttsSettings.error'), t('ttsSettings.profileError'));
    }
  };

  const persistRateOverride = async () => {
    const parsed = parseFloat(rateOverrideText);
    if (isNaN(parsed) || parsed <= 0 || parsed > 2) {
      Alert.alert(t('ttsSettings.invalidRate'), t('ttsSettings.rateRange'));
      return;
    }
    await setGlobalRateOverride(parsed);
    Alert.alert(t('ttsSettings.saved'), `${t('ttsSettings.rateSet')} ${parsed}.`);
  };

  const clearRateOverride = async () => {
    await setGlobalRateOverride(null);
    setRateOverrideText('');
    Alert.alert(t('ttsSettings.reset'), t('ttsSettings.rateCleared'));
  };

  const saveNightMode = async () => {
    try {
      await setNightModeConfig({ mode: nightMode, nightStart, nightEnd });
      Alert.alert(t('ttsSettings.saved'), t('ttsSettings.nightModeSaved'));
    } catch (err) {
      console.warn('Failed to save night mode:', err);
      Alert.alert(t('ttsSettings.error'), t('ttsSettings.nightModeError'));
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.safeArea}>
      <View style={styles.topNav}>
        <BackButton onPress={() => navigation.goBack()} style={styles.backButton} />
        <Text style={styles.screenTitle}>{t('ttsSettings.title')}</Text>
      </View>

      <View style={styles.container}>
        <Text style={styles.sectionTitle}>{t('ttsSettings.defaultProfile')}</Text>
        {AVAILABLE_PROFILES.map((profile) => (
          <TouchableOpacity
            key={profile}
            style={[
              styles.profileOption,
              chosenProfile === profile && styles.profileOptionSelected,
            ]}
            onPress={() => persistProfile(profile)}
          >
            <Text
              style={[
                styles.profileOptionText,
                chosenProfile === profile && styles.profileOptionTextSelected,
              ]}
            >
              {profile.charAt(0).toUpperCase() + profile.slice(1)}
            </Text>
          </TouchableOpacity>
        ))}

        <View style={styles.divider} />

        <Text style={styles.sectionTitle}>{t('ttsSettings.globalRate')}</Text>
        <Text style={styles.label}>{t('ttsSettings.rateHint')}</Text>
        <TextInput
          style={styles.input}
          keyboardType="decimal-pad"
          placeholder="e.g. 0.85"
          value={rateOverrideText}
          onChangeText={setRateOverrideText}
        />
        <View style={styles.rateButtonsRow}>
          <TouchableOpacity style={styles.saveButton} onPress={persistRateOverride}>
            <Text style={styles.saveButtonText}>{t('ttsSettings.saveRate')}</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.clearButton} onPress={clearRateOverride}>
            <Text style={styles.clearButtonText}>{t('ttsSettings.clear')}</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.divider} />

        <Text style={styles.sectionTitle}>{t('ttsSettings.nightMode')}</Text>
        <Picker
          selectedValue={nightMode}
          onValueChange={(value: 'auto' | 'day' | 'night') => setNightMode(value)}
          style={styles.picker}
        >
          <Picker.Item label={t('ttsSettings.auto')} value="auto" />
          <Picker.Item label={t('ttsSettings.day')} value="day" />
          <Picker.Item label={t('ttsSettings.night')} value="night" />
        </Picker>
        {nightMode === 'auto' && (
          <>
            <Text style={styles.label}>{t('ttsSettings.nightStart')}</Text>
            <Picker
              selectedValue={nightStart}
              onValueChange={(value: number) => setNightStart(value)}
              style={styles.picker}
            >
              {Array.from({ length: 24 }, (_, i) => (
                <Picker.Item key={i} label={`${i}:00`} value={i} />
              ))}
            </Picker>
            <Text style={styles.label}>{t('ttsSettings.nightEnd')}</Text>
            <Picker
              selectedValue={nightEnd}
              onValueChange={(value: number) => setNightEnd(value)}
              style={styles.picker}
            >
              {Array.from({ length: 24 }, (_, i) => (
                <Picker.Item key={i} label={`${i}:00`} value={i} />
              ))}
            </Picker>
          </>
        )}
        <TouchableOpacity style={styles.saveButton} onPress={saveNightMode}>
          <Text style={styles.saveButtonText}>{t('ttsSettings.saveNightMode')}</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flexGrow: 1, backgroundColor: '#fff' },
  topNav: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderColor: '#EEE',
    marginVertical: 26,
  },
  backButton: { marginRight: 12 },
  screenTitle: { fontSize: 20, fontWeight: '600' },
  container: { paddingHorizontal: 16, paddingTop: 24, flexGrow: 1 },
  sectionTitle: { fontSize: 18, fontWeight: '500', marginBottom: 12 },
  profileOption: {
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderWidth: 1,
    borderColor: '#CCC',
    borderRadius: 6,
    marginBottom: 8,
  },
  profileOptionSelected: { backgroundColor: '#CCE5FF', borderColor: '#66B2FF' },
  profileOptionText: { fontSize: 16, color: '#333' },
  profileOptionTextSelected: { color: '#004A99', fontWeight: '600' },
  divider: { height: 1, backgroundColor: '#EEE', marginVertical: 24 },
  label: { fontSize: 14, color: '#555', marginBottom: 6 },
  input: {
    borderWidth: 1,
    borderColor: '#CCC',
    borderRadius: 6,
    padding: 10,
    fontSize: 16,
    marginBottom: 16,
  },
  rateButtonsRow: { flexDirection: 'row', justifyContent: 'space-between' },
  saveButton: {
    backgroundColor: '#4A90E2',
    paddingVertical: 10,
    paddingHorizontal: 18,
    borderRadius: 6,
    marginTop: 10,
  },
  saveButtonText: { color: '#FFF', fontSize: 16, fontWeight: '600' },
  clearButton: {
    backgroundColor: '#AAA',
    paddingVertical: 10,
    paddingHorizontal: 18,
    borderRadius: 6,
  },
  clearButtonText: { color: '#FFF', fontSize: 16, fontWeight: '600' },
  picker: { height: 50, width: '100%', marginBottom: 10 },
});
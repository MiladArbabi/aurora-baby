import React, { useState, useEffect } from 'react'
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  Alert,
  ScrollView,
} from 'react-native'
import { StackScreenProps } from '@react-navigation/stack'
import { RootStackParamList } from '../../navigation/AppNavigator'
import {
  setGlobalRateOverride,
  getGlobalRateOverride,
} from '../../services/TTSService'
import AsyncStorage from '@react-native-async-storage/async-storage'
import BackButton from 'assets/icons/common/BackButton'

// key under which we save the chosen “default profile”
const PROFILE_KEY = '@tts_default_profile'

// the names must match your profiles in TTSService.ts
const AVAILABLE_PROFILES = ['default', 'story', 'alert', 'soothing'] as const
type ProfileName = typeof AVAILABLE_PROFILES[number]

type Props = StackScreenProps<RootStackParamList, 'TTSSettings'>

export default function TTSSettingsScreen({ navigation }: Props) {
  const [chosenProfile, setChosenProfile] = useState<ProfileName>('default')
  const [rateOverrideText, setRateOverrideText] = useState('') // stringified number

  // on mount, load stored profile & rate override
  useEffect(() => {
    ;(async () => {
      try {
        const rawProfile = await AsyncStorage.getItem(PROFILE_KEY)
        if (
          rawProfile &&
          AVAILABLE_PROFILES.includes(rawProfile as ProfileName)
        ) {
          setChosenProfile(rawProfile as ProfileName)
        }

        const rawRate = await getGlobalRateOverride()
        if (rawRate !== null) {
          setRateOverrideText(String(rawRate))
        }
      } catch (err) {
        console.warn('Error loading TTS settings:', err)
      }
    })()
  }, [])

  // save profile selection to AsyncStorage
  const persistProfile = async (profile: ProfileName) => {
    try {
      await AsyncStorage.setItem(PROFILE_KEY, profile)
      setChosenProfile(profile)
      Alert.alert('Saved', `Voice profile set to "${profile}".`)
    } catch (err) {
      console.warn('Failed to save default profile:', err)
      Alert.alert('Error', 'Could not save profile.')
    }
  }

  // save rate override (call into TTSService)
  const persistRateOverride = async () => {
    const parsed = parseFloat(rateOverrideText)
    if (isNaN(parsed) || parsed <= 0 || parsed > 2) {
      Alert.alert(
        'Invalid Rate',
        'Enter a number between 0.1 and 2.0 (e.g. 0.85).'
      )
      return
    }
    await setGlobalRateOverride(parsed)
    Alert.alert('Saved', `Global TTS rate override set to ${parsed}.`)
  }

  // clear rate override
  const clearRateOverride = async () => {
    await setGlobalRateOverride(null)
    setRateOverrideText('')
    Alert.alert('Reset', 'Global TTS rate override cleared.')
  }

  return (
    <ScrollView contentContainerStyle={styles.safeArea}>
      {/* ── Top nav: Back button + Title ── */}
      <View style={styles.topNav}>
        <BackButton
          onPress={() => navigation.goBack()}
          style={styles.backButton}
        />
        <Text style={styles.screenTitle}>TTS Settings</Text>
      </View>

      {/* ── Content ── */}
      <View style={styles.container}>
        <Text style={styles.sectionTitle}>Default Voice Profile</Text>
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

        <Text style={styles.sectionTitle}>Global Rate Override</Text>
        <Text style={styles.label}>
          (leave blank to use each profile’s default)
        </Text>
        <TextInput
          style={styles.input}
          keyboardType="decimal-pad"
          placeholder="e.g. 0.85"
          value={rateOverrideText}
          onChangeText={setRateOverrideText}
        />

        <View style={styles.rateButtonsRow}>
          <TouchableOpacity
            style={styles.saveButton}
            onPress={persistRateOverride}
          >
            <Text style={styles.saveButtonText}>Save Rate</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.clearButton}
            onPress={clearRateOverride}
          >
            <Text style={styles.clearButtonText}>Clear</Text>
          </TouchableOpacity>
        </View>
      </View>
    </ScrollView>
  )
}

const styles = StyleSheet.create({
  safeArea: {
    flexGrow: 1,
    backgroundColor: '#fff',
  },
  topNav: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderColor: '#EEE',
    marginVertical: 26
  },
  backButton: {
    marginRight: 12,
  },
  backArrow: {
    fontSize: 20,
  },
  screenTitle: {
    fontSize: 20,
    fontWeight: '600',
  },
  container: {
    paddingHorizontal: 16,
    paddingTop: 24,
    flexGrow: 1,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '500',
    marginBottom: 12,
  },
  profileOption: {
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderWidth: 1,
    borderColor: '#CCC',
    borderRadius: 6,
    marginBottom: 8,
  },
  profileOptionSelected: {
    backgroundColor: '#CCE5FF',
    borderColor: '#66B2FF',
  },
  profileOptionText: {
    fontSize: 16,
    color: '#333',
  },
  profileOptionTextSelected: {
    color: '#004A99',
    fontWeight: '600',
  },
  divider: {
    height: 1,
    backgroundColor: '#EEE',
    marginVertical: 24,
  },
  label: {
    fontSize: 14,
    color: '#555',
    marginBottom: 6,
  },
  input: {
    borderWidth: 1,
    borderColor: '#CCC',
    borderRadius: 6,
    padding: 10,
    fontSize: 16,
    marginBottom: 16,
  },
  rateButtonsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  saveButton: {
    backgroundColor: '#4A90E2',
    paddingVertical: 10,
    paddingHorizontal: 18,
    borderRadius: 6,
  },
  saveButtonText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '600',
  },
  clearButton: {
    backgroundColor: '#AAA',
    paddingVertical: 10,
    paddingHorizontal: 18,
    borderRadius: 6,
  },
  clearButtonText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '600',
  },
})

import React, { useState, useEffect } from 'react';
import { TouchableOpacity, Text, StyleSheet, ActivityIndicator } from 'react-native';
import { speakWithProfile, pause, resume, stop } from '../../services/TTSService';
import { isNightMode } from '../../utils/NightMode';
import i18n from '../../localization';

interface VoiceSummaryButtonProps {
  logs?: Array<{
    id: string;
    babyId?: string;
    timestamp: string;
    type: string;
    version: number;
    data: { method?: string; quantity?: number; unit?: 'oz' | 'mL'; subtype?: string };
  }>;
  style?: object;
}

const VoiceSummaryButton: React.FC<VoiceSummaryButtonProps> = ({ logs = [], style }) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isNight, setIsNight] = useState(false);

  useEffect(() => {
    isNightMode().then(setIsNight);
  }, []);

  const profile = isNight ? 'soothing' : 'default';

  const fetchSummary = async () => {
    try {
      const response = await fetch('http://localhost:4000/summarize-logs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ logs, format: 'narration' }),
      });
      if (!response.ok) throw new Error('Failed to fetch summary');
      const data = await response.json();
      return data.summary || 'No activities logged today.';
    } catch (err) {
      console.error('[VoiceSummaryButton] Fetch error:', err);
      throw err;
    }
  };

  const handlePress = async () => {
    try {
      setError(null);
      if (isPlaying) {
        pause();
        setIsPlaying(false);
        return;
      }

      setIsLoading(true);
      const summary = await fetchSummary();
      setIsLoading(false);

      setIsPlaying(true);
      await speakWithProfile(summary, profile);
      setIsPlaying(false);
    } catch (err) {
      setIsLoading(false);
      setIsPlaying(false);
      setError(i18n.t('voiceSummary.error'));
      console.error('[VoiceSummaryButton] Error:', err);
    }
  };

  useEffect(() => {
    return () => stop(); // Cleanup on unmount
  }, []);

  return (
    <TouchableOpacity
      style={[styles.chip, style, error && styles.errorBubble, isNight && styles.night]}
      onPress={handlePress}
      disabled={isLoading}
      accessibilityLabel={i18n.t('voiceSummary.accessibilityLabel')}
      accessibilityRole="button"
    >
      {isLoading ? (
        <ActivityIndicator color="#000" size="small" />
      ) : (
        <Text style={styles.text}>
          {isNight ? '🌙 ' : '☀️ '}
          {i18n.t('whispr.summary')}
        </Text>
      )}
      {error && <Text style={styles.errorText}>{error}</Text>}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  chip: {
    backgroundColor: '#E9DAFA',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 25,
    alignItems: 'center',
    flexDirection: 'row',
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.25)',
  },
  night: {
    backgroundColor: '#A68FC9', // Slightly darker to match WhisprScreen palette
  },
  text: {
    color: '#000',
    fontFamily: 'Edrosa',
    fontSize: 13,
    fontWeight: '600',
  },
  errorBubble: {
    backgroundColor: '#F8D7DA',
  },
  errorText: {
    color: '#000',
    fontSize: 10,
    marginLeft: 8,
    fontFamily: 'Edrosa',
  },
});

export default VoiceSummaryButton;
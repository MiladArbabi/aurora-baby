import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import VoiceSummaryButton from './VoiceSummaryButton';
import BackButton from '../../assets/icons/common/BackButton';
import i18n from '../../localization';

interface CustomHeaderProps {
  title: string;
  showBack?: boolean;
  logs?: Array<{
    id: string;
    babyId: string;
    timestamp: string;
    type: string;
    version: number;
    data: { method?: string; quantity?: number; unit?: 'oz' | 'mL'; subtype?: string };
  }>;
}

const CustomHeader: React.FC<CustomHeaderProps> = ({ title, showBack = true, logs }) => {
  const navigation = useNavigation();

  return (
    <View style={styles.container}>
      {showBack && (
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <BackButton fill="#000" />
        </TouchableOpacity>
      )}
      <Text style={styles.title}>{title}</Text>
      {logs && logs.length > 0 && (
        <VoiceSummaryButton logs={logs} style={styles.voiceButton} />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  backButton: {
    marginRight: 12,
  },
  title: {
    flex: 1,
    fontSize: 18,
    fontWeight: '600',
  },
  voiceButton: {
    marginLeft: 12,
  },
});

export default CustomHeader;
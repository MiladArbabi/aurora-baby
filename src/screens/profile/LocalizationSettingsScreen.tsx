// src/screens/profile/LocalizationSettingsScreen.tsx
import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useTheme } from 'styled-components/native';
import { useTranslation } from 'react-i18next';
import { StackNavigationProp } from '@react-navigation/stack';
import { useNavigation } from '@react-navigation/native';
import { RootStackParamList } from '../../navigation/AppNavigator';
import BackButton from '../../assets/icons/common/BackButton';

type NavProp = StackNavigationProp<RootStackParamList, 'LocalizationSettings'>;

export default function LocalizationSettings() {
    const theme = useTheme();
    const { t, i18n } = useTranslation();
    const navigation = useNavigation<NavProp>();

    return (
        <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
          {/* Header with BackButton + Title */}
          <View style={styles.headerRow}>
            <BackButton onPress={() => navigation.goBack()} />
            <Text style={[styles.headerText, { color: theme.colors.text }]}>
              {t('settings.chooseLanguage')}
            </Text>
            {/* Spacer so title stays centered */}
            <View style={{ width: 32 }} />
          </View>
    
          {/* English Button */}
          <TouchableOpacity
            style={[
              styles.button,
              {
                backgroundColor:
                  i18n.language === 'en' ? theme.colors.primary : theme.colors.secondaryBackground,
              },
            ]}
            onPress={() => i18n.changeLanguage('en')}
          >
            <Text
              style={[
                styles.buttonText,
                {
                  color:
                    i18n.language === 'en'
                    ? theme.colors.text
                    : theme.colors.background,
                },
              ]}
            >
              {t('settings.english')}
            </Text>
          </TouchableOpacity>
    
          {/* Svenska Button */}
          <TouchableOpacity
            style={[
              styles.button,
              {
                backgroundColor:
                  i18n.language === 'sv' ? theme.colors.primary : theme.colors.secondaryBackground,
              },
            ]}
            onPress={() => i18n.changeLanguage('sv')}
          >
            <Text
              style={[
                styles.buttonText,
                {
                  color:
                    i18n.language === 'sv'
                      ? theme.colors.text
                      : theme.colors.background,
                },
              ]}
            >
              {t('settings.swedish')}
            </Text>
          </TouchableOpacity>
        </View>
      );
    }
    
    const styles = StyleSheet.create({
      container: {
        flex: 1,
        paddingHorizontal: 16,
        paddingTop: 24,
      },
      headerRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 24,
        justifyContent: 'space-between',
      },
      headerText: {
        fontSize: 20,
        fontWeight: '600',
      },
      button: {
        paddingVertical: 12,
        borderRadius: 8,
        marginBottom: 12,
        alignItems: 'center',
      },
      buttonText: {
        fontSize: 16,
        fontWeight: '500',
      },
    });

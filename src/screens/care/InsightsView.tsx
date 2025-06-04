import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { MiniTab } from '../../components/carescreen/MiniNavBar'
import { StackNavigationProp } from '@react-navigation/stack'
import { useNavigation } from '@react-navigation/native'
import { RootStackParamList } from '../../navigation/AppNavigator'
import { useTheme } from 'styled-components/native'
import CareLayout from 'components/carescreen/CareLayout';

type NavProp = StackNavigationProp<RootStackParamList,'PastLogs'>

const InsightsView: React.FC = () => {
  const navigation = useNavigation<NavProp>()
  const theme = useTheme()
  
  const handleNavigate = (tab: MiniTab) => {
    if (tab === 'cards') return;
    else if (tab === 'tracker') navigation.navigate('Care');     // already on Care
    else if (tab === 'graph') navigation.navigate('Insights');
    else if (tab === 'future') navigation.navigate('InferredLogs');
  };

  return (
    <CareLayout
          activeTab="graph"
          onNavigate={handleNavigate}
          bgColor={theme.colors.background}
        >
        <Text style={styles.title}>Insights</Text>
        <View style={styles.content}>
          <Text>Your insights will appear here</Text>
        </View>
    </CareLayout>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: '#fff',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 16,
    marginHorizontal: 16,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default InsightsView;
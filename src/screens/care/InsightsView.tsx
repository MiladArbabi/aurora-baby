import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

const InsightsView: React.FC = () => {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Insights</Text>
      <View style={styles.content}>
        <Text>Your insights will appear here</Text>
      </View>
    </View>
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
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default InsightsView;
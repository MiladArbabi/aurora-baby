//src/screens/LogDetailScreen.tsx
import React from 'react'
import { View, Text, StyleSheet } from 'react-native'
import { RouteProp, useRoute } from '@react-navigation/native'
import { RootStackParamList } from '../navigation/AppNavigator'

type LogDetailRouteProp = RouteProp<RootStackParamList, 'LogDetail'>

const LogDetailScreen: React.FC = () => {
  const { params } = useRoute<LogDetailRouteProp>()
  const { id, type } = params

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Log Detail</Text>
      <Text>ID: {id}</Text>
      <Text>Type: {type}</Text>
      {/* TODO: load the full entry, allow editing, etc. */}
    </View>
  )
}

export default LogDetailScreen

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
  },
  title: {
    fontSize: 24,
    marginBottom: 16,
  },
})
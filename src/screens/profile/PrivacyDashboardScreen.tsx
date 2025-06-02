// src/screens/PrivacyDashboardScreen.tsx
import React, { useEffect, useState } from 'react'
import { View, Text, ScrollView, StyleSheet } from 'react-native'
import { getChildProfile } from '../../services/ChildProfileAccess'
import { getParentProfile } from '../../services/ParentProfileAccess'
import { getPrivacySettings, PrivacySettings } from '../../services/PrivacySettingsStorage'
import { ChildProfile } from '../../models/ChildProfile'
import { ParentProfile } from '../../storage/ParentProfileStorage'

export default function PrivacyDashboardScreen() {
  const [child, setChild] = useState<ChildProfile | null>(null)
  const [parent, setParent] = useState<ParentProfile | null>(null)
  const [privacy, setPrivacy] = useState<PrivacySettings | null>(null)

  useEffect(() => {
    (async () => {
      const storedChild = await getChildProfile()
      setChild(storedChild)

      const storedParent = await getParentProfile()
      setParent(storedParent)

      const storedPrivacy = await getPrivacySettings()
      setPrivacy(storedPrivacy)
    })()
  }, [])

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.heading}>What We’ve Collected</Text>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Parent Information</Text>
        {parent ? (
          <Text style={styles.value}>Name: {parent.name}</Text>
        ) : (
          <Text style={styles.placeholder}>No parent data stored.</Text>
        )}
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Child Information</Text>
        {child ? (
          <>
            <Text style={styles.value}>Name: {child.name}</Text>
            <Text style={styles.value}>
              Date of Birth: {new Date(child.dob).toLocaleDateString()}
            </Text>
            {child.themePreferences && child.themePreferences.length > 0 ? (
                <Text style={styles.value}>
                    Themes: {child.themePreferences.join(', ')}
                </Text>
                ) : (
                <Text style={styles.placeholder}>No theme preferences.</Text>
                )}
            </>
            ) : (
          <Text style={styles.placeholder}>No child data stored.</Text>
        )}
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Privacy Settings</Text>
        {privacy ? (
          <>
            <Text style={styles.value}>
              Share Anonymous Analytics: {privacy.shareAnalytics ? 'Yes' : 'No'}
            </Text>
            <Text style={styles.value}>
              Share Data with Pediatrician: {privacy.shareWithPediatrician ? 'Yes' : 'No'}
            </Text>
            <Text style={styles.value}>
              Allow Notifications: {privacy.allowNotifications ? 'Yes' : 'No'}
            </Text>
          </>
        ) : (
          <Text style={styles.placeholder}>No privacy settings stored.</Text>
        )}
      </View>
    </ScrollView>
  )
}

const styles = StyleSheet.create({
  container: {
    padding: 16,
  },
  heading: {
    fontSize: 26,
    fontWeight: 'bold',
    marginBottom: 24,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
    marginBottom: 8,
  },
  value: {
    fontSize: 16,
    marginBottom: 4,
  },
  placeholder: {
    fontSize: 16,
    fontStyle: 'italic',
    color: '#666',
  },
})

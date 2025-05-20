// src/screens/WonderScreen.tsx
import React, { useState } from 'react'
import { View, ScrollView, StyleSheet } from 'react-native'
import { useTheme } from 'styled-components/native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { useNavigation } from '@react-navigation/native'
import type { StackNavigationProp } from '@react-navigation/stack'
import { RootStackParamList } from '../../navigation/AppNavigator'

import { wonderSections } from '../../data/wonderSections'
import WonderCardList from '../../components/wonderscreen/WonderCardList'
import TopNav from '../../components/common/TopNav'
import BottomNav from '../../components/common/BottomNav'
import GameIcon from '../../assets/wonderscreen/GameIcon'
import ARIcon   from '../../assets/wonderscreen/ARIcon'
import VRIcon from '../../assets/wonderscreen/VRIcon'
import type { WonderCardData } from '../../types/WonderCardData'
import { sizes } from '../../styles/theme'


export const WonderScreen = () => {
  const [selectedFilter, setSelectedFilter] = useState<'all'|'ar'|'vr'|'play'>('all')
  const theme = useTheme()
  const navigation = useNavigation<StackNavigationProp<RootStackParamList>>()

  const filterCards = (cards: WonderCardData[]) =>
    selectedFilter === 'all'
      ? cards
      : cards.filter(card => card.features?.includes(selectedFilter))

  const onIconPress = (filter: 'ar' | 'vr' | 'play') => {
    setSelectedFilter(prev => (prev === filter ? 'all' : filter))
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.darkAccent }]}>
      {/* Top */}
      <TopNav navigation={navigation} />

      {/* Filters */}
      <View style={styles.iconRow}>
        <VRIcon
          fill={ selectedFilter === 'vr' ? theme.colors.secondaryBackground : theme.colors.muted }
          onPress={() => onIconPress('vr')}
        />
        <GameIcon
          fill={ selectedFilter === 'play' ? theme.colors.secondaryBackground : theme.colors.muted }
          style={styles.iconSpacing}
          onPress={() => onIconPress('play')}
        />
        <ARIcon
          fill={ selectedFilter === 'ar' ? theme.colors.secondaryBackground : theme.colors.muted }
          style={styles.iconSpacing}
          onPress={() => onIconPress('ar')}
        />
      </View>

      {/* Scrollable Content */}
      <View style={styles.content}>
        <ScrollView
          contentContainerStyle={{
            paddingBottom: sizes.bottomNavHeight + 16
          }}
          showsVerticalScrollIndicator={false}
        >
          {wonderSections.map(section => (
            <WonderCardList
              key={section.id}
              title={section.title}
              data={filterCards(section.data)}
            />
          ))}
        </ScrollView>
      </View>

      {/* Fixed Bottom Nav */}
      <BottomNav navigation={navigation} activeScreen="Wonder" />
    </SafeAreaView>
  )
}

export default WonderScreen

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: sizes.bottomNavHeight,
  },
  iconRow: {
    flexDirection: 'row',
    marginTop: 20,        
    marginLeft: 16,
    justifyContent: 'center'
  },
  iconSpacing: {
    marginLeft: 50,  
  }
})

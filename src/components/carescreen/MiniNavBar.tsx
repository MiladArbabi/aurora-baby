import React from 'react';
import { View, TouchableOpacity, StyleSheet } from 'react-native';
import TrackerIcon from '../../assets/carescreen/mini-navbar/TrackerIcon';
import GraphIcon from '../../assets/carescreen/mini-navbar/GraphIcon';
import CardsIcon from '../../assets/carescreen/mini-navbar/CardsIcon';

export type MiniTab = 'tracker' | 'graph' | 'cards';

interface Props {
  onNavigate?: (screen: MiniTab) => void;
}

const MiniNavBar = ({ onNavigate }: Props) => {
  return (
    <View style={styles.container}>
      <TouchableOpacity 
        testID="cards-icon" 
        onPress={() => onNavigate?.('cards')}
        style={styles.iconContainer}
      >
        <CardsIcon />
      </TouchableOpacity>
      <TouchableOpacity 
        testID="tracker-icon" 
        onPress={() => onNavigate?.('tracker')}
        style={styles.iconContainer}
      >
        <TrackerIcon />
      </TouchableOpacity>
      <TouchableOpacity 
        testID="graph-icon" 
        onPress={() => onNavigate?.('graph')}
        style={styles.iconContainer}
      >
        <GraphIcon />
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  iconContainer: {
    marginHorizontal: 10,
  },
});

export default MiniNavBar;

import React from 'react';
import { View, TouchableOpacity } from 'react-native';
import TrackerIcon from '../../assets/icons/carescreen/TrackerIcon';
import GraphIcon from '../../assets/icons/carescreen/GraphIcon';
import CardsIcon from '../../assets/icons/carescreen/CardsIcon';

export type MiniTab = 'tracker' | 'graph' | 'cards';

interface Props {
  onNavigate?: (screen: MiniTab) => void;
}

const MiniNavBar = ({ onNavigate }: Props) => {
  return (
    <View style={{ flexDirection: 'row', justifyContent: 'space-around' }}>
      <TouchableOpacity testID="tracker-icon" onPress={() => onNavigate?.('tracker')}>
        <TrackerIcon />
        </TouchableOpacity>
        <TouchableOpacity testID="graph-icon" onPress={() => onNavigate?.('graph')}>
        <GraphIcon />
        </TouchableOpacity>
        <TouchableOpacity testID="cards-icon" onPress={() => onNavigate?.('cards')}>
        <CardsIcon />
        </TouchableOpacity>
    </View>
  );
};

export default MiniNavBar;

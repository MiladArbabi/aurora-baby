import React from 'react';
import { View, TouchableOpacity } from 'react-native';
import TrackerIcon from '../../assets/icons/carescreen/TrackerIcon';
import GraphIcon from '../../assets/icons/carescreen/GraphIcon';
import CardsIcon from '../../assets/icons/carescreen/CardsIcon';

interface Props {
  onNavigate?: (screen: 'Tracker' | 'Graph' | 'Cards') => void;
}

const MiniNavBar = ({ onNavigate }: Props) => {
  return (
    <View style={{ flexDirection: 'row', justifyContent: 'space-around' }}>
      <TouchableOpacity testID="tracker-icon" onPress={() => onNavigate?.('Tracker')}>
        <TrackerIcon />
      </TouchableOpacity>
      <TouchableOpacity testID="graph-icon" onPress={() => onNavigate?.('Graph')}>
        <GraphIcon />
      </TouchableOpacity>
      <TouchableOpacity testID="cards-icon" onPress={() => onNavigate?.('Cards')}>
        <CardsIcon />
      </TouchableOpacity>
    </View>
  );
};

export default MiniNavBar;

import React from 'react';
import { View } from 'react-native';

const Carousel = ({ data, renderItem, sliderWidth, itemWidth }: any) => (
  <View style={{ width: sliderWidth }}>
    {data.map((item: any, index: number) => (
      <View key={index} style={{ width: itemWidth }}>
        {renderItem({ item, index })}
      </View>
    ))}
  </View>
);

export default Carousel;
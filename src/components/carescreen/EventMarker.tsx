import React from 'react';
import { View, StyleSheet } from 'react-native';

interface Props {
  size: number;         // Tracker diameter
  fraction: number;     // 0–1
  color: string;
  testID?: string;
}

const EventMarker: React.FC<Props> = ({
  size,
  fraction,
  color,
  testID,
}) => {
  const radius = size / 2;
  const angle = fraction * 2 * Math.PI - Math.PI / 2;
  const x = radius + radius * Math.cos(angle);
  const y = radius + radius * Math.sin(angle);
  const markerSize = 12;

  return (
    <View
      testID={testID}
      style={[
        styles.marker,
        {
          left: x - markerSize / 2,
          top: y - markerSize / 2,
          backgroundColor: color,
          width: markerSize,
          height: markerSize,
          borderRadius: markerSize / 2,
        },
      ]}
    />
  );
};

const styles = StyleSheet.create({
  marker: {
    position: 'absolute',
    zIndex: 5,
  },
});

export default EventMarker;
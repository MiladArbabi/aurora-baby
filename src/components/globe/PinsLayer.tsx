// src/components/globe/PinsLayer.tsx
import React, { memo } from 'react';
import Svg, { G, Circle } from 'react-native-svg';
import { isFrontHemisphere } from '../../utils/globeUtils';
import type { Region } from '../../types/globe';

export const PinsLayer = memo(({
  regions,
  projection,
  rotation,
  onRegionPress,
}: {
  regions: Region[];
  projection: any;
  rotation: [number, number];
  onRegionPress: (key: string) => void;
}) => (
  <G>
    {regions.map(r => {
      if (!isFrontHemisphere(r.center, rotation)) return null;
      const [x,y] = projection(r.center)!;
      return (
        <G
          key={r.key}
          transform={`translate(${x},${y})`}
          onPress={() => onRegionPress(r.key)}
          hitSlop={{ top:10, bottom:10, left:10, right:10 }}
        >
          <Circle r={8} fill={r.baseColor} stroke="#fff" strokeWidth={2}/>
        </G>
      );
    })}
  </G>
));

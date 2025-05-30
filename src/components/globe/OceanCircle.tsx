// src/components/globe/OceanCircle.tsx
import React from 'react';
import Svg, { Circle } from 'react-native-svg';

export const OceanCircle: React.FC<{ size: number }> = ({ size }) => (
  <Circle
    cx={size/2}
    cy={size/2}
    r={size*0.4}
    fill="#B19CFF"
    stroke="#FFF"
    strokeWidth={1}
  />
);

import React from 'react';
import { View } from 'react-native';
import Svg from 'react-native-svg';

export interface SliceRingProps {
  /** Diameter of the full ring */
  size: number;
  /** Width of the ring stroke */
  ringWidth: number;
  /** Array of 24 booleans indicating which hour slices are "filled" */
  filledSlices: boolean[];
  /** Color for "unfilled" slices (light variant) */
  lightColor: string;
  /** Color for "filled" slices (dark variant) */
  darkColor: string;
}

/**
 * SliceRing renders a circular ring divided into 24 equal hour-sized slices.
 * Each slice uses darkColor if filledSlices[index] is true, otherwise lightColor.
 */
const SliceRing: React.FC<SliceRingProps> = ({
  size,
  ringWidth,
  filledSlices,
  lightColor,
  darkColor,
}) => {
  // TODO: Implement drawing of 24 arc segments and optional dividers
  return (
    <View style={{ width: size, height: size, justifyContent: 'center', alignItems: 'center' }}>
      <Svg width={size} height={size}>
        {/* Placeholder: actual arcs to be implemented in subsequent issues */}
      </Svg>
    </View>
  );
};

export default SliceRing;
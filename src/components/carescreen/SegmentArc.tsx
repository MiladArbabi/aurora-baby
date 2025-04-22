import React from 'react';
import { StyleSheet } from 'react-native';
import Svg, { Circle } from 'react-native-svg';

interface Props {
  size: number;
  strokeWidth: number;
  startFraction: number; // 0–1 around the circle
  endFraction: number;   // 0–1 around the circle
  color: string;
  testID?: string;
}

const SegmentArc: React.FC<Props> = ({
  size,
  strokeWidth,
  startFraction,
  endFraction,
  color,
  testID,
}) => {
  const r = size / 2 - strokeWidth / 2;
  const circumference = 2 * Math.PI * r;
  const arcLen = (endFraction - startFraction) * circumference;
  const gapLen = circumference - arcLen;
  // offset so that fraction=0 starts at top (–90°)
  const offset = circumference * (1 / 4 + startFraction);

  return (
    <Svg
      width={size}
      height={size}
      style={styles.svg}
      testID={testID}
    >
      <Circle
        cx={size / 2}
        cy={size / 2}
        r={r}
        stroke={color}
        strokeWidth={strokeWidth}
        fill="none"
        strokeDasharray={`${arcLen},${gapLen}`}
        strokeDashoffset={offset}
        strokeLinecap="round"
      />
    </Svg>
  );
};

const styles = StyleSheet.create({
  svg: {
    transform: [{ rotate: '-90deg' }],
    position: 'absolute',
    top: 0,
    left: 0,
  },
});

export default SegmentArc;
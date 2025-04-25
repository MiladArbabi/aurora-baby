//src/assets/whispr/Layer.tsx
import * as React from "react";
import Svg, { Path } from "react-native-svg";
import type { SvgProps } from "react-native-svg";

const ArrowIcon = (props: SvgProps) => (
  <Svg viewBox="0 0 32 32" {...props}>
    <Path d="M23.778 11.778a1 1 0 0 1-.707-.293L16 4.415l-7.071 7.07a1 1 0 1 1-1.414-1.414l7.778-7.778a1 1 0 0 1 1.414 0l7.778 7.778a1 1 0 0 1-.707 1.707" />
    <Path d="M16 30a1 1 0 0 1-1-1V3a1 1 0 0 1 2 0v26a1 1 0 0 1-1 1" />
  </Svg>
);
export default ArrowIcon;

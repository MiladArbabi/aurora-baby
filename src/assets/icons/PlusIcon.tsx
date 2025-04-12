import React from "react";
import Svg, { Path, SvgProps } from "react-native-svg";

const PlusIcon = (props: SvgProps) => (
  <Svg viewBox="0 0 128 128" {...props}>
    <Path
      fill="#FFD700" // Sunny Gold
      d="M128 50.502v26.996H77.498V128H50.502V77.498H0V50.502h50.502V0h26.996v50.502z"
    />
  </Svg>
);

export default PlusIcon;
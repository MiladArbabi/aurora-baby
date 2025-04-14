import React from "react";
import Svg, { SvgProps, Circle } from "react-native-svg";

const DiaperArc = (props: SvgProps) => (
<Svg width="243" height="243" viewBox="0 0 243 243" fill="none" {...props}>
  <Circle cx="121.5" cy="117.5" r="112.5" stroke="#FF9D7F" stroke-width="10"/>
</Svg>
);

export default DiaperArc;
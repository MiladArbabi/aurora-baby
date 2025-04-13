import React from "react";
import Svg, { SvgProps, Circle } from "react-native-svg";

const MoodArc = (props: SvgProps) => (
<Svg width="305" height="305" viewBox="0 0 305 305" fill="none" {...props}>
  <Circle cx="152.5" cy="152.5" r="137.5" stroke="#7EFF94" stroke-width="10" shape-rendering="crispEdges"/>
</Svg>
);

export default MoodArc;

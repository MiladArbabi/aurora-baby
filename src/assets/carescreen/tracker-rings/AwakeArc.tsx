import React from "react";
import Svg, { SvgProps, Circle } from "react-native-svg";

const AwakeArc = (props: SvgProps) => (
<Svg width="168" height="168" viewBox="0 0 168 168" fill="none" {...props}>
  <Circle cx="84" cy="80" r="75" stroke="#FFF59D" stroke-width="10" shape-rendering="crispEdges"/>
</Svg>
);

export default AwakeArc;

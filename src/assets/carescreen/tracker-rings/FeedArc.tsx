import React from "react";
import Svg, { SvgProps, Circle } from "react-native-svg";

const FeedArc = (props: SvgProps) => (
<Svg width="218" height="218" viewBox="0 0 218 218" fill="none" {...props}>
  <Circle cx="109" cy="105" r="100" stroke="#49FFEE" stroke-width="10" shape-rendering="crispEdges"/>
</Svg>
);

export default FeedArc;
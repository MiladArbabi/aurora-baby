import React from "react";
import Svg, { SvgProps, Rect } from "react-native-svg";

const HandleBar = (props: SvgProps) => (
  <Svg width="151" height="15" viewBox="0 0 151 15" {...props}>
      <Rect x="0.5" width="150" height="15" rx="7.5" fill="white"/>
  </Svg>
);

export default HandleBar;
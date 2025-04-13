import React from "react";
import Svg, { SvgProps, Rect } from "react-native-svg";

const MenuHandleBar = (props: SvgProps) => (
<Svg width="126" height="10" viewBox="0 0 126 10" fill="none" {...props}>
  <Rect x="1" y="0.5" width="124" height="9" rx="4.5" fill="white" stroke="white"/>
</Svg>
);

export default MenuHandleBar;
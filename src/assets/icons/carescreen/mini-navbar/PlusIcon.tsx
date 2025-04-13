import React from "react";
import Svg, { Path, SvgProps, Circle } from "react-native-svg";

const PlusIcon = (props: SvgProps) => (
<Svg width="70" height="70" viewBox="0 0 70 70" fill="none" {...props}>
  <Circle cx="35" cy="34" r="25" fill="#453F4E"/>
  <Path d="M32.072 31.72V23.144H38.536V31.72H47.112V38.184H38.536V46.76H32.072V38.184H23.496V31.72H32.072Z" fill="white"/>
</Svg>
);

export default PlusIcon;

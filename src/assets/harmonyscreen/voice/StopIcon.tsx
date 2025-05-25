// src/assets/harmonyscreen/voice/StopIcon.tsx
import React from "react";
import Svg, { Path, G, Rect, Defs,ClipPath, SvgProps } from "react-native-svg";

interface IconProps extends SvgProps {
  fill: string;
}

const StopIcon: React.FC<IconProps> = ({ fill, ...props }) => (  
  <Svg width="50" height="50" viewBox="0 0 50 50" {...props}>
    <Path d="M49.5 0.5V49.5H0.5V0.5H49.5Z" fill={fill} stroke={fill} stroke-linejoin="round"/>
  </Svg>
);



export default StopIcon;


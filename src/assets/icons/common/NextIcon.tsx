// src/assets/icons/common/NextIcon.tsx
import React from "react";
import Svg, { Path, SvgProps } from "react-native-svg";

interface IconProps extends SvgProps {
  stroke: string;
}

const NextIcon: React.FC<IconProps> = ({ stroke, ...props }) => (  
  <Svg width="50" height="50" viewBox="0 0 50 50" {...props}>
    <Path d="M25 46.875C37.0812 46.875 46.875 37.0812 46.875 25C46.875 12.9188 37.0812 3.125 25 3.125C12.9188 3.125 3.125 12.9188 3.125 25C3.125 37.0812 12.9188 46.875 25 46.875Z" 
    fill="none"
    stroke={stroke} 
    stroke-width="2" 
    stroke-linecap="round" 
    stroke-linejoin="round"
    />
    <Path d="M21.2083 37.5937L30.3252 27.7548C30.9902 27.0371 31.3617 26.0961 31.3662 25.1177C31.3707 24.1393 31.0078 23.1949 30.3495 22.4712L21.1936 12.4065" 
    stroke={stroke} 
    stroke-width="2" 
    stroke-linecap="round" 
    stroke-linejoin="round"
    />
  </Svg>
);

export default NextIcon;





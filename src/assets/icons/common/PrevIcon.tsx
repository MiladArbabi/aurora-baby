// src/assets/icons/common/PrevIcon.tsx
import React from "react";
import Svg, { Path, SvgProps } from "react-native-svg";

interface IconProps extends SvgProps {
  stroke: string;
}

const PrevIcon: React.FC<IconProps> = ({ fill, stroke, ...props }) => (  
  <Svg width="50" height="50" viewBox="0 0 50 50" {...props}>
    <Path d="M25 46.875C12.9188 46.875 3.125 37.0812 3.125 25C3.125 12.9188 12.9188 3.125 25 3.125C37.0812 3.125 46.875 12.9188 46.875 25C46.875 37.0812 37.0812 46.875 25 46.875Z" 
    fill="none"
    stroke={stroke} 
    stroke-width="2" 
    stroke-linecap="round" 
    stroke-linejoin="round"/>
    <Path d="M28.7917 37.5937L19.6748 27.7548C19.0098 27.0371 18.6383 26.0961 18.6338 25.1177C18.6293 24.1393 18.9922 23.1949 19.6505 22.4712L28.8064 12.4065" 
    stroke={stroke} 
    stroke-width="2" 
    stroke-linecap="round" 
    stroke-linejoin="round"/>
  </Svg>
);

export default PrevIcon;




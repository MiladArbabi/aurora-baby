// src/assets/harmonyscreen/voice/PlayIcon.tsx
import React from "react";
import Svg, { Path, SvgProps } from "react-native-svg";

interface IconProps extends SvgProps {
  fill: string;
}

const PlayIcon: React.FC<IconProps> = ({ fill, ...props }) => (  
  <Svg width="50" height="50" viewBox="0 0 50 50" {...props}>
    <Path d="M7.20798 46.0617C3.8854 47.697 0 45.2789 0 41.5756V8.42437C0 4.72115 3.8854 2.30297 7.20799 3.93831L40.8855 20.5139C44.6081 22.3462 44.6081 27.6538 40.8854 29.4861L7.20798 46.0617Z" 
    fill={fill}
    stroke-linejoin="round"
    />
  </Svg>
);

export default PlayIcon;


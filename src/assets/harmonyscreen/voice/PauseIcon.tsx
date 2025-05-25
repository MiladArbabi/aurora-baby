// src/assets/harmonyscreen/voice/PauseIcon.tsx
import React from "react";
import Svg, { Path, SvgProps } from "react-native-svg";

interface IconProps extends SvgProps {
  fill: string;
}

const PauseIcon: React.FC<IconProps> = ({ fill, ...props }) => (  
  <Svg width="50" height="50" viewBox="0 0 50 50" {...props}>
    <Path d="M18.75 42.1875C18.75 46.5022 15.2522 50 10.9375 50C6.62278 50 3.125 46.5022 3.125 42.1875V7.8125C3.125 3.49778 6.62278 0 10.9375 0C15.2522 0 18.75 3.49778 18.75 7.8125V42.1875ZM46.875 7.8125C46.875 3.49778 43.3772 0 39.0625 0C34.7478 0 31.25 3.49778 31.25 7.8125V42.1875C31.25 46.5022 34.7478 50 39.0625 50C43.3772 50 46.875 46.5022 46.875 42.1875V7.8125Z" 
    fill={fill}
    stroke-linejoin="round"
    />
  </Svg>
);

export default PauseIcon;



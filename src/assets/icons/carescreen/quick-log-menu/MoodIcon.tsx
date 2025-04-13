import React from "react";
import Svg, { Path, SvgProps } from "react-native-svg";

const MoodIcon = (props: SvgProps) => (
<Svg width="100%" height="100%" viewBox="0 0 48 48" preserveAspectRatio="xMidYMid meet" {...props}>
<Path d="M24 0a24 24 0 1024 24A24.028 24.028 0 0024 0zm0 46a22 22 0 1122-22 22.025 22.025 0 01-22 22z" 
      fill="#453F4E"
      />
      <Path d="M13.447 19.9l6-3a1 1 0 000-1.79l-6-3-.894 1.79 4.211 2.1-4.211 2.105zM34.553 12.105l-6 3a1 1 0 000 1.79l6 3 .894-1.79L31.236 16l4.211-2.1zM24 26a7 7 0 107 7 7.008 7.008 0 00-7-7zm0 12a5 5 0 115-5 5.006 5.006 0 01-5 5zM33 21h2v2h-2zM33 25h2v2h-2zM13 21h2v2h-2zM13 25h2v2h-2z" 
      fill="#453F4E"
      />
  </Svg>
);

export default MoodIcon;


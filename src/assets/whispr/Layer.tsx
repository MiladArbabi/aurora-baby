//src/assets/whispr/Layer.tsx
import * as React from "react";
import Svg, { Path } from "react-native-svg";
import type { SvgProps } from "react-native-svg";
const LayerIcon = (props: SvgProps) => (
  <Svg viewBox="0 0 32 32" {...props}>
    <Path
      d="M31.42 23.09 24.79 20l6.63-3.09a1 1 0 0 0 0-1.82l-8.57-4a1 1 0 0 0-.85 1.82L28.64 16 16 21.9 3.36 16 10 12.91a1 1 0 0 0-.84-1.82l-8.57 4a1 1 0 0 0 0 1.82L7.21 20 .58 23.09a1 1 0 0 0 0 1.82C5.17 27.05 5 27 5.27 27a1 1 0 0 0 .42-1.91L3.37 24l6.2-2.9c6.52 3 6.11 2.9 6.43 2.9s-.08.14 6.43-2.9l6.21 2.9L16 29.9l-6.7-3.13a1 1 0 0 0-.84 1.82l7.12 3.32a1 1 0 0 0 .84 0l15-7a1 1 0 0 0 0-1.82"
        fill= "#38004d"
    />
    <Path
      d="M16 16c-.32 0 .89.52-15.42-7.09a1 1 0 0 1 0-1.82l15-7a1 1 0 0 1 .84 0l15 7a1 1 0 0 1 0 1.82C15.08 16.53 16.33 16 16 16M3.36 8 16 13.9 28.64 8 16 2.1Z"
        fill= "#9f85ec"
    />
  </Svg>
);
export default LayerIcon;

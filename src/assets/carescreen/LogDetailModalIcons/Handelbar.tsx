import * as React from "react";
import Svg, { Rect, SvgProps } from "react-native-svg";
const Handelbar = (props: SvgProps) => (
  <Svg
    width={150}
    height={10}
    fill="none"
    {...props}
  >
    <Rect
      width={149}
      height={9}
      x={0.5}
      y={0.5}
      fill="#fff"
      stroke="#B3A5C4"
      rx={4.5}
    />
  </Svg>
);
export default Handelbar;

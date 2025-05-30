// src/components/globe/LandLayer.tsx
import React from 'react';
import Svg, { Defs, Filter, FeGaussianBlur, G, Path } from 'react-native-svg'
import { landFeatures } from '../../data/world-110m';

export const LandLayer = ({ pathGen }: { pathGen: any }) => (
<>
    <Defs>
      <Filter id="soften" x="-20%" y="-20%" width="140%" height="140%">
        <FeGaussianBlur in="SourceGraphic" stdDeviation="1.4" />
      </Filter>
    </Defs>
    <G filter="url(#soften)">
      {landFeatures.features.map((f: any, i: number) => (
        <Path
          key={i}
          d={pathGen(f)!}
          fill="#34C759"
          stroke="#FFF"
          strokeWidth={1.5}
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      ))}
    </G>
  </>
)
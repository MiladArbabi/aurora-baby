// src/types/globeTypes.ts
import type { Feature, Geometry } from 'geojson';
import type { ViewStyle } from 'react-native';
import type { RegionLayerDef } from '../data/StaticRegions';

export interface RegionDef {
  id: string;
  regionName: string;
  style: ViewStyle;
  color: string;
  hoverColor: string;
  layers: RegionLayerDef[];
}

export type GlobeOnRegionPress = (regionId: string) => void;

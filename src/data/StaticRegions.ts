// src/data/StaticRegions.ts
import type { ViewStyle } from 'react-native';

/**
 * Each region on our globe has **four layers**, and each layer can hold multiple stories.
 */
export interface RegionLayerDef {
  layer: 'Surface' | 'Underwater' | 'Sky' | 'Undersurface';
  storyIds: string[];
}

export interface RegionDef {
  id: string;
  regionName: string;
  style: ViewStyle;
  color: string;
  hoverColor: string;
  layers: RegionLayerDef[];
}

/**
 * In each layer’s `storyIds`, you must refer to the IDs that appear in `STORIES` below.
 */
export const STATIC_REGIONS: RegionDef[] = [
  {
    id: 'africa',
    regionName: 'Africa',
    style: {
      position: 'absolute',
      top: '45%',
      left: '45%',
      width: 50,
      height: 70,
      borderRadius: 25,
      transform: [{ translateX: -25 }, { translateY: -35 }],
    },
    color: '#34D399',
    hoverColor: '#059669',
    layers: [
      { layer: 'Surface',    storyIds: ['lion-and-mouse', 'savanna-night'] },
      { layer: 'Underwater', storyIds: ['river-journey'] },
      { layer: 'Sky',        storyIds: [] },
      { layer: 'Undersurface', storyIds: [] },
    ],
  },
  {
    id: 'asia',
    regionName: 'Asia',
    style: {
      position: 'absolute',
      top: '30%',
      right: '25%',
      width: 70,
      height: 50,
      borderRadius: 25,
      transform: [{ rotate: '15deg' }],
    },
    color: '#10B981',
    hoverColor: '#047857',
    layers: [
      { layer: 'Surface',     storyIds: ['magic-bamboo', 'dragon-legends'] },
      { layer: 'Underwater',  storyIds: ['coral-kingdom'] },
      { layer: 'Sky',         storyIds: ['mountain-mysteries'] },
      { layer: 'Undersurface', storyIds: [] },
    ],
  },
  {
    id: 'europe',
    regionName: 'Europe',
    style: {
      position: 'absolute',
      top: '25%',
      left: '55%',
      width: 40,
      height: 40,
      borderRadius: 20,
      transform: [{ translateX: -20 }, { translateY: -20 }],
    },
    color: '#A3E635',
    hoverColor: '#65A30D',
    layers: [
      { layer: 'Surface',      storyIds: ['northern-lights'] },
      { layer: 'Underwater',   storyIds: [] },
      { layer: 'Sky',          storyIds: ['sky-dancers'] },
      { layer: 'Undersurface', storyIds: ['cave-secrets'] },
    ],
  },
  {
    id: 'americas',
    regionName: 'Americas',
    style: {
      position: 'absolute',
      top: '50%',
      left: '20%',
      width: 40,
      height: 70,
      borderRadius: 20,
      transform: [{ rotate: '-15deg' }],
    },
    color: '#14B8A6',
    hoverColor: '#0F766E',
    layers: [
      { layer: 'Surface',      storyIds: ['rainbow-bridge'] },
      { layer: 'Underwater',   storyIds: ['turtle-odyssey'] },
      { layer: 'Sky',          storyIds: ['eagle-journey'] },
      { layer: 'Undersurface', storyIds: [] },
    ],
  },
  {
    id: 'oceania',
    regionName: 'Oceania',
    style: {
      position: 'absolute',
      bottom: '20%',
      right: '15%',
      width: 30,
      height: 30,
      borderRadius: 15,
    },
    color: '#22D3EE',
    hoverColor: '#0E7490',
    layers: [
      { layer: 'Surface',      storyIds: ['island-memories'] },
      { layer: 'Underwater',   storyIds: ['singing-whale', 'coral-kingdom'] },
      { layer: 'Sky',          storyIds: [] },
      { layer: 'Undersurface', storyIds: ['reef-lights'] },
    ],
  },
];

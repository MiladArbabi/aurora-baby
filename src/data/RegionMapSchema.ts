// src/data/RegionMapSchema.ts
import type { Region } from "../types/globe";

// Instead of a Record<string,RegionMeta>, export a typed array of Regions
export const regions: Region[] = [
  {
    key: 'dreamSky',
    displayName: 'Dream Sky',
    svgPaths: ['M10,20 L30,20 L30,40 L10,40 Z'],
    spectTags: ['SLEEP'],
    baseColor: '#9EB7FF',
    center: [18, 60],
    clipAngleAdjust: +5,
  },
  {
    key: 'junglewake',
    displayName: 'Verdant Junglewake',
    svgPaths: ['M50,90 C70,50 110,50 130,90 C150,130 110,150 70,130 Z'],
    spectTags: ['MOOD'],
    baseColor: '#8BC34A',
    center: [0, 42],
    clipAngleAdjust: -5,
  },
  /* {
    key: 'mossroot',
    displayName: 'Mossroot Hollow',
    svgPaths: ['M60,110 C80,150 120,150 140,110 C160,70 120,50 80,70 Z'],
    spectTags: ['HEALTH'],
    baseColor: '#A1887F',
    center: [21, 0],
    clipAngleAdjust: +5,
  },
  {
    key: 'rootspire',
    displayName: 'Rootspire Heights',
    svgPaths: ['M100,60 C140,40 180,60 160,100 C140,140 100,120 80,80 Z'],
    spectTags: ['MOOD'],
    baseColor: '#CE93D8',
    center: [51, 38],
    clipAngleAdjust: +5,
  },
  {
    key: 'salmonRun',
    displayName: 'Starcloud Salmon Run',
    svgPaths: ['M140,80 L180,80 L180,120 L140,120 Z'],
    spectTags: ['FEED'],
    baseColor: '#F48FB1',
    center: [138, 36],
    clipAngleAdjust: +5,
  },
  {
    key: 'crystalis',
    displayName: 'Crystalis Reach',
    svgPaths: ['M80,10 C140,10 200,30 200,90 C200,150 140,170 80,150 C20,130 0,90 0,50 Z'],
    spectTags: ['HEALTH'],
    baseColor: '#FFFFFF',
    center: [-100, 60],
    clipAngleAdjust: +5,
  }, */
];
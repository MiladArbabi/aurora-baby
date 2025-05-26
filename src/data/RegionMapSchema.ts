// src/data/RegionMapSchema.ts

export interface RegionMeta {
    key: string;
    displayName: string;
    /** For 2D: SVG path d strings for hit-testing */
    svgPaths?: string[];
    /** For future 3D: model reference (e.g. GLTF node) */
    modelRef?: string;
    /** Which care tags unlock or bloom this region */
    spectTags: Array<'SLEEP' | 'MOOD' | 'FEED' | 'HEALTH'>;
    /** Icon to render on globe */
    iconName: string;
    /** Base color for the region */
    baseColor: string;
  }
  
  export const RegionMap: Record<string, RegionMeta> = {
    dreamSky: {
      key: 'dreamSky',
      displayName: 'Dream Sky',
      svgPaths: [
        // TODO: replace with accurate SVG path coords
        'M10,20 L30,20 L30,40 L10,40 Z',
      ],
      spectTags: ['SLEEP'],
      iconName: 'StarIcon',
      baseColor: '#9EB7FF',
    },
    // …add more regions here in subsequent issues
  };
  
// src/data/RegionMapSchema.ts
export interface RegionMeta {
      key: string;
      displayName: string;
      svgPaths?: string[];      // for 2D hit-testing
      modelRef?: string;        // for future 3D
      spectTags: Array<'SLEEP'|'MOOD'|'FEED'|'HEALTH'>;
      iconName: string;
      baseColor: string;
    }
    
    export const RegionMap: Record<string, RegionMeta> = {
      dreamSky: {
        key: 'dreamSky',
        displayName: 'Dream Sky',
        svgPaths: [
          'M10,20 L30,20 L30,40 L10,40 Z',  // TODO: replace with real coords
        ],
        spectTags: ['SLEEP'],
        iconName: 'StarIcon',
        baseColor: '#9EB7FF',
      },
      // …other regions will go here
    };
    
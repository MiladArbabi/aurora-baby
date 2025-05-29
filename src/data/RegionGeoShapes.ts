// src/data/RegionGeoShapes.ts
import type { Feature, Geometry } from 'geojson';

/**
 * Approximate GeoJSON shapes for each region, centered and sized small for testing.
 * Replace these squares/patches with accurate GeoJSON borders when available.
 */
export const RegionGeoShapes: Record<string, Feature<Geometry>> = {
  dreamSky: {
    type: 'Feature',
    properties: {},
    geometry: {
      type: 'Polygon',
      coordinates: [
        // small 10°×10° square around center [0,0]
        [
          [-5, -5], [5, -5], [5, 5], [-5, 5], [-5, -5]
        ]
      ]
    }
  },
  junglewake: {
    type: 'Feature',
    properties: {},
    geometry: {
      type: 'Polygon',
      coordinates: [
        // square around center [20,0]
        [
          [15, -5], [25, -5], [25, 5], [15, 5], [15, -5]
        ]
      ]
    }
  },
  mossroot: {
    type: 'Feature',
    properties: {},
    geometry: {
      type: 'Polygon',
      coordinates: [
        // square around center [10,20]
        [
          [5, 15], [15, 15], [15, 25], [5, 25], [5, 15]
        ]
      ]
    }
  },
  rootspire: {
    type: 'Feature',
    properties: {},
    geometry: {
      type: 'Polygon',
      coordinates: [
        // square around center [50,45]
        [
          [45, 40], [55, 40], [55, 50], [45, 50], [45, 40]
        ]
      ]
    }
  },
  salmonRun: {
    type: 'Feature',
    properties: {},
    geometry: {
      type: 'Polygon',
      coordinates: [
        // square around center [140,35]
        [
          [135, 30], [145, 30], [145, 40], [135, 40], [135, 30]
        ]
      ]
    }
  },
  crystalis: {
    type: 'Feature',
    properties: {},
    geometry: {
      type: 'Polygon',
      coordinates: [
        // square around center [-150,65]
        [
          [-155, 60], [-145, 60], [-145, 70], [-155, 70], [-155, 60]
        ]
      ]
    }
  }
};

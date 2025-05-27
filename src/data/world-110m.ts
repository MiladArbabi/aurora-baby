// src/data/world-110m.ts
import { feature } from 'topojson-client';
// the correct path within world-atlas@2.x
import land110 from 'world-atlas/land-110m.json';

export const landFeatures = feature(
  land110 as any,
  (land110 as any).objects.land
);
export const sphereFeature = { type: 'Sphere' };

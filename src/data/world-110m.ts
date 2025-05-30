// src/data/world-110m.ts
import { feature } from 'topojson-client';
import type { FeatureCollection, Geometry, GeoJsonProperties } from 'geojson';
// the correct path within world-atlas@2.x
import land50 from 'world-atlas/land-50m.json';

 export const landFeatures: FeatureCollection<Geometry, GeoJsonProperties> = 
 feature( 
 land50 as any,
(land50 as any).objects.land
 ) as any;

export const sphereFeature = { type: 'Sphere' };

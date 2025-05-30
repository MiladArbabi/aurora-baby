// src/data/world-110m.ts
import { feature } from 'topojson-client';
import type { FeatureCollection, Geometry, GeoJsonProperties } from 'geojson';
import land110 from 'world-atlas/land-110m.json';

 export const landFeatures: FeatureCollection<Geometry, GeoJsonProperties> = 
 feature( 
 land110 as any,
(land110 as any).objects.land
 ) as any;

export const sphereFeature = { type: 'Sphere' };

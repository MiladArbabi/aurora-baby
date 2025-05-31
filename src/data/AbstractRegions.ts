// src/data/AbstractRegions.ts
import type { FeatureCollection, Geometry, GeoJsonProperties } from 'geojson'
import { feature } from 'topojson-client'

// We’ll build each blob as a circular-ish polygon around its center.
function makeBlob(lon: number, lat: number, radiusDeg = 20, steps = 32) {
  const coords: [number, number][] = []
  for (let i = 0; i < steps; i++) {
    const θ = (Math.PI * 2 * i) / steps
    const dx = radiusDeg * Math.cos(θ)
    const dy = radiusDeg * Math.sin(θ)
    coords.push([lon + dx, lat + dy])
  }
  coords.push(coords[0]) // close ring
  return {
    type: 'Polygon',
    coordinates: [coords],
  } as Geometry
}

// A FeatureCollection of five abstract blobs
export const abstractRegions: FeatureCollection<Geometry, GeoJsonProperties> = {
  type: 'FeatureCollection',
  features: [
    { type: 'Feature', properties: { key: 'blob1' }, geometry: makeBlob(-60,  20, 25) },
    { type: 'Feature', properties: { key: 'blob2' }, geometry: makeBlob(  40,  30, 20) },
    { type: 'Feature', properties: { key: 'blob3' }, geometry: makeBlob(   0, -20, 30) },
    { type: 'Feature', properties: { key: 'blob4' }, geometry: makeBlob( 100,   0, 15) },
    { type: 'Feature', properties: { key: 'blob5' }, geometry: makeBlob(-120, -10, 18) },
  ],
}

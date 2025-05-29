// src/data/RegionShapes.ts
import type { RegionMeta } from './RegionMapSchema';

// For each region, a very rough, cartoon-style path string.
// (You can draw these in any SVG editor or just eyeball them.)
export const RegionShapes: Record<string, { d: string; color: string }> = {
  junglewake: {
    // A bubbly Europe-like blob
    d: 'M20,60 C40,20 80,20 100,60 C120,100 80,120 40,100 Z',
    color: '#8BC34A',
  },
  mossroot: {
    // A rounded Africa-like blob, just below
    d: 'M60,100 C80,140 120,140 140,100 C160,60 120,40 80,60 Z',
    color: '#A1887F',
  },
  rootspire: {
    // A wide interlocking shape for rootspire
    d: 'M100,40 C140,20 180,40 160,80 C140,120 100,100 80,60 Z',
    color: '#CE93D8',
  },
  starcloud: {
    // A second lavender blob next to rootspire
    d: 'M130,70 C170,50 210,70 190,110 C170,150 130,130 110,90 Z',
    color: '#8E24AA',
  },
  salmonRun: {
    // A long narrow “strip” for the salmon run
    d: 'M180,60 L200,60 L200,140 L180,140 Z',
    color: '#F48FB1',
  },
  crystalis: {
    // A big snow-white high-latitude blob
    d: 'M80,0 C140,0 200,20 200,80 C200,140 140,160 80,140 C20,120 0,80 0,40 Z',
    color: '#FFFFFF',
  },
};

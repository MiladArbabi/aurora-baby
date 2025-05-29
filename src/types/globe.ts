// src/types/globe.ts
import type { Feature, Geometry } from 'geojson';
import type { SvgProps } from 'react-native-svg';

/** A region on the globe, shared by 2D and 3D renderers */
export interface Region {
    /** Unique key, matches RegionMapSchema keys */
    key: string;
    /** Human-friendly display name */
    displayName: string;
    /** Base color for this region */
    baseColor: string;
    /** Optional SVG path(s) for 2D hit-testing or rendering */
    svgPaths?: string[];
    /** Optional GeoJSON feature for 2D path rendering */
    geoShape?: Feature<Geometry>;
    /** Optional GLTF model reference for 3D */
    modelRef?: string;
    /** Geographic center [longitude, latitude] for centering or projection */
    center: [number, number];
    /** SPECT Categories */
    spectTags: Array<'SLEEP'|'MOOD'|'FEED'|'HEALTH'>;

    clipAngleAdjust?: number;
  }
  
  /** Common props for any Globe implementation */
  export interface GlobeCommonProps {
    /** All regions to render */
    regions: Region[];
    /** Callback when user taps a region */
    onRegionPress: (key: string) => void;
    /** Base rotation [lon, lat] in degrees */
    initialRotation?: [number, number];
    /** Base zoom scale */
    initialScale?: number;
    /** Idle auto-rotation speed (deg/sec) */
    autoRotateSpeed?: number;
  }
  
  /** Props specific to the 2D orthographic SVG globe */
  export interface Globe2DProps extends GlobeCommonProps {
    /** Width and height of SVG viewBox */
    viewBoxSize: number;
  }
  
  /** Props specific to a 3D WebGL globe */
  export interface Globe3DProps extends GlobeCommonProps {
    /** URL or asset reference to globe texture */
    textureUrl: string;
    /** Field-of-view or camera settings */
    cameraSettings?: { fov: number; near: number; far: number };
  }
  
import type { Region } from "../types/globeTypes";

// (Utility to make a circular polygon)
function makeCircle(lon: number, lat: number, radiusDeg = 15, steps = 32) {
  const coords: [number,number][] = []
  for (let i = 0; i < steps; i++) {
    const θ = (2 * Math.PI * i) / steps
    coords.push([
      lon + radiusDeg * Math.cos(θ),
      lat + radiusDeg * Math.sin(θ),
    ])
  }
  coords.push(coords[0])
  return { type: "Polygon", coordinates: [coords] } as any
}

export const regions: Region[] = [
  {
    key: "blob1",
    displayName: "Crimson Orb",
    baseColor: "#FF6F61",
    center: [-80,  20],
    geoShape: makeCircle(-80, 20, 20),
    spectTags: ["MOOD"],
  },
  {
    key: "blob2",
    displayName: "Indigo Halo",
    baseColor: "#6B5B95",
    center: [  30,  40],
    geoShape: makeCircle(30,  40, 15),
    spectTags: ["SLEEP"],
  },
  {
    key: "blob3",
    displayName: "Emerald Ring",
    baseColor: "#88B04B",
    center: [   0, -30],
    geoShape: makeCircle(0,  -30, 25),
    spectTags: ["HEALTH"],
  },
  {
    key: "blob4",
    displayName: "Rose Swirl",
    baseColor: "#F7CAC9",
    center: [ 100,   0],
    geoShape: makeCircle(100,   0, 18),
    spectTags: ["FEED"],
  },
  {
    key: "blob5",
    displayName: "Sky Disk",
    baseColor: "#92A8D1",
    center: [-120, -10],
    geoShape: makeCircle(-120,-10, 22),
    spectTags: ["MOOD"],
  },
]

// src/utils/globeUtils.ts
export const DEG2RAD = Math.PI / 180;

/**
 * Is [lon, lat] on the *front* half of a globe rotated to [rotLon,rotLat]?
 * @param point         [lon,lat] in degrees
 * @param rotation      [rotLon,rotLat] in degrees
 * @param clipAngleDeg  horizon cutoff in degrees (90 = exact limb)
 */
export function isFrontHemisphere(
  point: [number, number],
  rotation: [number, number],
  clipAngleDeg = 90
): boolean {
  const [lon, lat]       = point;
  const [rotLon, rotLat] = rotation;
  const λ0 = rotLon * DEG2RAD;
  const φ0 = rotLat * DEG2RAD;
  const λ  = lon    * DEG2RAD;
  const φ  = lat    * DEG2RAD;

  // dot‐product on unit sphere
  const cosc =
    Math.sin(φ0) * Math.sin(φ) +
    Math.cos(φ0) * Math.cos(φ) * Math.cos(λ - λ0);

  // threshold is cos(clipAngle)
  return cosc > Math.cos(clipAngleDeg * DEG2RAD);
}

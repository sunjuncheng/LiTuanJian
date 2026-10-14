export function calculateDistance(
  lat1: number,
  lng1: number,
  lat2: number,
  lng2: number,
): number {
  const rad = (d: number) => (d * Math.PI) / 180.0;
  const R = 6378137;
  const dLat = rad(lat2 - lat1);
  const dLng = rad(lng2 - lng1);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(rad(lat1)) *
      Math.cos(rad(lat2)) *
      Math.sin(dLng / 2) *
      Math.sin(dLng / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

export function isWithinRange(
  lat1: number,
  lng1: number,
  lat2: number,
  lng2: number,
  range: number,
): { inRange: boolean; distance: number } {
  const distance = calculateDistance(lat1, lng1, lat2, lng2);
  return {
    inRange: distance <= range,
    distance: Math.round(distance),
  };
}

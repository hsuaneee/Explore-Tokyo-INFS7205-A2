// Tokyo boundary GeoJSON
export const tokyoBoundary = {
  type: "Feature",
  properties: {},
  geometry: {
    type: "Polygon",
    coordinates: [[
      [139.4, 35.4],  // Southwest
      [139.9, 35.4],  // Southeast
      [139.9, 35.8],  // Northeast
      [139.4, 35.8],  // Northwest
      [139.4, 35.4]   // Back to Southwest
    ]]
  }
};

// Style for the Tokyo boundary
export const boundaryStyle = {
  color: '#3388ff',
  weight: 2,
  fillOpacity: 0.1,
  fillColor: '#3388ff'
};

// Default center of Tokyo
export const TOKYO_CENTER: [number, number] = [35.6895, 139.6917];

// Default map zoom level
export const DEFAULT_ZOOM = 13;

// Tokyo bounds
export const TOKYO_BOUNDS = {
  southWest: [35.4, 139.4] as [number, number],
  northEast: [35.8, 139.9] as [number, number]
}; 
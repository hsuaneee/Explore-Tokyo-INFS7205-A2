import { useRef, useEffect } from 'react';
import { Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import { Box, Typography } from '@mui/material';

// Create a custom red marker icon
export const redIcon = new L.Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

interface DraggableMarkerProps {
  position: [number, number];
  onPositionChange: (lat: number, lng: number) => void;
}

const DraggableMarker: React.FC<DraggableMarkerProps> = ({ position, onPositionChange }) => {
  const markerRef = useRef<L.Marker>(null);

  useEffect(() => {
    if (markerRef.current) {
      markerRef.current.on('dragend', () => {
        const marker = markerRef.current;
        if (marker) {
          const latLng = marker.getLatLng();
          onPositionChange(latLng.lat, latLng.lng);
        }
      });
    }
  }, [onPositionChange]);

  return (
    <Marker
      position={position}
      draggable={true}
      ref={markerRef}
      icon={redIcon}
    >
      <Popup>
        <Box sx={{ minWidth: 150 }}>
          <Typography variant="subtitle2" sx={{ fontWeight: 'bold', mb: 1 }}>
            Your Location
          </Typography>
          <Typography variant="body2" sx={{ mb: 0.5 }}>
            Lat: {position[0].toFixed(6)}
          </Typography>
          <Typography variant="body2">
            Lng: {position[1].toFixed(6)}
          </Typography>
        </Box>
      </Popup>
    </Marker>
  );
};

export default DraggableMarker; 
import React, { useEffect, useRef } from 'react';
import { MapContainer, TileLayer, GeoJSON, Marker, Popup, Polyline, Tooltip } from 'react-leaflet';
import { Box, Typography } from '@mui/material';
import L from 'leaflet';
import { tokyoBoundary, boundaryStyle, DEFAULT_ZOOM } from '../constants/mapConstants';
import DraggableMarker, { redIcon } from './DraggableMarker';
import { Venue } from '../types';
import 'leaflet/dist/leaflet.css';
import '../styles/MapComponent.css';

// Define a blue marker icon for venue markers
const blueIcon = new L.Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-blue.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

interface MapComponentProps {
  center: [number, number];
  venues: Venue[];
  categoryVenues: any[];
  selectedCategory: string | null;
  activeTab: number;
  venueFlow: {
    start_venue: any;
    next_destinations: any[];
  } | null;
  onPositionChange: (lat: number, lng: number) => void;
}

const MapComponent: React.FC<MapComponentProps> = ({
  center,
  venues,
  categoryVenues,
  selectedCategory,
  activeTab,
  venueFlow,
  onPositionChange
}) => {
  const mapRef = useRef<any>(null);

  useEffect(() => {
    if (mapRef.current) {
      mapRef.current.setView(center);
    }
  }, [center]);

  // Calculate line weight based on flow count
  const getLineWeight = (flowCount: number, maxFlow: number) => {
    const minWeight = 2;
    const maxWeight = 10;
    return minWeight + ((flowCount / maxFlow) * (maxWeight - minWeight));
  };

  return (
    <Box className="map-container">
      <MapContainer
        center={center}
        zoom={DEFAULT_ZOOM}
        className="map"
        bounds={L.latLngBounds(
          L.latLng(35.4, 139.4),
          L.latLng(35.8, 139.9)
        )}
        ref={mapRef}
      >
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        />
        
        {/* Tokyo boundary */}
        <GeoJSON data={tokyoBoundary as any} style={boundaryStyle} />
        
        {/* Draggable user location marker - only show on Nearest Venues tab */}
        {activeTab === 0 && (
          <DraggableMarker 
            position={center}
            onPositionChange={onPositionChange}
          />
        )}

        {/* Venue markers for Nearest Venues search */}
        {activeTab === 0 && venues.map((venue) => (
          <Marker
            key={venue.venue_id}
            position={[venue.latitude, venue.longitude]}
            icon={blueIcon}
          >
            <Popup>
              <Box className="popup-content">
                <Typography variant="subtitle1" className="popup-title">
                  {venue.venue_category}
                </Typography>
                <Typography variant="body2" className="popup-info">
                  <strong>Venue ID:</strong> {venue.venue_id}
                </Typography>
                <Typography variant="body2" className="popup-info">
                  <strong>Distance:</strong> {venue.distance.toFixed(2)} meters
                </Typography>
                <Typography variant="body2" className="popup-info">
                  <strong>Coordinates:</strong>
                </Typography>
                <Typography variant="body2" className="popup-coordinates">
                  Lat: {venue.latitude.toFixed(6)}
                </Typography>
                <Typography variant="body2" className="popup-coordinates">
                  Lng: {venue.longitude.toFixed(6)}
                </Typography>
              </Box>
            </Popup>
          </Marker>
        ))}

        {/* Venue markers for Popular by Hour */}
        {activeTab === 1 && categoryVenues.map((venue) => (
          <Marker
            key={venue.venue_id}
            position={[parseFloat(venue.latitude), parseFloat(venue.longitude)]}
            icon={redIcon}
          >
            <Popup>
              <Box className="popup-content">
                <Typography variant="subtitle1" className="popup-title">
                  {selectedCategory}
                </Typography>
                <Typography variant="body2" className="popup-info">
                  <strong>Venue ID:</strong> {venue.venue_id}
                </Typography>
                <Typography variant="body2" className="popup-info">
                  <strong>Check-ins:</strong> {venue.checkin_count}
                </Typography>
                <Typography variant="body2" className="popup-info">
                  <strong>Coordinates:</strong>
                </Typography>
                <Typography variant="body2" className="popup-coordinates">
                  Lat: {parseFloat(venue.latitude).toFixed(6)}
                </Typography>
                <Typography variant="body2" className="popup-coordinates">
                  Lng: {parseFloat(venue.longitude).toFixed(6)}
                </Typography>
              </Box>
            </Popup>
          </Marker>
        ))}

        {/* Venue Flow Analysis */}
        {activeTab === 2 && venueFlow && (
          <>
            {/* Starting venue marker */}
            <Marker
              position={[venueFlow.start_venue.latitude, venueFlow.start_venue.longitude]}
              icon={redIcon}
            >
              <Popup>
                <Box className="popup-content">
                  <Typography variant="subtitle1" className="popup-title">
                    Starting Venue
                  </Typography>
                  <Typography variant="body2" className="popup-info">
                    <strong>Category:</strong> {venueFlow.start_venue.venue_category}
                  </Typography>
                  <Typography variant="body2" className="popup-info">
                    <strong>ID:</strong> {venueFlow.start_venue.venue_id}
                  </Typography>
                </Box>
              </Popup>
            </Marker>

            {/* Flow lines and destination markers */}
            {venueFlow.next_destinations.map((dest, index) => {
              const maxFlow = Math.max(...venueFlow.next_destinations.map(d => d.flow_count));
              const lineWeight = getLineWeight(dest.flow_count, maxFlow);

              return (
                <React.Fragment key={dest.venue_id}>
                  <Polyline
                    positions={[
                      [venueFlow.start_venue.latitude, venueFlow.start_venue.longitude],
                      [dest.latitude, dest.longitude]
                    ]}
                    className="flow-line"
                    weight={lineWeight}
                  >
                    <Tooltip permanent direction="center" className="flow-rank-tooltip">
                      #{index + 1}
                    </Tooltip>
                  </Polyline>
                  <Marker
                    position={[dest.latitude, dest.longitude]}
                    icon={blueIcon}
                  >
                    <Popup>
                      <Box className="popup-content">
                        <Typography variant="subtitle1" className="popup-title">
                          #{index + 1} {dest.venue_category}
                        </Typography>
                        <Typography variant="body2" className="popup-info">
                          <strong>Flow Count:</strong> {dest.flow_count}
                        </Typography>
                        <Typography variant="body2" className="popup-info">
                          <strong>Unique Users:</strong> {dest.unique_users}
                        </Typography>
                        <Typography variant="body2" className="popup-info">
                          <strong>ID:</strong> {dest.venue_id}
                        </Typography>
                      </Box>
                    </Popup>
                  </Marker>
                </React.Fragment>
              );
            })}
          </>
        )}
      </MapContainer>
    </Box>
  );
};

export default MapComponent; 
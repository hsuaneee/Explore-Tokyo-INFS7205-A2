import React from 'react';
import {
  TextField,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  CircularProgress,
  Typography,
  Box
} from '@mui/material';
import { Category, SelectChangeEvent } from '../types';
import '../styles/NearestVenuesTab.css';

interface NearestVenuesTabProps {
  latitude: number;
  longitude: number;
  category: string;
  k: number;
  categories: Category[];
  venues: any[];
  loading: boolean;
  error: string | null;
  onLatitudeChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onLongitudeChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onCategoryChange: (e: SelectChangeEvent) => void;
  onKChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onSearch: () => void;
}

const NearestVenuesTab: React.FC<NearestVenuesTabProps> = ({
  latitude,
  longitude,
  category,
  k,
  categories,
  venues,
  loading,
  error,
  onLatitudeChange,
  onLongitudeChange,
  onCategoryChange,
  onKChange,
  onSearch
}) => {
  return (
    <Box className="nearest-venues-container">
      <Typography variant="h6" className="nearest-venues-title">
        Search Parameters
      </Typography>

      <FormControl fullWidth error={latitude < 35.4 || latitude > 35.8}>
        <TextField
          label="Latitude"
          type="number"
          value={latitude}
          onChange={onLatitudeChange}
          InputProps={{
            inputProps: { 
              step: 0.000001,
              min: 35.4,
              max: 35.8
            }
          }}
          error={latitude < 35.4 || latitude > 35.8}
          helperText={latitude < 35.4 || latitude > 35.8 ? "Latitude must be between 35.4° and 35.8°" : "Tokyo is roughly between 35.4° and 35.8°"}
        />
      </FormControl>

      <FormControl fullWidth error={longitude < 139.4 || longitude > 139.9}>
        <TextField
          label="Longitude"
          type="number"
          value={longitude}
          onChange={onLongitudeChange}
          InputProps={{
            inputProps: { 
              step: 0.000001,
              min: 139.4,
              max: 139.9
            }
          }}
          error={longitude < 139.4 || longitude > 139.9}
          helperText={longitude < 139.4 || longitude > 139.9 ? "Longitude must be between 139.4° and 139.9°" : "Tokyo is roughly between 139.4° and 139.9°"}
        />
      </FormControl>

      <FormControl fullWidth>
        <InputLabel id="category-select-label">Category</InputLabel>
        <Select
          labelId="category-select-label"
          id="category-select"
          value={category}
          label="Category"
          onChange={onCategoryChange}
          MenuProps={{
            style: { maxHeight: 400 }
          }}
        >
          <MenuItem value="">Select a category</MenuItem>
          {categories.map((cat) => (
            <MenuItem key={cat.venue_category} value={cat.venue_category}>
              {cat.venue_category}
            </MenuItem>
          ))}
        </Select>
      </FormControl>

      <FormControl fullWidth error={!k || k < 1 || k > 50}>
        <TextField
          label="Number of Results (k)"
          type="number"
          value={k}
          onChange={onKChange}
          InputProps={{
            inputProps: { 
              min: 1,
              max: 50
            }
          }}
          error={!k || k < 1 || k > 50}
          helperText={!k ? "Please enter number of results" : k < 1 || k > 50 ? "Number of results must be between 1 and 50" : "Between 1 and 50"}
        />
      </FormControl>

      <Button
        variant="contained"
        onClick={onSearch}
        disabled={loading || 
          category === '' || 
          !k || k < 1 || k > 50 ||
          latitude < 35.4 || latitude > 35.8 ||
          longitude < 139.4 || longitude > 139.9}
        className="search-button"
      >
        {loading ? <CircularProgress size={24} color="inherit" /> : 'Search'}
      </Button>

      {error && (
        <Typography color="error" sx={{ mt: 2 }}>
          {error}
        </Typography>
      )}

      {venues.length > 0 && (
        <Box className="results-summary">
          <Typography variant="h6" className="results-summary-title">
            Results Summary
          </Typography>
          <Typography variant="body1" className="results-summary-text">
            Found {venues.length} venues
          </Typography>
          {venues.length > 0 && (
            <Box className="results-summary-stats">
              <Typography variant="body2" className="results-summary-stats-item">
                Nearest venue: {Math.min(...venues.map(v => v.distance)).toFixed(2)} meters
              </Typography>
              <Typography variant="body2" className="results-summary-stats-item">
                Farthest venue: {Math.max(...venues.map(v => v.distance)).toFixed(2)} meters
              </Typography>
            </Box>
          )}
        </Box>
      )}
    </Box>
  );
};

export default NearestVenuesTab;
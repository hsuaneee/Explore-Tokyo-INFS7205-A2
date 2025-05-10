import React, { ChangeEvent } from 'react';
import {
  TextField,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  CircularProgress,
  Typography,
  Box,
  SelectChangeEvent,
  List,
  ListItem,
  ListItemText,
  Divider,
  Paper
} from '@mui/material';
import '../styles/NextDestinationTab.css';

interface NextDestinationTabProps {
  venueId: string;
  timeRange: string;
  k: number;
  loading: boolean;
  error: string | null;
  venueFlow: {
    start_venue: any;
    next_destinations: any[];
  } | null;
  onVenueIdChange: (e: ChangeEvent<HTMLInputElement>) => void;
  onTimeRangeChange: (e: ChangeEvent<HTMLInputElement>) => void;
  onKChange: (e: ChangeEvent<HTMLInputElement>) => void;
  onSearch: () => void;
}

export const NextDestinationTab = ({
  venueId,
  timeRange,
  k,
  loading,
  error,
  venueFlow,
  onVenueIdChange,
  onTimeRangeChange,
  onKChange,
  onSearch
}: NextDestinationTabProps) => {
  return (
    <Box className="next-destination-container">
      <Typography variant="h6" className="next-destination-title">
        Next Destination Analysis
      </Typography>
      
      <TextField
        label="Venue ID"
        value={venueId}
        onChange={onVenueIdChange}
        fullWidth
        size="small"
        helperText="Enter the ID of the starting venue"
        error={!!error}
      />
      
      <TextField
        label="Time Range (hours)"
        value={timeRange}
        onChange={onTimeRangeChange}
        fullWidth
        size="small"
        type="number"
        inputProps={{ min: 1, max: 24 }}
        helperText="Time window to look for next destinations (e.g., 2 hours means destinations visited within 2 hours after the starting venue)"
        error={!!error}
      />
      
      <TextField
        label="Number of Results"
        value={k}
        onChange={onKChange}
        fullWidth
        size="small"
        type="number"
        inputProps={{ min: 1, max: 20 }}
        helperText="Enter number of top destinations to show (1-20)"
        error={!!error}
      />
      
      <Button
        variant="contained"
        onClick={onSearch}
        disabled={loading || !venueId || !timeRange || !k}
        className="search-button"
      >
        {loading ? <CircularProgress size={24} /> : 'Search'}
      </Button>
      
      {error && (
        <Typography color="error" variant="body2">
          {error}
        </Typography>
      )}
      
      {venueFlow && (
        <Paper className="results-container">
          <Typography variant="subtitle1" className="results-title">
            Results ({venueFlow.next_destinations.length})
          </Typography>
          <List className="results-list">
            {venueFlow.next_destinations.map((dest, index) => (
              <React.Fragment key={dest.venue_id}>
                <ListItem className="result-item">
                  <ListItemText
                    primary={
                      <Typography variant="subtitle2" className="result-rank">
                        #{index + 1} {dest.venue_category}
                      </Typography>
                    }
                    secondary={
                      <>
                        <Typography component="span" variant="body2" color="text.primary">
                          Flow Count: {dest.flow_count}
                        </Typography>
                        <br />
                        <Typography component="span" variant="body2" className="result-stats">
                          Unique Users: {dest.unique_users}
                        </Typography>
                      </>
                    }
                  />
                </ListItem>
                {index < venueFlow.next_destinations.length - 1 && <Divider className="result-divider" />}
              </React.Fragment>
            ))}
          </List>
        </Paper>
      )}
      
      <Typography variant="body2" className="helper-text">
        This analysis shows where people typically go after visiting a specific venue, helping understand movement patterns and popular next destinations.
      </Typography>
    </Box>
  );
}; 
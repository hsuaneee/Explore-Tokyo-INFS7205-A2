import React from 'react';
import { Box, Typography, Slider, List, ListItem, ListItemButton, ListItemText } from '@mui/material';
import { PopularCategory } from '../types';
import '../styles/PopularByHourTab.css';

interface Venue {
  venue_id: string;
  latitude: number;
  longitude: number;
  checkin_count: string;
}

interface Category {
  venue_category: string;
  checkin_count: string;
  top_venues: Venue[];
}

interface PopularByHourTabProps {
  selectedHour: number;
  topCategories: PopularCategory[];
  selectedCategory: string | null;
  categoryVenues: any[];
  onHourChange: (event: Event, newValue: number | number[]) => void;
  onCategorySelect: (category: string) => void;
}

const PopularByHourTab: React.FC<PopularByHourTabProps> = ({
  selectedHour,
  topCategories,
  selectedCategory,
  categoryVenues,
  onHourChange,
  onCategorySelect
}) => {
  return (
    <Box className="popular-by-hour-container">
      <Typography variant="h6" className="popular-by-hour-title">
        Popular Categories by Hour
      </Typography>

      <Box>
        <Slider
          value={selectedHour}
          min={0}
          max={23}
          step={1}
          marks={[
            {value: 0, label: '12 AM'},
            {value: 6, label: '6 AM'},
            {value: 12, label: '12 PM'},
            {value: 18, label: '6 PM'},
            {value: 23, label: '11 PM'}
          ]}
          onChange={onHourChange}
          className="time-slider"
        />
      </Box>

      <Typography className="time-display">
        {selectedHour < 12 ? `${selectedHour} AM` : selectedHour === 12 ? '12 PM' : `${selectedHour - 12} PM`}
      </Typography>
      
      <Box className="categories-container">
        <Typography variant="subtitle1" className="categories-title">
          Top Categories
        </Typography>
        <List className="categories-list">
          {topCategories.length === 0 ? (
            <ListItem>
              <ListItemText 
                primary={<Typography className="category-name">No data for this hour</Typography>}
              />
            </ListItem>
          ) : (
            topCategories.map((cat) => (
              <ListItem 
                disablePadding 
                key={cat.category}
                divider
              >
                <ListItemButton
                  selected={selectedCategory === cat.category}
                  onClick={() => onCategorySelect(cat.category)}
                  className={`category-item ${selectedCategory === cat.category ? 'selected' : ''}`}
                >
                  <ListItemText
                    primary={
                      <Typography className="category-name">
                        {cat.category}
                      </Typography>
                    }
                    secondary={
                      <Typography variant="body2" className="category-count">
                        Check-ins: {cat.count}
                      </Typography>
                    }
                  />
                </ListItemButton>
              </ListItem>
            ))
          )}
        </List>
      </Box>
      
      {selectedCategory && categoryVenues.length > 0 && (
        <Box className="venues-container">
          <Typography variant="subtitle1" className="venues-title">
            Top Venues for {selectedCategory}
          </Typography>
          {categoryVenues.map((venue, index) => (
            <Box 
              key={venue.venue_id} 
              className={`venue-item ${index === 0 ? 'top' : ''}`}
            >
              {index === 0 && (
                <Typography sx={{ mr: 1, fontSize: '1.2rem' }}>🏆</Typography>
              )}
              <Typography 
                variant="body2" 
                className={`venue-count ${index === 0 ? 'top' : ''}`}
              >
                Check-ins: {venue.checkin_count}
              </Typography>
            </Box>
          ))}
        </Box>
      )}
    </Box>
  );
};

export default PopularByHourTab; 
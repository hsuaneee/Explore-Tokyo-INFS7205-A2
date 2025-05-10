import { useState, useEffect } from 'react';
import { Box, Tab, Tabs, Container, Typography } from '@mui/material';
import 'leaflet/dist/leaflet.css';
import { Header, NearestVenuesTab, PopularByHourTab, VenueFlowTab, MapComponent } from './components';
import { Category, Venue, PopularCategory, SelectChangeEvent } from './types';
import { fetchCategories, fetchNearestVenues, fetchPopularCategoriesByHour, fetchVenueFlow } from './utils/api';
import './styles/common.css';

function App() {
  // Tab state
  const [activeTab, setActiveTab] = useState(0);
  
  // Nearest venues tab state
  const [latitude, setLatitude] = useState(35.6895); //default latitude
  const [longitude, setLongitude] = useState(139.6917); //default longitude
  const [category, setCategory] = useState("");
  const [k, setK] = useState(5);
  const [categories, setCategories] = useState<Category[]>([]);
  const [venues, setVenues] = useState<Venue[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Popular by hour tab state
  const [selectedHour, setSelectedHour] = useState(12); //default hour
  const [topCategories, setTopCategories] = useState<PopularCategory[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [categoryVenues, setCategoryVenues] = useState<any[]>([]);

  // Venue flow tab state
  const [venueId, setVenueId] = useState('');
  const [timeRange, setTimeRange] = useState('');
  const [flowK, setFlowK] = useState(5);
  const [venueFlow, setVenueFlow] = useState<any>(null);
  const [flowLoading, setFlowLoading] = useState(false);
  const [flowError, setFlowError] = useState<string | null>(null);

  // Fetch categories on component mount
  useEffect(() => {
    const getCategoriesData = async () => {
      try {
        const data = await fetchCategories();
        setCategories(data);
      } catch (err) {
        console.error("Error fetching categories:", err);
        setError("Failed to fetch categories");
      }
    };
    
    getCategoriesData();
  }, []);

  // Fetch top categories when hour changes
  useEffect(() => {
    if (activeTab === 1) {
      const getTopCategories = async () => {
        try {
          const data = await fetchPopularCategoriesByHour(selectedHour);
          // Convert the API response to match our PopularCategory type
          const convertedData = data.map((item: any) => ({
            category: item.venue_category,
            count: item.checkin_count,
            venues: item.top_venues
          }));
          setTopCategories(convertedData);
          
          // Reset selected category when hour changes
          setSelectedCategory(null);
          setCategoryVenues([]);
        } catch (err) {
          console.error("Error fetching popular categories:", err);
        }
      };
      
      getTopCategories();
    }
  }, [selectedHour, activeTab]);

  // Fetch category venues when category is selected
  useEffect(() => {
    if (selectedCategory && activeTab === 1) {
      const getTopCategoryVenues = async () => {
        try {
          // Find the selected category in top categories
          const categoryData = topCategories.find(cat => cat.category === selectedCategory);
          if (categoryData && categoryData.venues) {
            setCategoryVenues(categoryData.venues);
          }
        } catch (err) {
          console.error("Error fetching category venues:", err);
        }
      };
      
      getTopCategoryVenues();
    }
  }, [selectedCategory, topCategories, activeTab]);

  // Handle tab change
  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setActiveTab(newValue);
    // Clear search results when switching tabs
    if (newValue === 0) {
      setCategoryVenues([]);
      setSelectedCategory(null);
    } else if (newValue === 1) {
      setVenues([]);
      setError(null);
    } else {
      setVenueFlow(null);
      setFlowError(null);
    }
  };

  // Handle position change from draggable marker
  const handlePositionChange = (lat: number, lng: number) => {
    setLatitude(lat);
    setLongitude(lng);
  };

  // Handle latitude change with validation
  const handleLatitudeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseFloat(e.target.value);
    if (!isNaN(value)) {
      setLatitude(value);
    }
  };

  // Handle longitude change with validation
  const handleLongitudeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseFloat(e.target.value);
    if (!isNaN(value)) {
      setLongitude(value);
    }
  };

  // Handle k value change with validation
  const handleKChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value === '' ? '' : parseInt(e.target.value, 10);
    setK(value as any); // Type assertion needed because k can be empty string
  };

  // Handle search for nearest venues
  const handleSearch = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const data = await fetchNearestVenues(latitude, longitude, category, k);
      setVenues(data);
    } catch (err: any) {
      console.error("Error searching venues:", err);
      setError(err.message || "Failed to search venues");
      setVenues([]);
    } finally {
      setLoading(false);
    }
  };

  // Handle hour change
  const handleHourChange = (_: Event, newValue: number | number[]) => {
    setSelectedHour(newValue as number);
  };

  // Handle category selection in popular by hour tab
  const handleCategorySelect = (category: string) => {
    setSelectedCategory(category);
  };

  // Handle category change in nearest venues tab
  const handleCategoryChange = (event: SelectChangeEvent) => {
    setCategory(event.target.value);
  };

  // Handle venue flow search
  const handleVenueFlowSearch = async () => {
    setFlowLoading(true);
    setFlowError(null);
    
    try {
      const data = await fetchVenueFlow(venueId, timeRange, flowK);
      setVenueFlow(data);
      // Center map on the starting venue
      if (data.start_venue) {
        setLatitude(data.start_venue.latitude);
        setLongitude(data.start_venue.longitude);
      }
    } catch (err: any) {
      console.error("Error searching venue flow:", err);
      setFlowError(err.message || "Failed to search venue flow");
      setVenueFlow(null);
    } finally {
      setFlowLoading(false);
    }
  };

  return (
    <Container maxWidth={false} sx={{ 
      height: '100vh',
      display: 'flex',
      flexDirection: 'column',
      p: 3,
      bgcolor: '#f5f5f5'
    }}>
      <Header />
      
      <Box sx={{ 
        display: 'flex',
        flexDirection: 'column',
        flex: 1,
        gap: 2,
        mt: 2,
        overflow: 'hidden',
        borderRadius: '16px',
        backgroundColor: '#fff'
      }}>
        <Tabs 
          value={activeTab} 
          onChange={handleTabChange}
          sx={{
            minHeight: '60px',
            backgroundColor: '#ffe3aa',
            '& .MuiTabs-indicator': {
              height: '4px',
              borderRadius: '2px',
              backgroundColor: '#ec9a9a',
            },
            '& .MuiTab-root': {
              fontWeight: 600,
              fontSize: '16px',
              textTransform: 'none',
              color: '#9a3a58',
              '&.Mui-selected': {
                backgroundColor: '#ffccd5',
                color: '#9a3a58',
                borderTopLeftRadius: '16px',
                borderTopRightRadius: '16px',
              },
            },
          }}
        >
          <Tab label="Nearest Venues" />
          <Tab label="Popular by Hour" />
          <Tab label="Venue Flow" />
        </Tabs>
        
        <Box sx={{ 
          display: 'flex', 
          flex: 1,
          gap: 2,
          pb: 2,
          px: 2,
          overflow: 'hidden',
          height: 'calc(100% - 60px)'
        }}>
          {activeTab === 0 ? (
            <NearestVenuesTab
              latitude={latitude}
              longitude={longitude}
              category={category}
              k={k}
              categories={categories}
              venues={venues}
              loading={loading}
              error={error}
              onLatitudeChange={handleLatitudeChange}
              onLongitudeChange={handleLongitudeChange}
              onCategoryChange={handleCategoryChange}
              onKChange={handleKChange}
              onSearch={handleSearch}
            />
          ) : activeTab === 1 ? (
            <PopularByHourTab
              selectedHour={selectedHour}
              topCategories={topCategories}
              selectedCategory={selectedCategory}
              categoryVenues={categoryVenues}
              onHourChange={handleHourChange}
              onCategorySelect={handleCategorySelect}
            />
          ) : (
            <VenueFlowTab
              venueId={venueId}
              timeRange={timeRange}
              k={flowK}
              loading={flowLoading}
              error={flowError}
              venueFlow={venueFlow}
              onVenueIdChange={(e) => setVenueId(e.target.value)}
              onTimeRangeChange={(e) => setTimeRange(e.target.value)}
              onKChange={(e) => setFlowK(parseInt(e.target.value, 10))}
              onSearch={handleVenueFlowSearch}
            />
          )}
          
          <MapComponent
            center={[latitude, longitude]}
            venues={venues}
            categoryVenues={categoryVenues}
            selectedCategory={selectedCategory}
            activeTab={activeTab}
            venueFlow={venueFlow}
            onPositionChange={handlePositionChange}
          />
        </Box>
      </Box>
      
      <Box 
        component="footer" 
        sx={{ 
          textAlign: 'center', 
          py: 2,
          color: '#666',
          fontSize: '0.875rem'
        }}
      >
        <Typography variant="body2">
          Dataset: Foursquare Check-in Data in Tokyo (2012-2013) representing user venue visits across the metropolitan area
        </Typography>
      </Box>
    </Container>
  );
}

export default App;

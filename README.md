# Explore Tokyo 🌸⛩️

An interactive web application for visualizing location-based social network data from Foursquare check-ins in Tokyo, featuring various tools to discover and analyze venues through intuitive filters and visualizations.

This application provides a platform for exploring spatial relationships and temporal patterns in social network data through an engaging map-based interface.

## Features

### Nearest Venue
- Interactive map displaying the nearest venues within a specified category in Tokyo
- Users can:
  - Input latitude and longitude coordinates for their location
  - Drag the red marker on the map to automatically update coordinates
  - Select a venue category from the dropdown menu
  - Specify the number of nearest results to display
  - Search for results with a single click
- Results display on the map:
  - Geographic distribution of matching venues
  - Interactive markers showing venue details (ID, distance, coordinates)
  - Summary of results including total venues found and distance information

### Popular by Hour
- Discover the most popular venue categories during specific hours
- Users can:
  - Select any hour of the day to view top categories
  - Click on a category to explore its top 3 venues and check-in counts
  - View detailed venue information by clicking map markers
- Results display:
  - Dynamic map markers showing venue locations
  - Real-time updates as hour selection changes

### Next Destination Analysis
- Analyze common next destinations from a specific venue
- Users can:
  - Enter a Venue ID to analyze
  - Set a time window (1-24 hours) to look for next destination
  - Choose the number of results to display (1-20)
- Results display:
  - Ranked list of popular next destinations
  - For each destination:
    - Venue category
    - Flow count (number of people who visited this destination after the starting venue)
    - Number of unique users
  - Visual representation with connecting lines on the map
  - Line thickness indicates popularity

### General Features
- Real-time visualization updates
- Intuitive filtering and visualization controls
- Responsive design for all screen sizes
- Modern and engaging user interface

## Tech Stack

### Frontend
- React 19
- TypeScript
- Material-UI (MUI)
- Leaflet for map visualization
- Vite for build tooling

### Backend
- Node.js
- Express.js
- PostgreSQL with PostGIS extension
- RESTful API architecture

## Installation Guide

### Prerequisites
- Node.js (v18 or higher)
- PostgreSQL (v14 or higher) with PostGIS extension
- Python 3.8+ (for data import)

### Database Setup

1. Install PostgreSQL and PostGIS (refer to lecture instructions for detailed setup)

2. Create a new database:
   ```bash
   createdb infs7205_db
   ```

3. Enable PostGIS extension and create tables:
   ```bash
   psql infs7205_db -f create_table.sql
   ```

4. Create a `.env` file in the root directory with the following variables:
   ```
   DB_HOST=localhost
   DB_PORT=5432
   DB_NAME=infs7205_db
   DB_USER=your_username
   DB_PASSWORD=your_password
   PORT=3000
   ```

### Data Import Setup

1. Create and activate Python virtual environment:
   ```bash
   python3 -m venv venv
   source venv/bin/activate      # On Windows use: venv\Scripts\activate
   ```

2. Install Python dependencies:
   ```bash
   pip install -r requirements.txt
   ```

3. Ensure the dataset file `dataset_TSMC2014_TKY.csv` is present in the root directory

4. Import data using the Python script:
   ```bash
   python importdata.py
   ```

### Backend Setup

1. Navigate to the backend directory:
   ```bash
   cd backend
   ```

2. Install dependencies:
   ```bash
   npm install
   npm install --save-dev nodemon
   ```


4. Start the backend server:
   ```bash
   npm run dev
   ```

### Frontend Setup

1. Navigate to the frontend directory:
   ```bash
   cd frontend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Start the development server:
   ```bash
   npm run dev
   ```

### Important Notes
- Make sure to complete the setup steps in order: Database → Data Import → Backend → Frontend
- The PostgreSQL server must be running before starting the backend
- Keep the Python virtual environment activated while running the data import script
- Both backend and frontend servers need to be running for the application to work properly

## Usage

1. Open your browser and navigate to `http://localhost:5173`
2. The application will load with the map interface
3. Use the tabs to switch between different features:
   - Nearest Venue: Find nearby venues by category
   - Popular by Hour: Discover trending venues by time
   - Next Destination: Analyze movement patterns between venues

## Queries Implemented

### Query 0: Venue Categories List
**Task Description**: Retrieve all unique venue categories that have more than 50 check-ins. This query is used to populate the category dropdown list for the nearest venue search feature, ensuring only meaningful categories with sufficient data are displayed.

**Endpoint**: `GET /api/categories`

**SQL Query**:
```sql
SELECT DISTINCT c.venue_category 
FROM (
  SELECT venue_category, COUNT(*) as count
  FROM checkins
  GROUP BY venue_category
  HAVING COUNT(*) > 50
) c
ORDER BY c.venue_category
```

**Variables**: None (static query)

**Unexpected Value Handling**:
- Uses HAVING clause to filter out categories with insufficient data (less than 50 check-ins)
- Returns categories in alphabetical order for easy selection
- Returns empty result set if no categories meet the minimum check-in threshold

### Query 1: Nearest Venues Search
**Task Description**: Find the k nearest venues of a specific category from a given location. This is useful for users who want to find nearby venues of interest, such as restaurants or shops.

**Endpoint**: `GET /api/nearest`
- Parameters: 
  - `latitude`: User's latitude
  - `longitude`: User's longitude
  - `category`: Venue category to search for
  - `k`: Number of results to return

**SQL Query**:
```sql
WITH nearest AS (
  SELECT 
    venue_id,
    venue_category,
    latitude,
    longitude,
    geom,
    ST_Distance(
      geom::geography,
      ST_SetSRID(ST_MakePoint($1, $2), 4326)::geography
    ) as distance
  FROM checkins
  WHERE venue_category = $3
  GROUP BY venue_id, venue_category, latitude, longitude, geom
)
SELECT 
  venue_id,
  venue_category,
  latitude,
  longitude,
  distance
FROM nearest
ORDER BY distance
LIMIT $4
```

**Variables**:
- `$1`: longitude of the user's location
- `$2`: latitude of the user's location
- `$3`: venue category to search for
- `$4`: number of results to return (k)

**Unexpected Value Handling**:
- Input validation ensures all required parameters are provided
- Uses PostGIS's ST_Distance function to calculate accurate geographic distances
- Groups by venue_id to avoid duplicate venues
- Returns empty result set if no venues match the category

### Query 2: Popular Categories by Hour
**Task Description**: Find the most popular venue categories during a specific hour of the day, along with their top venues. This helps users understand temporal patterns in venue popularity.

**Endpoint**: `GET /api/popular-categories`
- Parameters:
  - `hour`: Hour of the day (0-23)
  - `top`: Number of top categories to return

**SQL Query**:
```sql
-- First query: Get top N categories
SELECT venue_category, COUNT(*) AS checkin_count
FROM checkins
WHERE EXTRACT(HOUR FROM timestamp) = $1
  AND latitude BETWEEN 35.4 AND 35.8
  AND longitude BETWEEN 139.4 AND 139.9
GROUP BY venue_category
ORDER BY checkin_count DESC
LIMIT $2

-- Second query: Get top 3 venues for each category
SELECT venue_id, latitude, longitude, COUNT(*) AS checkin_count
FROM checkins
WHERE EXTRACT(HOUR FROM timestamp) = $1
  AND venue_category = $2
  AND latitude BETWEEN 35.4 AND 35.8
  AND longitude BETWEEN 139.4 AND 139.9
GROUP BY venue_id, latitude, longitude
ORDER BY checkin_count DESC
LIMIT 3
```

**Variables**:
- `$1`: hour of the day (0-23)
- `$2`: number of top categories to return

**Unexpected Value Handling**:
- Validates hour parameter is between 0 and 23
- Filters results to Tokyo area using latitude/longitude bounds
- Returns empty result set if no check-ins exist for the specified hour

### Query 3: Next Destination Analysis
**Task Description**: Analyze movement patterns by finding the most common next destinations after visiting a specific venue within a given time window. This helps understand user movement patterns and venue relationships.

**Endpoint**: `GET /api/venue-flow`
- Parameters:
  - `venueId`: Starting venue ID
  - `timeRange`: Time window in hours (1-24)
  - `k`: Number of results to return

**SQL Query**:
```sql
WITH venue_checkins AS (
  SELECT 
    user_id,
    timestamp,
    venue_id,
    venue_category,
    latitude,
    longitude
  FROM checkins
  WHERE venue_id = $1
),
next_checkins AS (
  SELECT 
    vc.user_id,
    vc.timestamp as start_time,
    c.venue_id as next_venue_id,
    c.venue_category as next_venue_category,
    c.latitude as next_latitude,
    c.longitude as next_longitude,
    c.timestamp as next_time
  FROM venue_checkins vc
  JOIN checkins c ON vc.user_id = c.user_id
  WHERE c.timestamp > vc.timestamp
    AND EXTRACT(EPOCH FROM (c.timestamp - vc.timestamp))/3600 <= $2
)
SELECT 
  next_venue_id as venue_id,
  next_venue_category as venue_category,
  next_latitude as latitude,
  next_longitude as longitude,
  COUNT(*) as flow_count,
  COUNT(DISTINCT user_id) as unique_users
FROM next_checkins
GROUP BY next_venue_id, next_venue_category, next_latitude, next_longitude
ORDER BY flow_count DESC
LIMIT $3
```

**Variables**:
- `$1`: starting venue ID
- `$2`: time window in hours (1-24)
- `$3`: number of results to return

**Unexpected Value Handling**:
- Validates time window is between 1 and 24 hours
- Returns 404 if starting venue is not found
- Uses CTEs to efficiently handle complex temporal relationships
- Counts both total flow and unique users for better analysis

## Project Structure

```
.
├── backend/
│   ├── server.js           # Express server and API endpoints
│   ├── package.json        # Backend dependencies
│   └── node_modules/       # Installed packages
├── frontend/
│   ├── src/
│   │   ├── components/     # React components
│   │   │   ├── MapComponent.tsx      # Map visualization
│   │   │   ├── NearestVenuesTab.tsx  # Nearest venues interface
│   │   │   ├── PopularByHourTab.tsx  # Popular categories interface
│   │   │   └── VenueFlowTab.tsx      # Venue flow analysis interface
│   │   ├── utils/
│   │   │   └── api.ts      # API integration functions
│   │   ├── types.ts        # TypeScript type definitions
│   │   ├── styles/         # CSS styles
│   │   └── App.tsx         # Main application component
│   ├── package.json        # Frontend dependencies
│   └── node_modules/       # Installed packages
├── create_table.sql        # Database schema
├── importdata.py          # Data import script
└── requirements.txt       # Python dependencies
```

## Development Notes

### Required Services
- PostgreSQL server must be running
- Backend server (Node.js) must be running
- Frontend development server (Vite) must be running

### Ports
- Frontend: 5173 (default Vite port)
- Backend: 3000 (configurable in .env)
- PostgreSQL: 5432 (default)


### Development Workflow
1. Ensure PostgreSQL is running
2. Start the backend server: `cd backend && npm run dev`
3. Start the frontend server: `cd frontend && npm run dev`
4. Access the application at `http://localhost:5173`

### Data Import
The `importdata.py` script is used to import the Foursquare dataset. The dataset contains check-in data with the following information:
- User IDs
- Venue IDs and categories
- Geographic coordinates (latitude/longitude)
- Timestamps
- Timezone information

Make sure to run it after setting up the database:
```bash
python importdata.py
```

Note: The dataset file `dataset_TSMC2014_TKY.csv` should be present in the root directory before running the import script. 
# Explore Tokyo

An interactive web application for visualizing location-based social network data from Foursquare check-ins in Tokyo, featuring various tools to discover and analyze venues through intuitive filters and visualizations.

This application provides a comprehensive platform for exploring spatial relationships and temporal patterns in social network data through an engaging map-based interface.

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

### Venue Flow Analysis
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

1. Install PostgreSQL and PostGIS:
   ```bash
   # For macOS using Homebrew
   brew install postgresql
   brew install postgis
   ```

2. Create a new database:
   ```bash
   createdb infs7205_db
   ```

3. Enable PostGIS extension and create tables:
   ```bash
   psql infs7205_db -f create_table.sql
   ```

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
   ```

3. Create a `.env` file in the backend directory with the following variables:
   ```
   DB_HOST=localhost
   DB_PORT=5432
   DB_NAME=infs7205_db
   DB_USER=your_username
   DB_PASSWORD=your_password
   PORT=3000
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

## Usage

1. Open your browser and navigate to `http://localhost:5173`
2. The application will load with the map interface
3. Use the tabs to switch between different features:
   - Nearest Venue: Find nearby venues by category
   - Popular by Hour: Discover trending venues by time
   - Venue Flow: Analyze movement patterns between venues

## API Endpoints

### Venue Search and Analysis
- `GET /api/categories` - Retrieve all unique venue categories with the checkin counts above 50
- `GET /api/nearest` - Find nearest venues
  - Parameters: `latitude`, `longitude`, `category`, `k`
  - Returns: List of nearest venues with distance information

### Popular Categories
- `GET /api/popular-categories` - Get popular categories by hour
  - Parameters: `hour` (0-23), `top` (number of results)
  - Returns: Top categories with their popular venues

### Venue Flow
- `GET /api/venue-flow` - Analyze venue flow patterns
  - Parameters: `venueId`, `timeRange` (1-24), `k` (number of results)
  - Returns: Starting venue and next destinations with flow statistics



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

### Environment Variables
Create a `.env` file in the backend directory with the following:
```
DB_HOST=localhost
DB_PORT=5432
DB_NAME=infs7205_db
DB_USER=your_username
DB_PASSWORD=your_password
PORT=3000
```

### Development Workflow
1. Ensure PostgreSQL is running
2. Start the backend server: `cd backend && npm run dev`
3. Start the frontend server: `cd frontend && npm run dev`
4. Access the application at `http://localhost:5173`

### Data Import
The `importdata.py` script is used to import the Foursquare dataset for Tokyo. The dataset contains check-in data with the following information:
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
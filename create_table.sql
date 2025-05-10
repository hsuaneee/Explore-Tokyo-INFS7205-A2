-- Enable PostGIS extension
CREATE EXTENSION IF NOT EXISTS postgis;

-- Drop existing table if it exists
DROP TABLE IF EXISTS checkins;

-- Create checkins table with correct data types
CREATE TABLE IF NOT EXISTS checkins (
    id SERIAL PRIMARY KEY,
    user_id INTEGER,
    venue_id VARCHAR(255),
    venue_category_id VARCHAR(255),
    venue_category VARCHAR(255),
    latitude DOUBLE PRECISION,
    longitude DOUBLE PRECISION,
    timezone_offset INTEGER,
    timestamp TIMESTAMP WITH TIME ZONE,
    geom geometry(Point, 4326)
);

-- Create spatial index
CREATE INDEX IF NOT EXISTS idx_checkins_geom ON checkins USING GIST (geom);

-- Create indexes for common query patterns
CREATE INDEX IF NOT EXISTS idx_checkins_user_id ON checkins(user_id);
CREATE INDEX IF NOT EXISTS idx_checkins_venue_id ON checkins(venue_id);
CREATE INDEX IF NOT EXISTS idx_checkins_timestamp ON checkins(timestamp);
CREATE INDEX IF NOT EXISTS idx_checkins_venue_category_id ON checkins(venue_category_id); 
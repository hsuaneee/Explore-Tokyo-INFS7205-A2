const express = require('express');
const cors = require('cors');
const { Pool } = require('pg');
require('dotenv').config();

const app = express();
const port = process.env.PORT || 5001;

// Middleware
app.use(cors());
app.use(express.json());

// Database connection
const pool = new Pool({
  user: 'postgres',
  host: 'localhost',
  database: 'prac2db',
  password: process.env.DB_PASSWORD,
  port: 5432,
});

// Get all unique venue categories
app.get('/api/categories', async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT DISTINCT c.venue_category 
       FROM (
         SELECT venue_category, COUNT(*) as count
         FROM checkins
         GROUP BY venue_category
         HAVING COUNT(*) > 50
       ) c
       ORDER BY c.venue_category`
    );
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get k nearest venues
app.get('/api/nearest', async (req, res) => {
  const { latitude, longitude, category, k } = req.query;
  
  if (!latitude || !longitude || !category || !k) {
    return res.status(400).json({ error: 'Missing required parameters' });
  }

  try {
    const result = await pool.query(
      `WITH nearest AS (
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
      LIMIT $4`,
      [longitude, latitude, category, k]
    );
    
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get top N popular categories for a given hour, and top venues for each
app.get('/api/popular-categories', async (req, res) => {
  const hour = req.query.hour ? parseInt(req.query.hour) : null;
  const top = req.query.top ? parseInt(req.query.top) : 5;
  if (hour === null || isNaN(hour)) {
    return res.status(400).json({ error: 'Missing or invalid hour parameter' });
  }
  try {
    // Get top N categories for the hour
    const catResult = await pool.query(
      `SELECT venue_category, COUNT(*) AS checkin_count
       FROM checkins
       WHERE EXTRACT(HOUR FROM timestamp) = $1
         AND latitude BETWEEN 35.4 AND 35.8
         AND longitude BETWEEN 139.4 AND 139.9
       GROUP BY venue_category
       ORDER BY checkin_count DESC
       LIMIT $2`,
      [hour, top]
    );
    const categories = catResult.rows;
    // For each category, get top 3 venues
    for (const cat of categories) {
      const venuesResult = await pool.query(
        `SELECT venue_id, latitude, longitude, COUNT(*) AS checkin_count
         FROM checkins
         WHERE EXTRACT(HOUR FROM timestamp) = $1
           AND venue_category = $2
           AND latitude BETWEEN 35.4 AND 35.8
           AND longitude BETWEEN 139.4 AND 139.9
         GROUP BY venue_id, latitude, longitude
         ORDER BY checkin_count DESC
         LIMIT 3`,
        [hour, cat.venue_category]
      );
      cat.top_venues = venuesResult.rows;
    }
    res.json(categories);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get venue flow analysis
app.get('/api/venue-flow', async (req, res) => {
  const { venueId, timeRange, k } = req.query;
  
  if (!venueId || !timeRange || !k) {
    return res.status(400).json({ error: 'Missing required parameters' });
  }

  try {
    const hours = parseInt(timeRange);
    if (isNaN(hours) || hours < 1 || hours > 24) {
      return res.status(400).json({ error: 'Time range must be between 1 and 24 hours' });
    }

    // Get the starting venue details
    const startVenue = await pool.query(
      `SELECT 
        venue_id,
        venue_category,
        latitude,
        longitude
       FROM checkins
       WHERE venue_id = $1
       LIMIT 1`,
      [venueId]
    );

    if (startVenue.rows.length === 0) {
      return res.status(404).json({ error: 'Starting venue not found' });
    }

    // Get the next destinations with their flow counts
    const nextDestinations = await pool.query(
      `WITH venue_checkins AS (
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
      LIMIT $3`,
      [venueId, hours, k]
    );

    res.json({
      start_venue: startVenue.rows[0],
      next_destinations: nextDestinations.rows
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
}); 
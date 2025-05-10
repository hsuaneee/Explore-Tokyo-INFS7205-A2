import pandas as pd
import psycopg2
from datetime import datetime
import os
from dotenv import load_dotenv
from dateutil.parser import parse

# Load environment variables
load_dotenv()

# Database connection settings
DB_NAME = os.getenv('DB_NAME')
DB_USER = os.getenv('DB_USER')
DB_PASSWORD = os.getenv('DB_PASSWORD') 
DB_HOST = os.getenv('DB_HOST')
DB_PORT = os.getenv('DB_PORT')

try:
    # Connect to PostgreSQL
    conn = psycopg2.connect(
        dbname=DB_NAME, 
        user=DB_USER, 
        password=DB_PASSWORD, 
        host=DB_HOST, 
        port=DB_PORT
    )
    cur = conn.cursor()

    # Read CSV in chunks
    csv_file = 'dataset_TSMC2014_TKY.csv'
    chunksize = 1000
    total_rows = 0

    print("Starting data import...")
    for chunk in pd.read_csv(csv_file, chunksize=chunksize):
        for _, row in chunk.iterrows():
            try:
                # Parse timestamp using dateutil.parser
                ts = parse(row['utcTimestamp'])
            except Exception as e:
                print(f"Error parsing timestamp: {e}")
                ts = None

            # Insert into DB
            cur.execute("""
                INSERT INTO checkins
                (user_id, venue_id, venue_category_id, venue_category, latitude, longitude, timezone_offset, timestamp, geom)
                VALUES (%s, %s, %s, %s, %s, %s, %s, %s, ST_SetSRID(ST_MakePoint(%s, %s), 4326))
            """, (
                row['userId'],
                row['venueId'],
                row['venueCategoryId'],
                row['venueCategory'],
                row['latitude'],
                row['longitude'],
                row['timezoneOffset'],
                ts,
                row['longitude'],
                row['latitude']
            ))
            total_rows += 1
            
            if total_rows % 1000 == 0:
                print(f"Processed {total_rows} rows...")
                conn.commit()
        
        conn.commit()

    print(f"Import complete. Total rows imported: {total_rows}")

except Exception as e:
    print(f"An error occurred: {e}")
    if 'conn' in locals():
        conn.rollback()
finally:
    if 'cur' in locals():
        cur.close()
    if 'conn' in locals():
        conn.close()
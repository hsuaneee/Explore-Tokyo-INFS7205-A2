export interface Venue {
  venue_id: string;
  venue_category: string;
  latitude: number;
  longitude: number;
  distance: number;
}

export interface Category {
  venue_category: string;
}

export interface PopularCategory {
  category: string;
  count: number;
  venues?: Array<{
    venue_id: string;
    latitude: string;
    longitude: string;
    checkin_count: number;
  }>;
}

export interface SelectChangeEvent {
  target: {
    value: string;
  };
} 
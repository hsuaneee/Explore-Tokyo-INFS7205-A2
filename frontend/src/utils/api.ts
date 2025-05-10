import { Category, Venue } from '../types';

const API_URL = 'http://localhost:5001/api';

// Get all venue categories
export const fetchCategories = async (): Promise<Category[]> => {
  try {
    const response = await fetch(`${API_URL}/categories`);
    if (!response.ok) {
      throw new Error('Failed to fetch categories');
    }
    return await response.json();
  } catch (error) {
    console.error('Error fetching categories:', error);
    throw error;
  }
};

// Get nearest venues by location and category
export const fetchNearestVenues = async (
  latitude: number,
  longitude: number,
  category: string,
  k: number
): Promise<Venue[]> => {
  try {
    const response = await fetch(
      `${API_URL}/nearest?latitude=${latitude}&longitude=${longitude}&category=${encodeURIComponent(category)}&k=${k}`
    );
    if (!response.ok) {
      throw new Error('Failed to fetch venues');
    }
    return await response.json();
  } catch (error) {
    console.error('Error fetching nearest venues:', error);
    throw error;
  }
};

// Backend type for popular categories (before conversion)
interface BackendPopularCategory {
  venue_category: string;
  checkin_count: number;
  top_venues?: Array<{
    venue_id: string;
    latitude: string;
    longitude: string;
    checkin_count: number;
  }>;
}

export const fetchPopularCategoriesByHour = async (
  hour: number,
  top: number = 5
): Promise<BackendPopularCategory[]> => {
  try {
    const response = await fetch(
      `${API_URL}/popular-categories?hour=${hour}&top=${top}`
    );
    if (!response.ok) {
      throw new Error('Failed to fetch popular categories');
    }
    return await response.json();
  } catch (error) {
    console.error('Error fetching popular categories:', error);
    throw error;
  }
};


export const fetchVenueFlow = async (venueId: string, timeRange: string, k: number) => {
  const response = await fetch(
    `${API_URL}/venue-flow?venueId=${venueId}&timeRange=${timeRange}&k=${k}`
  );

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to fetch venue flow data');
  }

  return response.json();
};

export default { fetchCategories, fetchNearestVenues, fetchPopularCategoriesByHour, fetchVenueFlow }; 
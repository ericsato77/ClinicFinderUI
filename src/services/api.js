import axios from 'axios';

// Use deployed API or localhost for development
const API_BASE_URL = process.env.REACT_APP_API_URL || 'https://healthgis-api.onrender.com/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

/**
 * Fetch paginated list of facilities with optional filters
 */
export const getFacilities = async (params = {}) => {
  const response = await api.get('/facilities/', { params });
  return response.data;
};

/**
 * Fetch a single facility by ID
 */
export const getFacilityById = async (id, lat = null, lon = null) => {
  const params = {};
  if (lat !== null && lon !== null) {
    params.lat = lat;
    params.lon = lon;
  }
  const response = await api.get(`/facilities/${id}/`, { params });
  return response.data;
};

/**
 * Fetch facilities as GeoJSON FeatureCollection for map rendering
 */
export const getFacilitiesGeoJSON = async (params = {}) => {
  const response = await api.get('/facilities/geojson/', { params });
  // Handle nested GeoJSON structure
  const data = response.data;
  if (data.features && data.features.type === 'FeatureCollection') {
    return data.features; // Return the inner FeatureCollection
  }
  return data;
};

/**
 * Find facilities near a location
 */
export const getNearbyFacilities = async (lat, lng, radius = 50, filters = {}) => {
  const params = { lat, lng, radius, ...filters };
  const response = await api.get('/facilities/nearby/', { params });
  return response.data;
};

/**
 * Get directions to a facility
 */
export const getDirections = async (facilityId, lat, lng) => {
  const response = await api.get(`/facilities/${facilityId}/directions/`, {
    params: { lat, lng },
  });
  return response.data;
};

/**
 * Fetch list of districts with facility counts
 */
export const getDistricts = async () => {
  const response = await api.get('/facilities/districts/');
  return response.data.districts || [];
};

/**
 * Fetch list of amenity types with counts
 */
export const getAmenityTypes = async () => {
  const response = await api.get('/facilities/amenities/');
  return response.data.amenities || [];
};

/**
 * Fetch aggregate statistics
 */
export const getStatistics = async () => {
  const response = await api.get('/facilities/stats/');
  return response.data;
};

export default api;

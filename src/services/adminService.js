import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'https://healthgis-api.onrender.com/api';
const ACTIVITIES_KEY = 'admin_activities_v1';

// Get auth token from localStorage
const getAuthToken = () => localStorage.getItem('admin_token');

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
api.interceptors.request.use((config) => {
  const token = getAuthToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Response interceptor to handle token refresh
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // If error is 401 and we haven't tried to refresh yet
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        const refreshToken = localStorage.getItem('admin_refresh_token');
        if (refreshToken) {
          const response = await axios.post(`${API_BASE_URL}/admin/auth/refresh/`, {
            refresh: refreshToken,
          });

          const { access } = response.data;
          localStorage.setItem('admin_token', access);

          // Retry the original request with new token
          originalRequest.headers.Authorization = `Bearer ${access}`;
          return api(originalRequest);
        }
      } catch (refreshError) {
        // Refresh failed, clear auth data
        localStorage.removeItem('admin_token');
        localStorage.removeItem('admin_refresh_token');
        localStorage.removeItem('admin_user');
        // Redirect to login
        window.location.href = '/admin/login';
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

function read(key) {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

function write(key, val) {
  localStorage.setItem(key, JSON.stringify(val));
}

// Convert GeoJSON feature to clinic format for table display
const featureToClinic = (feature) => ({
  id: feature.id || feature.properties?.id,
  name: feature.properties?.name || 'Unknown Facility',
  address: `${feature.properties?.district || ''}, ${feature.properties?.region || ''}`,
  phone: feature.properties?.contact_number || 'N/A',
  amenity: feature.properties?.amenity,
  district: feature.properties?.district,
  region: feature.properties?.region,
  emergency: feature.properties?.emergency,
  wheelchair: feature.properties?.wheelchair,
  operator: feature.properties?.operator,
  beds: feature.properties?.beds,
  latitude: feature.geometry?.coordinates?.[1],
  longitude: feature.geometry?.coordinates?.[0],
});

export const adminService = {
  async getClinics() {
    try {
      const response = await api.get('/facilities/geojson/');
      let data = response.data;
      
      // Handle nested GeoJSON structure
      if (data.features && data.features.type === 'FeatureCollection') {
        data = data.features;
      }
      
      // Convert GeoJSON features to clinic format
      const clinics = (data.features || []).map(featureToClinic);
      return clinics;
    } catch (error) {
      console.error('Error fetching clinics:', error);
      this.logActivity('fetch_error', { error: error.message });
      throw error;
    }
  },

  async addClinic(attrs) {
    try {
      // Backend facilities are read-only from OSM data
      // For now, just log the activity
      this.logActivity('add_clinic_attempt', { ...attrs, note: 'Backend does not support adding facilities' });
      throw new Error('Adding facilities is not supported. Facilities are synced from OpenStreetMap data.');
    } catch (error) {
      console.error('Error adding clinic:', error);
      throw error;
    }
  },

  async updateClinic(updated) {
    try {
      // Backend facilities are read-only from OSM data
      this.logActivity('update_clinic_attempt', { id: updated.id, note: 'Backend does not support updating facilities' });
      throw new Error('Updating facilities is not supported. Facilities are synced from OpenStreetMap data.');
    } catch (error) {
      console.error('Error updating clinic:', error);
      throw error;
    }
  },

  async deleteClinic(id) {
    try {
      // Backend facilities are read-only from OSM data
      this.logActivity('delete_clinic_attempt', { id, note: 'Backend does not support deleting facilities' });
      throw new Error('Deleting facilities is not supported. Facilities are synced from OpenStreetMap data.');
    } catch (error) {
      console.error('Error deleting clinic:', error);
      throw error;
    }
  },

  logActivity(action, details = {}) {
    const activities = read(ACTIVITIES_KEY) || [];
    const entry = { action, details, timestamp: Date.now() };
    activities.unshift(entry);
    // Keep only last 100 activities
    if (activities.length > 100) {
      activities.splice(100);
    }
    write(ACTIVITIES_KEY, activities);
    return entry;
  },

  getActivities() {
    return read(ACTIVITIES_KEY) || [];
  },

  // Auth methods
  async login(username, password) {
    try {
      // Try new JWT authentication endpoint first
      const response = await axios.post(`${API_BASE_URL}/admin/auth/login/`, {
        username,
        password,
      });
      
      const { user, tokens } = response.data;
      
      // Store access token and refresh token
      localStorage.setItem('admin_token', tokens.access);
      localStorage.setItem('admin_refresh_token', tokens.refresh);
      localStorage.setItem('admin_user', JSON.stringify(user));
      
      this.logActivity('login_success', { username });
      return { user, tokens };
    } catch (error) {
      // Fallback to hardcoded authentication for development
      if (error.response?.status === 404) {
        console.log('JWT endpoint not available, using fallback authentication');
        
        // Hardcoded credentials check
        if (username === 'admin' && password === '123') {
          const mockUser = {
            id: 1,
            username: 'admin',
            email: 'admin@healthgis.com',
            first_name: 'Admin',
            last_name: 'User',
            is_staff: true,
            is_superuser: true
          };
          
          // Store mock token and user
          localStorage.setItem('admin_token', 'mock_token_' + Date.now());
          localStorage.setItem('admin_user', JSON.stringify(mockUser));
          
          this.logActivity('login_success', { username, mode: 'fallback' });
          return { user: mockUser, tokens: { access: 'mock_token', refresh: 'mock_refresh' } };
        } else {
          this.logActivity('login_failed', { username, error: 'Invalid credentials' });
          throw new Error('Invalid credentials. Use admin/123 for testing.');
        }
      }
      
      const errorMessage = error.response?.data?.error || error.message;
      this.logActivity('login_failed', { username, error: errorMessage });
      throw new Error(errorMessage);
    }
  },

  async logout() {
    try {
      const refreshToken = localStorage.getItem('admin_refresh_token');
      if (refreshToken) {
        await api.post('/admin/auth/logout/', {
          refresh: refreshToken,
        });
      }
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      localStorage.removeItem('admin_token');
      localStorage.removeItem('admin_refresh_token');
      localStorage.removeItem('admin_user');
      this.logActivity('logout');
    }
  },

  async refreshToken() {
    try {
      const refreshToken = localStorage.getItem('admin_refresh_token');
      if (!refreshToken) {
        throw new Error('No refresh token available');
      }

      const response = await axios.post(`${API_BASE_URL}/admin/auth/refresh/`, {
        refresh: refreshToken,
      });

      const { access } = response.data;
      localStorage.setItem('admin_token', access);
      return access;
    } catch (error) {
      // If refresh fails, clear auth data
      localStorage.removeItem('admin_token');
      localStorage.removeItem('admin_refresh_token');
      localStorage.removeItem('admin_user');
      throw error;
    }
  },

  isAuthenticated() {
    return !!getAuthToken();
  },

  getCurrentUser() {
    try {
      const user = localStorage.getItem('admin_user');
      return user ? JSON.parse(user) : null;
    } catch {
      return null;
    }
  },
};
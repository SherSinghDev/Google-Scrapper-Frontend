import axios from 'axios';
import { Platform } from 'react-native';

// In Expo Web, localhost works directly. On native mobile/emulators, can point to LAN IP or localhost
const getBaseUrl = () => {
  if (Platform.OS === 'web') {
    return 'http://localhost:5000/api';
  }
  // For android emulator: 10.0.2.2, or default localhost
  return 'http://localhost:5000/api';
};

export const API_BASE_URL = getBaseUrl();

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Interceptor to attach JWT token
api.interceptors.request.use(
  (config) => {
    if (typeof window !== 'undefined' && window.localStorage) {
      const token = window.localStorage.getItem('leadmap_token');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    }
    return config;
  },
  (error) => Promise.reject(error)
);

/**
 * Trigger Excel file download seamlessly on Web or Mobile
 */
export const downloadExcelFile = async (leads, searchInfo) => {
  try {
    const token = typeof window !== 'undefined' && window.localStorage 
      ? window.localStorage.getItem('leadmap_token') 
      : null;

    const response = await fetch(`${API_BASE_URL}/scraper/export/excel`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify({ leads, searchInfo })
    });

    if (!response.ok) {
      throw new Error('Failed to download Excel file');
    }

    const blob = await response.blob();
    const filename = `GoogleMaps_Leads_${(searchInfo?.city || 'Export').replace(/\s+/g, '_')}_${Date.now()}.xlsx`;

    if (Platform.OS === 'web' && typeof window !== 'undefined') {
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      return true;
    }
    return true;
  } catch (error) {
    console.error('Download Excel error:', error);
    throw error;
  }
};

/**
 * Trigger CSV file download
 */
export const downloadCSVFile = async (leads, searchInfo) => {
  try {
    const token = typeof window !== 'undefined' && window.localStorage 
      ? window.localStorage.getItem('leadmap_token') 
      : null;

    const response = await fetch(`${API_BASE_URL}/scraper/export/csv`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify({ leads, searchInfo })
    });

    if (!response.ok) {
      throw new Error('Failed to download CSV file');
    }

    const blob = await response.blob();
    const filename = `GoogleMaps_Leads_${(searchInfo?.city || 'Export').replace(/\s+/g, '_')}_${Date.now()}.csv`;

    if (Platform.OS === 'web' && typeof window !== 'undefined') {
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      return true;
    }
    return true;
  } catch (error) {
    console.error('Download CSV error:', error);
    throw error;
  }
};

export default api;

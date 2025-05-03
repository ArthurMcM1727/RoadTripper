const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/api';

export const routeService = {
  async planRoute(startLocation, endLocation, preferences) {
    try {
      const response = await fetch(`${API_BASE_URL}/routes/plan`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          startLocation,
          endLocation,
          preferences,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to plan route');
      }

      return await response.json();
    } catch (error) {
      console.error('Error planning route:', error);
      throw error;
    }
  },

  async getStopSuggestions(route, preferences) {
    try {
      const response = await fetch(`${API_BASE_URL}/stops/suggest`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          route,
          preferences,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to get stop suggestions');
      }

      return await response.json();
    } catch (error) {
      console.error('Error getting stop suggestions:', error);
      throw error;
    }
  },
};
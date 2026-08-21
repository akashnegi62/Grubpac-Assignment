const BASE_URL = 'https://dummyjson.com';

export const authService = {
  login: async (username: string, password: string) => {
    // The DummyJSON auth endpoint allows us to ask for a refresh token by passing expiresInMins
    const response = await fetch(`${BASE_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        username,
        password,
        expiresInMins: 30, // Get a token that expires so we can test refresh
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Login failed');
    }

    const data = await response.json();
    return {
      accessToken: data.accessToken,
      refreshToken: data.refreshToken,
      user: {
        id: data.id,
        username: data.username,
        email: data.email,
        firstName: data.firstName,
        lastName: data.lastName,
        image: data.image,
      }
    };
  },

  refreshToken: async () => {
    // Get the current refresh token from localStorage
    const refreshToken = sessionStorage.getItem('refreshToken') || localStorage.getItem('refreshToken');
    if (!refreshToken) {
      throw new Error('No refresh token available');
    }

    const response = await fetch(`${BASE_URL}/auth/refresh`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        refreshToken,
        expiresInMins: 30,
      }),
    });

    if (!response.ok) {
      throw new Error('Token refresh failed');
    }

    const data = await response.json();
    return {
      accessToken: data.accessToken,
      refreshToken: data.refreshToken,
    };
  },
  
  getCurrentUser: async () => {
    // DummyJSON provides a /auth/me endpoint if we need to fetch user data using access token
    // For this assignment, we mostly rely on storing the user data on login.
    return null; 
  }
};

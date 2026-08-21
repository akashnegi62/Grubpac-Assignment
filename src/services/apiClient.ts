import { useAuthStore } from '../stores/authStore';
import { authService } from './authService.ts';

interface RequestOptions extends RequestInit {
  _retry?: boolean;
}

let isRefreshing = false;
let failedQueue: Array<{
  resolve: (value?: unknown) => void;
  reject: (reason?: unknown) => void;
}> = [];

const processQueue = (error: Error | null, token: string | null = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });
  failedQueue = [];
};

export const apiClient = async (url: string, options: RequestOptions = {}) => {
  const { accessToken } = useAuthStore.getState();
  
  const headers = new Headers(options.headers || {});
  
  // Attach token
  if (accessToken) {
    headers.set('Authorization', `Bearer ${accessToken}`);
  }
  
  // Add json header if body exists and no content-type is set
  if (options.body && !headers.has('Content-Type')) {
    headers.set('Content-Type', 'application/json');
  }

  const fetchOptions: RequestInit = {
    ...options,
    headers,
  };

  let response = await fetch(url, fetchOptions);

  if (response.status === 401 && !options._retry) {
    // Attempt token refresh
    if (isRefreshing) {
      return new Promise(function(resolve, reject) {
        failedQueue.push({ resolve, reject });
      })
        .then((token) => {
          headers.set('Authorization', `Bearer ${token}`);
          return fetch(url, { ...fetchOptions, headers });
        })
        .catch((err) => {
          return Promise.reject(err);
        });
    }

    options._retry = true;
    isRefreshing = true;

    try {
      const newSession = await authService.refreshToken();
      if (!newSession) throw new Error('Refresh failed');
      
      const { accessToken: newAccessToken } = newSession;
      
      // Update store
      useAuthStore.getState().setSession(newSession.accessToken, newSession.refreshToken);
      
      processQueue(null, newAccessToken);
      
      // Retry original request
      headers.set('Authorization', `Bearer ${newAccessToken}`);
      response = await fetch(url, { ...fetchOptions, headers });
    } catch (err: unknown) {
      processQueue(err instanceof Error ? err : new Error(String(err)), null);
      useAuthStore.getState().logout();
      throw err;
    } finally {
      isRefreshing = false;
    }
  }

  if (!response.ok) {
    // Try parsing error message from JSON, fallback to status text
    try {
      const data = await response.json();
      throw new Error(data.message || 'API request failed');
    } catch {
      throw new Error(`API request failed with status ${response.status}`);
    }
  }

  return response;
};

import { create } from 'zustand';

export interface User {
  id: number;
  username: string;
  email: string;
  firstName: string;
  lastName: string;
  image: string;
}

interface AuthState {
  user: User | null;
  accessToken: string | null;
  isAuthenticated: boolean;
  isLoadingSession: boolean;
  login: (accessToken: string, refreshToken: string, user: User, rememberMe?: boolean) => void;
  setSession: (accessToken: string, refreshToken: string) => void;
  logout: () => void;
  restoreSession: (accessToken: string, user: User) => void;
  setLoadingSession: (isLoading: boolean) => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  accessToken: null,
  isAuthenticated: false,
  isLoadingSession: true, // true by default until initialized
  
  login: (accessToken, refreshToken, user, rememberMe = true) => {
    if (rememberMe) {
      localStorage.setItem('refreshToken', refreshToken);
      localStorage.setItem('userData', JSON.stringify(user));
    } else {
      sessionStorage.setItem('refreshToken', refreshToken);
      sessionStorage.setItem('userData', JSON.stringify(user));
    }
    set({ accessToken, user, isAuthenticated: true, isLoadingSession: false });
  },
  
  setSession: (accessToken, refreshToken) => {
    // Determine where the token was originally saved and update it there
    if (sessionStorage.getItem('refreshToken')) {
      sessionStorage.setItem('refreshToken', refreshToken);
    } else {
      localStorage.setItem('refreshToken', refreshToken);
    }
    set({ accessToken, isAuthenticated: true });
  },

  restoreSession: (accessToken, user) => {
    set({ accessToken, user, isAuthenticated: true, isLoadingSession: false });
  },
  
  setLoadingSession: (isLoadingSession) => set({ isLoadingSession }),
  
  logout: () => {
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('userData');
    sessionStorage.removeItem('refreshToken');
    sessionStorage.removeItem('userData');
    set({ accessToken: null, user: null, isAuthenticated: false, isLoadingSession: false });
  },
}));

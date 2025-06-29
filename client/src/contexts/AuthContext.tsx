import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
import axios from 'axios';

// Set the base URL for all API requests based on environment
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000';
axios.defaults.baseURL = API_BASE_URL;

// Add request interceptor for debugging
axios.interceptors.request.use(
  (config) => {
    console.log('Making request to:', config.url);
    console.log('Request method:', config.method);
    console.log('Request headers:', config.headers);
    return config;
  },
  (error) => {
    console.error('Request error:', error);
    return Promise.reject(error);
  }
);

// Add response interceptor for debugging and token refresh
axios.interceptors.response.use(
  (response) => {
    console.log('Response received:', response.status, response.config.url);
    return response;
  },
  async (error) => {
    console.error('Response error:', error.response?.status, error.config?.url);
    console.error('Error details:', error.response?.data);
    
    // Handle token expiration
    if (error.response?.status === 401 && 
        error.config?.url !== '/api/auth/refresh' && 
        !error.config?.url?.includes('/auth/refresh')) {
      
      const refreshToken = localStorage.getItem('refresh_token');
      if (refreshToken && !error.config._retry) {
        try {
          console.log('Token expired, attempting refresh...');
          error.config._retry = true; // Prevent infinite loops
          
          console.log('Refresh token from localStorage:', refreshToken ? `${refreshToken.substring(0, 20)}...` : 'null');
          
          const refreshResponse = await axios.post('/api/auth/refresh', {
            refresh_token: refreshToken
          }, {
            headers: {
              'Content-Type': 'application/json'
            }
          });
          
          console.log('Refresh response received:', refreshResponse.data);
          
          const { access_token, refresh_token } = refreshResponse.data;
          localStorage.setItem('access_token', access_token);
          localStorage.setItem('refresh_token', refresh_token);
          axios.defaults.headers.common['Authorization'] = `Bearer ${access_token}`;
          
          // Retry the original request
          error.config.headers['Authorization'] = `Bearer ${access_token}`;
          return axios(error.config);
        } catch (refreshError: any) {
          console.error('Token refresh failed:', refreshError);
          console.error('Refresh error response:', refreshError.response?.data);
          console.error('Refresh error status:', refreshError.response?.status);
          
          // If refresh token is expired or invalid, clear everything
          if (refreshError.response?.status === 401) {
            console.log('Refresh token expired, clearing session and redirecting to login...');
            localStorage.removeItem('access_token');
            localStorage.removeItem('refresh_token');
            delete axios.defaults.headers.common['Authorization'];
            
            // Only redirect if we're not already on the login page
            if (!window.location.pathname.includes('/login')) {
              window.location.href = '/login';
            }
          } else {
            // For other refresh errors, just clear tokens
            console.log('Other refresh error, clearing tokens...');
            localStorage.removeItem('access_token');
            localStorage.removeItem('refresh_token');
            delete axios.defaults.headers.common['Authorization'];
          }
        }
      } else if (error.config._retry) {
        // If we already tried to refresh and failed, clear tokens
        console.log('Token refresh already attempted, clearing tokens...');
        localStorage.removeItem('access_token');
        localStorage.removeItem('refresh_token');
        delete axios.defaults.headers.common['Authorization'];
        
        if (!window.location.pathname.includes('/login')) {
          window.location.href = '/login';
        }
      } else if (!refreshToken) {
        // No refresh token available
        console.log('No refresh token available, clearing session...');
        localStorage.removeItem('access_token');
        localStorage.removeItem('refresh_token');
        delete axios.defaults.headers.common['Authorization'];
        
        if (!window.location.pathname.includes('/login')) {
          window.location.href = '/login';
        }
      }
    }
    
    return Promise.reject(error);
  }
);

interface User {
  id: number;
  email: string;
  username: string;
  full_name: string | null;
  is_active: boolean;
  is_verified: boolean;
  reset_hour: number;
  reset_minute: number;
  created_at: string;
  updated_at: string | null;
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  login: (username: string, password: string) => Promise<void>;
  register: (email: string, username: string, password: string, fullName?: string) => Promise<void>;
  logout: () => void;
  isLoading: boolean;
  error: string | null;
  clearError: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(localStorage.getItem('access_token'));
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Configure axios defaults
  useEffect(() => {
    if (token) {
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    } else {
      delete axios.defaults.headers.common['Authorization'];
    }
  }, [token]);

  // Define logout function with useCallback to prevent infinite loops
  const logout = useCallback(() => {
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    setToken(null);
    setUser(null);
    delete axios.defaults.headers.common['Authorization'];
  }, []);

  // Check if user is authenticated on mount
  useEffect(() => {
    const checkAuth = async () => {
      if (token) {
        try {
          console.log('Checking authentication with token...');
          const response = await axios.get('/api/auth/me');
          console.log('Auth check successful:', response.data);
          setUser(response.data);
        } catch (error: any) {
          console.error('Auth check failed:', error);
          
          // If token is expired, try to refresh it
          if (error.response?.status === 401) {
            const refreshToken = localStorage.getItem('refresh_token');
            if (refreshToken) {
              try {
                console.log('Attempting to refresh token...');
                const refreshResponse = await axios.post('/api/auth/refresh', {
                  refresh_token: refreshToken
                }, {
                  headers: {
                    'Content-Type': 'application/json'
                  }
                });
                
                const { access_token, refresh_token } = refreshResponse.data;
                localStorage.setItem('access_token', access_token);
                localStorage.setItem('refresh_token', refresh_token);
                setToken(access_token);
                
                // Try to get user info again
                const userResponse = await axios.get('/api/auth/me');
                setUser(userResponse.data);
                return;
              } catch (refreshError: any) {
                console.error('Token refresh failed:', refreshError);
                
                // If refresh token is expired or invalid, clear everything
                if (refreshError.response?.status === 401) {
                  console.log('Refresh token expired, clearing session...');
                  logout();
                  return;
                }
              }
            } else {
              // No refresh token available
              console.log('No refresh token available, clearing session...');
              logout();
              return;
            }
          }
          
          // For other errors, don't logout immediately
          if (error.response?.status === 401) {
            console.log('Authentication failed, but keeping user logged in for now...');
            // Don't logout immediately, let the global interceptor handle it
          } else {
            console.log('Other authentication error, clearing session...');
            logout();
          }
        }
      }
      setIsLoading(false);
    };

    checkAuth();
  }, [token, logout]);

  const login = async (username: string, password: string) => {
    try {
      setIsLoading(true);
      setError(null);
      
      console.log('Attempting login for username:', username);
      console.log('API Base URL:', API_BASE_URL);
      
      const response = await axios.post('/api/auth/login', {
        username,
        password
      });

      console.log('Login response:', response.data);
      const { access_token, refresh_token } = response.data;
      
      localStorage.setItem('access_token', access_token);
      localStorage.setItem('refresh_token', refresh_token);
      
      setToken(access_token);
      
      // Get user info
      console.log('Fetching user info...');
      const userResponse = await axios.get('/api/auth/me');
      console.log('User info response:', userResponse.data);
      setUser(userResponse.data);
      
    } catch (error: any) {
      const errorMessage = error.response?.data?.detail || 'Login failed';
      setError(errorMessage);
      console.error('Login error:', error);
      console.error('Error response:', error.response);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (email: string, username: string, password: string, fullName?: string) => {
    try {
      setIsLoading(true);
      setError(null);
      
      await axios.post('/api/auth/register', {
        email,
        username,
        password,
        full_name: fullName
      });

      // After registration, we need to log in to get the token
      const loginResponse = await axios.post('/api/auth/login', {
        username,
        password
      });

      const { access_token, refresh_token } = loginResponse.data;
      
      localStorage.setItem('access_token', access_token);
      localStorage.setItem('refresh_token', refresh_token);
      
      setToken(access_token);
      
      // Get user info
      const userResponse = await axios.get('/api/auth/me');
      setUser(userResponse.data);
      
    } catch (error: any) {
      // Handle validation errors (422 Unprocessable Entity)
      if (error.response?.status === 422 && Array.isArray(error.response?.data?.detail)) {
        const messages = error.response.data.detail.map((err: any) => err.msg).join(' ');
        setError(messages);
      } else {
        const errorMessage = error.response?.data?.detail || 'Registration failed';
        setError(errorMessage);
      }
      console.error('Registration error:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const clearError = () => {
    setError(null);
  };

  // Function to check if tokens are about to expire
  const checkTokenExpiration = useCallback(() => {
    const accessToken = localStorage.getItem('access_token');
    const refreshToken = localStorage.getItem('refresh_token');
    
    if (!accessToken || !refreshToken) {
      return;
    }
    
    try {
      // Decode the access token to check expiration
      const payload = JSON.parse(atob(accessToken.split('.')[1]));
      const expTime = payload.exp * 1000; // Convert to milliseconds
      const now = Date.now();
      const timeUntilExpiry = expTime - now;
      
      // If token expires in less than 5 minutes, show a warning
      if (timeUntilExpiry < 5 * 60 * 1000 && timeUntilExpiry > 0) {
        console.log('Access token expires soon, attempting refresh...');
        // Trigger a refresh
        axios.post('/api/auth/refresh', {
          refresh_token: refreshToken
        }, {
          headers: {
            'Content-Type': 'application/json'
          }
        }).then(response => {
          const { access_token, refresh_token } = response.data;
          localStorage.setItem('access_token', access_token);
          localStorage.setItem('refresh_token', refresh_token);
          setToken(access_token);
          console.log('Token refreshed successfully');
        }).catch(error => {
          console.error('Failed to refresh token:', error);
        });
      }
    } catch (error) {
      console.error('Error checking token expiration:', error);
    }
  }, []);

  // Check token expiration every 5 minutes
  useEffect(() => {
    if (token) {
      const interval = setInterval(checkTokenExpiration, 5 * 60 * 1000); // 5 minutes
      return () => clearInterval(interval);
    }
  }, [token, checkTokenExpiration]);

  const value: AuthContextType = {
    user,
    token,
    login,
    register,
    logout,
    isLoading,
    error,
    clearError
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}; 
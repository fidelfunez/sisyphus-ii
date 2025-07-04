import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
import axios from 'axios';

// In-memory token storage as ultimate fallback
let memoryTokens: { access_token?: string; refresh_token?: string } = {};

// Helper functions for robust storage with Brave compatibility
const getStoredToken = (key: string): string | null => {
  // Try localStorage first, then sessionStorage, then memory
  return localStorage.getItem(key) || sessionStorage.getItem(key) || memoryTokens[key as keyof typeof memoryTokens] || null;
};

const setStoredToken = (key: string, value: string): void => {
  // Store in all three locations for maximum persistence
  try {
    localStorage.setItem(key, value);
  } catch (e) {
    console.log('AuthProvider: localStorage failed, using sessionStorage:', e);
  }
  
  try {
    sessionStorage.setItem(key, value);
  } catch (e) {
    console.log('AuthProvider: sessionStorage failed, using memory:', e);
  }
  
  // Always store in memory as ultimate fallback
  memoryTokens[key as keyof typeof memoryTokens] = value;
  console.log('AuthProvider: Token stored in all locations:', key);
};

const removeStoredToken = (key: string): void => {
  // Remove from all locations
  try {
    localStorage.removeItem(key);
  } catch (e) {
    console.log('AuthProvider: Error removing from localStorage:', e);
  }
  
  try {
    sessionStorage.removeItem(key);
  } catch (e) {
    console.log('AuthProvider: Error removing from sessionStorage:', e);
  }
  
  delete memoryTokens[key as keyof typeof memoryTokens];
  console.log('AuthProvider: Token removed from all locations:', key);
};

console.log('AuthContext: Loading AuthContext module...');

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
      
      const refreshToken = getStoredToken('refresh_token');
      if (refreshToken && !error.config._retry) {
        try {
          console.log('Token expired, attempting refresh...');
          error.config._retry = true; // Prevent infinite loops
          
          console.log('Refresh token from localStorage:', refreshToken ? `${refreshToken.substring(0, 20)}...` : 'null');
          
          // Create the request data
          const refreshData = { refresh_token: refreshToken };
          console.log('Sending refresh data:', refreshData);
          
          const refreshResponse = await axios.post('/api/auth/refresh', refreshData, {
            headers: {
              'Content-Type': 'application/json',
              'Accept': 'application/json'
            }
          });
          
          console.log('Refresh response received:', refreshResponse.data);
          
          const { access_token, refresh_token } = refreshResponse.data;
          setStoredToken('access_token', access_token);
          setStoredToken('refresh_token', refresh_token);
          axios.defaults.headers.common['Authorization'] = `Bearer ${access_token}`;
          
          // Retry the original request
          error.config.headers['Authorization'] = `Bearer ${access_token}`;
          return axios(error.config);
        } catch (refreshError: any) {
          console.error('Token refresh failed:', refreshError);
          console.error('Refresh error response:', refreshError.response?.data);
          console.error('Refresh error status:', refreshError.response?.status);
          console.error('Full refresh error details:', JSON.stringify(refreshError.response?.data, null, 2));
          console.error('Refresh error message:', refreshError.message);
          
          // If refresh token is expired or invalid, clear everything
          if (refreshError.response?.status === 401) {
            console.log('Refresh token expired, clearing session and redirecting to login...');
            removeStoredToken('access_token');
            removeStoredToken('refresh_token');
            delete axios.defaults.headers.common['Authorization'];
            
            // Only redirect if we're not already on the login page
            if (!window.location.pathname.includes('/login')) {
              window.location.href = '/login';
            }
          } else {
            // For other refresh errors, just clear tokens
            console.log('Other refresh error, clearing tokens...');
            removeStoredToken('access_token');
            removeStoredToken('refresh_token');
            delete axios.defaults.headers.common['Authorization'];
            console.log('Axios interceptor: Cleared tokens due to refresh error');
          }
        }
      } else if (error.config._retry) {
        // If we already tried to refresh and failed, clear tokens
        console.log('Token refresh already attempted, clearing tokens...');
        removeStoredToken('access_token');
        removeStoredToken('refresh_token');
        delete axios.defaults.headers.common['Authorization'];
        console.log('Axios interceptor: Cleared tokens due to retry failure');
        
        if (!window.location.pathname.includes('/login')) {
          window.location.href = '/login';
        }
      } else if (!refreshToken) {
        // No refresh token available
        console.log('No refresh token available, clearing session...');
        removeStoredToken('access_token');
        removeStoredToken('refresh_token');
        delete axios.defaults.headers.common['Authorization'];
        console.log('Axios interceptor: Cleared tokens due to no refresh token');
        
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
  console.log('AuthProvider: Initializing AuthProvider...');
  
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(getStoredToken('access_token'));
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Configure axios defaults
  useEffect(() => {
    console.log('AuthProvider: Setting up axios defaults with token:', token ? 'exists' : 'null');
    if (token) {
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      console.log('AuthProvider: Set Authorization header to:', `Bearer ${token.substring(0, 20)}...`);
    } else {
      delete axios.defaults.headers.common['Authorization'];
      console.log('AuthProvider: Cleared Authorization header');
    }
  }, [token]);

  // Define logout function with useCallback to prevent infinite loops
  const logout = useCallback(() => {
    console.log('AuthProvider: Logout function called - clearing tokens and user');
    removeStoredToken('access_token');
    removeStoredToken('refresh_token');
    setToken(null);
    setUser(null);
    setError(null); // Clear any error messages when logging out
    delete axios.defaults.headers.common['Authorization'];
    console.log('AuthProvider: Logout completed');
  }, []);

  // Test to detect if storage is being cleared externally
  useEffect(() => {
    const testKey = 'storage_test_key';
    const testValue = 'test_value_' + Date.now();
    
    // Set a test value
    localStorage.setItem(testKey, testValue);
    sessionStorage.setItem(testKey, testValue);
    
    console.log('AuthProvider: Set test values in storage:', {
      localStorage: localStorage.getItem(testKey),
      sessionStorage: sessionStorage.getItem(testKey)
    });
    
    // Check if test values are cleared after a delay
    const checkTestValues = () => {
      const localTest = localStorage.getItem(testKey);
      const sessionTest = sessionStorage.getItem(testKey);
      
      console.log('AuthProvider: Test values check:', {
        localStorage: localTest,
        sessionStorage: sessionTest
      });
      
      if (!localTest && !sessionTest) {
        console.log('AuthProvider: WARNING - Both storages were cleared externally!');
      } else if (!localTest) {
        console.log('AuthProvider: localStorage was cleared externally');
      } else if (!sessionTest) {
        console.log('AuthProvider: sessionStorage was cleared externally');
      }
    };
    
    // Check after 1 minute
    const timeout = setTimeout(checkTestValues, 60000);
    
    return () => {
      clearTimeout(timeout);
      localStorage.removeItem(testKey);
      sessionStorage.removeItem(testKey);
    };
  }, []);

  // Listen for storage changes to detect when tokens are cleared
  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'access_token' || e.key === 'refresh_token') {
        console.log('AuthProvider: Storage change detected:', {
          key: e.key,
          oldValue: e.oldValue ? `${e.oldValue.substring(0, 20)}...` : 'null',
          newValue: e.newValue ? `${e.newValue.substring(0, 20)}...` : 'null',
          url: e.url,
          storageArea: e.storageArea
        });
        
        // If tokens were cleared, try to restore from other storage
        if (e.newValue === null && e.oldValue) {
          console.log('AuthProvider: Token cleared from storage, attempting restoration...');
          const otherStorage = e.storageArea === localStorage ? sessionStorage : localStorage;
          const backupToken = otherStorage.getItem(e.key!);
          if (backupToken) {
            console.log('AuthProvider: Found backup token, restoring...');
            setStoredToken(e.key!, backupToken);
            if (e.key === 'access_token') {
              setToken(backupToken);
            }
          }
        }
      }
    };

    window.addEventListener('storage', handleStorageChange);
    
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  // Periodic check to restore tokens if localStorage gets cleared
  useEffect(() => {
    const checkTokenRestoration = () => {
      const localToken = localStorage.getItem('access_token');
      const sessionToken = sessionStorage.getItem('access_token');
      
      // If localStorage is empty but sessionStorage has tokens, restore them
      if (!localToken && sessionToken && !token) {
        console.log('AuthProvider: Detected localStorage cleared, restoring from sessionStorage');
        setToken(sessionToken);
      }
    };

    // Check every 30 seconds
    const interval = setInterval(checkTokenRestoration, 30000);
    
    return () => clearInterval(interval);
  }, [token]);

  // Check if user is authenticated on mount
  useEffect(() => {
    console.log('AuthProvider: useEffect triggered - token:', token ? 'exists' : 'null');
    
    const checkAuth = async () => {
      console.log('AuthProvider: Starting auth check...');
      console.log('AuthProvider: Token from state:', token ? `${token.substring(0, 20)}...` : 'null');
      console.log('AuthProvider: Token from localStorage:', getStoredToken('access_token') ? `${getStoredToken('access_token')?.substring(0, 20)}...` : 'null');
      console.log('AuthProvider: Refresh token from localStorage:', getStoredToken('refresh_token') ? `${getStoredToken('refresh_token')?.substring(0, 20)}...` : 'null');
      
      // Detailed storage inspection
      console.log('AuthProvider: localStorage access_token:', localStorage.getItem('access_token') ? `${localStorage.getItem('access_token')?.substring(0, 20)}...` : 'null');
      console.log('AuthProvider: sessionStorage access_token:', sessionStorage.getItem('access_token') ? `${sessionStorage.getItem('access_token')?.substring(0, 20)}...` : 'null');
      console.log('AuthProvider: localStorage refresh_token:', localStorage.getItem('refresh_token') ? `${localStorage.getItem('refresh_token')?.substring(0, 20)}...` : 'null');
      console.log('AuthProvider: sessionStorage refresh_token:', sessionStorage.getItem('refresh_token') ? `${sessionStorage.getItem('refresh_token')?.substring(0, 20)}...` : 'null');
      
      // Check if we need to restore tokens from sessionStorage
      if (!token) {
        const sessionToken = sessionStorage.getItem('access_token');
        if (sessionToken) {
          console.log('AuthProvider: Restoring token from sessionStorage');
          setToken(sessionToken);
          return; // Let the useEffect run again with the restored token
        }
      }
      
      if (token) {
        try {
          console.log('Checking authentication with token...');
          console.log('Authorization header:', axios.defaults.headers.common['Authorization']);
          console.log('Full axios headers:', axios.defaults.headers.common);
          const response = await axios.get('/api/auth/me');
          console.log('Auth check successful:', response.data);
          setUser(response.data);
        } catch (error: any) {
          console.error('Auth check failed:', error);
          
          // If token is expired, try to refresh it
          if (error.response?.status === 401) {
            const refreshToken = getStoredToken('refresh_token');
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
                setStoredToken('access_token', access_token);
                setStoredToken('refresh_token', refresh_token);
                setToken(access_token);
                axios.defaults.headers.common['Authorization'] = `Bearer ${access_token}`;
                
                // Retry the auth check with new token
                const retryResponse = await axios.get('/api/auth/me');
                setUser(retryResponse.data);
              } catch (refreshError: any) {
                console.error('Token refresh failed:', refreshError);
                console.error('Refresh error response:', refreshError.response?.data);
                console.error('Refresh error status:', refreshError.response?.status);
                console.error('Full refresh error details:', JSON.stringify(refreshError.response?.data, null, 2));
                console.error('Refresh error message:', refreshError.message);
                
                // If refresh token is expired or invalid, clear everything
                if (refreshError.response?.status === 401) {
                  console.log('Refresh token expired, clearing session...');
                  logout();
                } else {
                  // For other refresh errors, just clear tokens
                  console.log('Other refresh error, clearing tokens...');
                  logout();
                }
              }
            } else {
              console.log('No refresh token available, clearing session...');
              logout();
            }
          } else {
            // For other errors, clear tokens
            console.log('Other auth error, clearing session...');
            logout();
          }
        }
      } else {
        console.log('AuthProvider: No token available, skipping auth check');
      }
      
      console.log('AuthProvider: Auth check completed, setting loading to false');
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
      
      setStoredToken('access_token', access_token);
      setStoredToken('refresh_token', refresh_token);
      
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
      
      setStoredToken('access_token', access_token);
      setStoredToken('refresh_token', refresh_token);
      
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
    const accessToken = getStoredToken('access_token');
    const refreshToken = getStoredToken('refresh_token');
    
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
          setStoredToken('access_token', access_token);
          setStoredToken('refresh_token', refresh_token);
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
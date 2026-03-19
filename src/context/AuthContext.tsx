import type { ReactNode } from 'react';
import { useEffect, useMemo, useState, useRef } from 'react';
import axios from 'axios';
import { AuthContext } from './auth-context';
import type { AuthState } from './auth-context';
import API_BASE_URL from '../config/api';

const STORAGE_KEY = 'keyt-auth';

function loadStoredAuth(): AuthState {
  const raw = typeof window !== 'undefined' ? localStorage.getItem(STORAGE_KEY) : null;
  if (!raw) return { user: null, token: null };
  try {
    return JSON.parse(raw);
  } catch {
    return { user: null, token: null };
  }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<AuthState>(loadStoredAuth);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [errorCode, setErrorCode] = useState<string | null>(null);
  const logoutRef = useRef<(() => void) | null>(null);
  const isLoggingOutRef = useRef(false); // Flag to prevent multiple logout calls

  const logout = () => {
    // Prevent multiple logout calls
    if (isLoggingOutRef.current) return;
    isLoggingOutRef.current = true;

    setState({ user: null, token: null });
    // Clear localStorage
    if (typeof window !== 'undefined') {
      localStorage.removeItem(STORAGE_KEY);
      // Redirect to login page
      const currentPath = window.location.pathname;
      // Don't redirect if already on login/register page
      if (!currentPath.includes('/login') && !currentPath.includes('/register')) {
        window.location.href = '/login';
      }
    }
  };

  // Store logout function in ref for use in interceptor
  logoutRef.current = logout;

  // Setup axios interceptor for token expiration
  useEffect(() => {
    // Reset logout flag when token changes
    isLoggingOutRef.current = false;

    const interceptorId = axios.interceptors.response.use(
      (response) => response,
      (error) => {
        const response = error?.response;
        
        // Check if it's a 401 Unauthorized error
        if (response?.status === 401) {
          const errorCode = response?.data?.code;
          const errorMessage = response?.data?.message || '';
          
          // Check if token is expired or invalid
          if (
            errorCode === 'TOKEN_EXPIRED' || 
            errorCode === 'TOKEN_INVALID' || 
            errorCode === 'TOKEN_ERROR' ||
            errorMessage.toLowerCase().includes('hết hạn') ||
            errorMessage.toLowerCase().includes('token') ||
            errorMessage.toLowerCase().includes('expired')
          ) {
            // Only logout if user is actually logged in and not already logging out
            if (state.token && logoutRef.current && !isLoggingOutRef.current) {
              console.warn('🔒 Token đã hết hạn hoặc không hợp lệ. Tự động đăng xuất...');
              // Show alert to user
              if (typeof window !== 'undefined') {
                alert('Phiên đăng nhập của bạn đã hết hạn. Vui lòng đăng nhập lại.');
              }
              logoutRef.current();
            }
          }
        }
        
        return Promise.reject(error);
      }
    );

    // Cleanup interceptor on unmount
    return () => {
      axios.interceptors.response.eject(interceptorId);
    };
  }, [state.token]);

  useEffect(() => {
    if (state.token) {
      axios.defaults.headers.common['Authorization'] = `Bearer ${state.token}`;
    } else {
      delete axios.defaults.headers.common['Authorization'];
    }
    if (typeof window !== 'undefined') {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    }
  }, [state]);

  const login = async (payload: { username: string; password: string; recaptchaToken: string }) => {
    setLoading(true);
    setError(null);
    setErrorCode(null);
    try {
      const response = await axios.post(`${API_BASE_URL}/auth/login`, payload);
      setState({ user: response.data.user, token: response.data.token });
    } catch (err: unknown) {
      const resp = (err as any)?.response;
      const message = resp?.data?.message || 'Không thể đăng nhập';
      setError(message);
      setErrorCode(resp?.data?.code || null);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const register = async (payload: { username: string; email: string; password: string; recaptchaToken: string }) => {
    setLoading(true);
    setError(null);
    setErrorCode(null);
    try {
      const response = await axios.post(`${API_BASE_URL}/auth/register`, payload);
      return response.data;
    } catch (err: unknown) {
      const message = (err as any)?.response?.data?.message || 'Không thể đăng ký';
      setError(message);
      setErrorCode((err as any)?.response?.data?.code || null);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const loginWithGoogle = async (credential: string, recaptchaToken: string) => {
    setLoading(true);
    setError(null);
    setErrorCode(null);
    try {
      const response = await axios.post(`${API_BASE_URL}/auth/google`, {
        credential,
        recaptchaToken
      });
      setState({ user: response.data.user, token: response.data.token });
    } catch (err: unknown) {
      const message = (err as any)?.response?.data?.message || 'Không thể đăng nhập bằng Google';
      setError(message);
      setErrorCode((err as any)?.response?.data?.code || null);
      throw err;
    } finally {
      setLoading(false);
    }
  };


  const value = useMemo(
    () => ({
      ...state,
      login,
      register,
      loginWithGoogle,
      logout,
      loading,
      error,
      errorCode
    }),
    [state, loading, error, errorCode]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}



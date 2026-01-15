import type { ReactNode } from 'react';
import { useEffect, useMemo, useState } from 'react';
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

  const login = async (payload: { username: string; password: string }) => {
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

  const register = async (payload: { username: string; email: string; password: string }) => {
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

  const loginWithGoogle = async (credential: string) => {
    setLoading(true);
    setError(null);
    setErrorCode(null);
    try {
      const response = await axios.post(`${API_BASE_URL}/auth/google`, { credential });
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

  const logout = () => {
    setState({ user: null, token: null });
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



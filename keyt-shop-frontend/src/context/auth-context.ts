import { createContext } from 'react';

export interface AuthState {
  user: {
    id: string;
    username: string;
    email: string;
    admin: boolean;
    emailVerified?: boolean;
  } | null;
  token: string | null;
}

export interface AuthContextValue extends AuthState {
  login: (payload: { username: string; password: string }) => Promise<void>;
  register: (payload: { username: string; email: string; password: string }) => Promise<void>;
  loginWithGoogle: (credential: string) => Promise<void>;
  logout: () => void;
  loading: boolean;
  error: string | null;
  errorCode?: string | null;
}

export const AuthContext = createContext<AuthContextValue | undefined>(undefined);


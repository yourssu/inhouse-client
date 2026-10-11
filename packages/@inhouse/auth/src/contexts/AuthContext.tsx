import { createContext, useContext } from 'react';

import { type AuthTokenType } from '../apis/schema';
import { type AuthApiClient } from '../core/client';

export interface AuthContextValue {
  client: AuthApiClient;
  isAuthenticated: boolean;
  login: (code: string) => Promise<AuthTokenType>;
  logout: () => Promise<void>;
}

export const AuthContext = createContext<AuthContextValue | null>(null);

export const useAuth = (): AuthContextValue => {
  const value = useContext(AuthContext);
  if (!value) {
    throw new Error('useAuth 는 <AuthProvider> 안에서만 사용할 수 있어요.');
  }
  return value;
};

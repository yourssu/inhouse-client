import { useCallback, useMemo, useState } from 'react';

import type { AuthTokenType } from '../apis/schema';
import type { AuthConfig } from '../config';

import { googleLogin } from '../apis/google';
import { logout as inhouseLogout } from '../apis/session';
import { AuthContext, type AuthContextValue } from '../contexts/AuthContext';
import { type AuthApiClient, createAuthApiClient } from '../core/client';
import { getAuthTokens, removeAuthTokens, setAuthTokens } from '../storage/tokens';

interface AuthProviderProps {
  children: React.ReactNode;
  /**
   * 외부에서 `createAuthApiClient` 를 통해 만든 `AuthApiClient`를 전달해서 사용할 수 있도록 해요.
   * 전달하지 않으면 내부적으로 새롭게 만들어요.
   */
  client?: AuthApiClient;
  config: AuthConfig;
}

export const AuthProvider = ({ config, client, children }: AuthProviderProps) => {
  const apiClient = useMemo<AuthApiClient>(() => {
    if (client) {
      return client;
    }
    return createAuthApiClient({
      baseURL: config.apiBaseURL,
    });
  }, [client, config.apiBaseURL]);

  const [tokens, setTokensState] = useState<AuthTokenType | undefined>(() => getAuthTokens());

  const login = useCallback(
    async (code: string) => {
      const newTokens = await googleLogin(apiClient.nativeApi, code);
      setAuthTokens(newTokens);
      setTokensState(newTokens);
      return newTokens;
    },
    [apiClient],
  );

  const logout = useCallback(async () => {
    const current = getAuthTokens();
    if (current) {
      await inhouseLogout(apiClient.api, current);
    }
    removeAuthTokens();
    setTokensState(undefined);
  }, [apiClient]);

  const value = useMemo<AuthContextValue>(
    () => ({
      isAuthenticated: !!tokens,
      client: apiClient,
      login,
      logout,
    }),
    [tokens, apiClient, login, logout],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

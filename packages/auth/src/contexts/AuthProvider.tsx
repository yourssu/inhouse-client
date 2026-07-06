import { createContext, type ReactNode, useCallback, useContext, useMemo, useState } from 'react';

import { type AuthApiClient, createAuthApiClient } from '../apis/client';
import { googleLogin, logout as logoutEndpoint } from '../apis/endpoints';
import { type AuthTokenType } from '../apis/schema';
import { type AuthConfig } from '../config';
import { getAuthTokens, removeAuthTokens, setAuthTokens } from '../storage/tokens';

type AuthStatus = 'authenticated' | 'unauthenticated';

interface AuthContextValue {
  api: AuthApiClient['api'];
  config: AuthConfig;
  login: (code: string) => Promise<AuthTokenType>;
  logout: () => Promise<void>;
  nativeApi: AuthApiClient['nativeApi'];
  status: AuthStatus;
  tokens: AuthTokenType | undefined;
}

interface AuthProviderProps {
  children: ReactNode;
  /**
   * 외부에서 만든 클라이언트(예: 앱의 모듈 싱글톤)를 재사용할 때 전달해요.
   * 전달하지 않으면 Provider 가 내부적으로 클라이언트를 만들어요.
   * client 를 전달하면 onUnauthorized 는 무시돼요 (클라이언트에 이미 설정돼 있어야 해요).
   */
  client?: AuthApiClient;
  config: AuthConfig;
  onUnauthorized?: () => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export const useAuth = (): AuthContextValue => {
  const value = useContext(AuthContext);
  if (!value) {
    throw new Error('useAuth 는 <AuthProvider> 안에서만 사용할 수 있어요.');
  }
  return value;
};

export const AuthProvider = ({ config, client, onUnauthorized, children }: AuthProviderProps) => {
  // onUnauthorized 는 클라이언트 생성 시 캡처돼요. 안정적인 참조(useCallback / 모듈 스코프)로
  // 전달하면 클라이언트가 재생성되지 않아요. 전달하지 않으면 `/signin` 하드 리다이렉트가 기본 동작이에요.
  const apiClient = useMemo<AuthApiClient>(() => {
    if (client) {
      return client;
    }
    return createAuthApiClient({
      apiBaseURL: config.apiBaseURL,
      getTokens: getAuthTokens,
      removeTokens: removeAuthTokens,
      setTokens: setAuthTokens,
      onUnauthorized,
    });
  }, [client, config.apiBaseURL, onUnauthorized]);

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
      await logoutEndpoint(apiClient.api, current);
    }
    removeAuthTokens();
    setTokensState(undefined);
  }, [apiClient]);

  const value = useMemo<AuthContextValue>(
    () => ({
      status: tokens ? 'authenticated' : 'unauthenticated',
      tokens,
      config,
      api: apiClient.api,
      nativeApi: apiClient.nativeApi,
      login,
      logout,
    }),
    [tokens, config, apiClient, login, logout],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

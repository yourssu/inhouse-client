import Cookies from 'js-cookie';

import type { AuthTokenType } from '@/apis/auth/schema';

export const CookieName = {
  AccessToken: 'accessToken',
  RefreshToken: 'refreshToken',
  TokenType: 'tokenType',
} as const;

export const getAuthTokens = (): AuthTokenType | undefined => {
  const accessToken = Cookies.get(CookieName.AccessToken);
  const refreshToken = Cookies.get(CookieName.RefreshToken);
  const tokenType = Cookies.get(CookieName.TokenType);

  if (!accessToken || !refreshToken || !tokenType) {
    return undefined;
  }

  return {
    accessToken,
    refreshToken,
    tokenType,
  };
};

export const setAuthTokens = ({ accessToken, refreshToken, tokenType }: AuthTokenType): void => {
  Cookies.set(CookieName.AccessToken, accessToken, {
    path: '/',
    domain: window.location.hostname,
    expires: 7,
  });
  Cookies.set(CookieName.RefreshToken, refreshToken, {
    path: '/',
    domain: window.location.hostname,
    expires: 7,
  });
  Cookies.set(CookieName.TokenType, tokenType, {
    path: '/',
    domain: window.location.hostname,
    expires: 7,
  });
};

export const removeAuthTokens = (): void => {
  Cookies.remove(CookieName.AccessToken, {
    path: '/',
    domain: window.location.hostname,
  });
  Cookies.remove(CookieName.RefreshToken, {
    path: '/',
    domain: window.location.hostname,
  });
  Cookies.remove(CookieName.TokenType, {
    path: '/',
    domain: window.location.hostname,
  });
};

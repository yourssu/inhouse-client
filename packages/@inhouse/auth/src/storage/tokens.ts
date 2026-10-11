import Cookies from 'js-cookie';

import type { AuthTokenType } from '../apis/schema';

const CookieName = {
  AccessToken: 'accessToken',
  RefreshToken: 'refreshToken',
  TokenType: 'tokenType',
} as const;

// TODO(#5): Module Federation 에서 shell(host)과 remote 앱이 서로 다른 서브도메인에 떴을 때
// auth 쿠키를 공유하려면 부모 도메인(예: 'yourssu.com')으로 굽도록 바꿔야 해요.
// 지금은 원본 scouter 동작대로 window.location.hostname(host-only)을 사용해요.
const cookieOptions = { path: '/', domain: window.location.hostname, expires: 7 } as const;
const removeOptions = { path: '/', domain: window.location.hostname } as const;

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
  Cookies.set(CookieName.AccessToken, accessToken, cookieOptions);
  Cookies.set(CookieName.RefreshToken, refreshToken, cookieOptions);
  Cookies.set(CookieName.TokenType, tokenType, cookieOptions);
};

export const removeAuthTokens = (): void => {
  Cookies.remove(CookieName.AccessToken, removeOptions);
  Cookies.remove(CookieName.RefreshToken, removeOptions);
  Cookies.remove(CookieName.TokenType, removeOptions);
};

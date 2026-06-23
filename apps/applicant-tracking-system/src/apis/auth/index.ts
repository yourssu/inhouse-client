import { assert } from 'es-toolkit';

import { api, nativeApi } from '@/apis/api';
import {
  AuthTokenResponseSchema,
  type AuthTokenType,
  ValidateTokenResponseSchema,
} from '@/apis/auth/schema';
import { getAuthTokens, removeAuthTokens } from '@/utils/auth';

export const googleLogin = async (code: string) => {
  const response = await nativeApi
    .post<AuthTokenType>('oauth2/login/google', {
      json: { authorizationCode: code },
    })
    .json();
  return AuthTokenResponseSchema.parse(response);
};

export const refreshToken = async (refreshToken: string) => {
  const response = await nativeApi
    .post<AuthTokenType>('refresh-token', {
      json: {
        refreshToken,
      },
    })
    .json();
  return AuthTokenResponseSchema.parse(response);
};

export const validateToken = async () => {
  const response = await api.get('validate-token').json();
  return ValidateTokenResponseSchema.parse(response);
};

export const logout = async () => {
  const tokens = getAuthTokens();
  assert(!!tokens, '이미 로그아웃되어 있어요.');
  await api.post('logout', {
    json: { refreshToken: tokens.refreshToken },
  });
  removeAuthTokens();
};

import { assert } from 'es-toolkit';

import { type AuthApiClient } from './client';
import { AuthTokenResponseSchema, type AuthTokenType, ValidateTokenResponseSchema } from './schema';

export const googleLogin = async (nativeApi: AuthApiClient['nativeApi'], code: string) => {
  const response = await nativeApi
    .post<AuthTokenType>('oauth2/login/google', {
      json: { authorizationCode: code },
    })
    .json();
  return AuthTokenResponseSchema.parse(response);
};

export const refreshToken = async (nativeApi: AuthApiClient['nativeApi'], refreshToken: string) => {
  const response = await nativeApi
    .post<AuthTokenType>('refresh-token', {
      json: {
        refreshToken,
      },
    })
    .json();
  return AuthTokenResponseSchema.parse(response);
};

export const validateToken = async (api: AuthApiClient['api']) => {
  const response = await api.get('validate-token').json();
  return ValidateTokenResponseSchema.parse(response);
};

export const logout = async (api: AuthApiClient['api'], tokens: AuthTokenType) => {
  assert(!!tokens, '이미 로그아웃되어 있어요.');
  await api.post('logout', {
    json: { refreshToken: tokens.refreshToken },
  });
};

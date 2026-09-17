import type { AuthApiClient } from '../core/client';

import { AuthTokenResponseSchema, type AuthTokenType, ValidateTokenResponseSchema } from './schema';

export const refreshToken = async (nativeApi: AuthApiClient['nativeApi'], refreshToken: string) => {
  const response = await nativeApi
    .post<AuthTokenType>('refresh-token', {
      json: {
        refreshToken,
      },
      retry: { limit: 0 },
    })
    .json();
  return AuthTokenResponseSchema.parse(response);
};

export const validateToken = async (api: AuthApiClient['api']) => {
  const response = await api
    .get('validate-token', {
      retry: { limit: 0 },
    })
    .json();
  return ValidateTokenResponseSchema.parse(response);
};

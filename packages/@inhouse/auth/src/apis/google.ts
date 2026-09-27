import type { AuthApiClient } from '../core/client';

import { AuthTokenResponseSchema, type AuthTokenType } from './schema';

export const googleLogin = async (nativeApi: AuthApiClient['nativeApi'], code: string) => {
  const response = await nativeApi
    .post<AuthTokenType>('oauth2/login/google', {
      json: { authorizationCode: code },
    })
    .json();
  return AuthTokenResponseSchema.parse(response);
};

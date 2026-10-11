import { assert } from 'es-toolkit';

import type { AuthApiClient } from '../core/client';
import type { AuthTokenType } from './schema';

export const logout = async (api: AuthApiClient['api'], tokens: AuthTokenType) => {
  assert(!!tokens, '이미 로그아웃되어 있어요.');
  await api.post('logout', {
    json: { refreshToken: tokens.refreshToken },
  });
};

import {
  createAuthApiClient,
  getAuthTokens,
  removeAuthTokens,
  setAuthTokens,
} from '@yourssu-inhouse/auth';

import { config } from '@/config';

export const { api, nativeApi } = createAuthApiClient({
  apiBaseURL: config.apiBaseURL,
  getTokens: getAuthTokens,
  removeTokens: removeAuthTokens,
  setTokens: setAuthTokens,
  onUnauthorized: () => {
    // pre-MF standalone 에서는 하드 리다이렉트가 안전해요. MF(#5)에서 라우터 기반으로 정제해요.
    window.location.href = '/signin';
  },
});

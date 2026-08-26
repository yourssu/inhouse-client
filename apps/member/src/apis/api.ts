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
    window.location.href = '/signin';
  },
});

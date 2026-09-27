import { createAuthApiClient } from '@inhouse/auth';

import { config } from '@/config';

export const { api, nativeApi } = createAuthApiClient({
  baseURL: config.apiBaseURL,
});

import { createAuthApiClient } from '@yourssu-inhouse/auth';

import { config } from '@/config';

export const authClient = createAuthApiClient({
  baseURL: config.apiBaseURL,
});

export const STAGE: 'dev' | 'prod' = import.meta.env.VITE_STAGE === 'prod' ? 'prod' : 'dev';

export const config = {
  prod: {
    apiBaseURL: 'https://scouter-api.yourssu.com',
    googleOAuthURL: `https://scouter-api.yourssu.com/oauth2/google`,
  },
  dev: {
    apiBaseURL: 'https://scouter-dev-api.yourssu.com',
    googleOAuthURL: `https://scouter-dev-api.yourssu.com/oauth2/google`,
  },
}[STAGE];

export const authConfig = {
  apiBaseURL: config.apiBaseURL,
  googleOAuthURL: config.googleOAuthURL,
};

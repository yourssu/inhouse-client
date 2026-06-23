// const IS_DEV = import.meta.env.DEV;
export const STAGE: 'dev' | 'prod' = 'dev';

export const config = {
  prod: {
    apiBaseURL: 'https://scouter-api.yourssu.com',
    googleOAuthURL: `https://scouter-api.yourssu.com/oauth2/google`,
    s3ImageURL: 'https://s3.ap-northeast-2.amazonaws.com/scouter.yourssu.com/prod/mail-files',
  },
  dev: {
    apiBaseURL: 'https://scouter-dev-api.yourssu.com',
    googleOAuthURL: `https://scouter-dev-api.yourssu.com/oauth2/google`,
    s3ImageURL: 'https://s3.ap-northeast-2.amazonaws.com/scouter.yourssu.com/dev/mail-files',
  },
}[STAGE];

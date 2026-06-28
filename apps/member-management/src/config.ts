// const IS_DEV = import.meta.env.DEV;
export const STAGE: 'dev' | 'prod' = 'dev';

export const config = {
  prod: {},
  dev: {},
}[STAGE];

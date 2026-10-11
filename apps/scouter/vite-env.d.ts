/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_SCOUTER_MIXPANEL_TOKEN?: string;
  readonly VITE_STAGE?: 'dev' | 'prod';
}

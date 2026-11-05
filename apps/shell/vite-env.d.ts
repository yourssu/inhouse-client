/// <reference types="vite/client" />

declare const MFA_REMOTE_IDS: readonly string[];

interface ImportMetaEnv {
  readonly VITE_STAGE?: 'dev' | 'prod';
}

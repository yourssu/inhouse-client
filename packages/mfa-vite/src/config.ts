/*
  MFA 설정 계약은 mfa-core(공용 계층) 가 단일 출처예요. mfa-vite(빌드 계층) 는 여기서 재내보내기만
  해요 — 계약을 mfa-core 에 두면 shell app 이 mfa.config.ts 를 임포트할 때 @module-federation/vite
  → vite → @rolldown → @types/node 타입 체인이 app 프로그램으로 유입되지 않아요.
*/
export {
  DEFAULT_PLUGIN_PATH,
  envKeyForRemote,
  type MfaConfig,
  type MfaRemoteEntry,
  PLUGIN_EXPOSE_KEY,
  REMOTE_ENTRY_FILENAME,
  remoteEntryDevUrl,
} from '@yourssu-inhouse/mfa-core';

import type { MfaConfig } from '@yourssu-inhouse/mfa-core';

/*
  MFA 단일 출처 설정. 새 remote 를 추가할 때:
  - 이 파일에 { id, port } 한 줄(위치 다를 때만 plugin: { path })을 추가하고,
  - turbo.json 의 @yourssu-inhouse/shell#build.dependsOn 에 '<pkg>#build' 한 줄을 추가해요.
    (빌드 순서는 turbo.json 이 유일 출처이라 mfa.config 가 안 다뤄요.)
  - mfa-vite 가 shell·remote 의 federation(shared/remotes/exposes/ports) 를 여기서 파생해요.
  - mfa-shell 이 buildRemoteSpecs(config.remotes) 로 runtime 레지스트리를 파생해요.

  expose 키(`./plugin`)·remoteEntry 파일명(`remoteEntry.js`)·plugin 소스 경로(`./src/plugin.ts`)
  은 고정 계약/기본값이라 적지 않아도 돼요. 위치가 다를 때만 plugin: { path } 로 override 해요.

  이전에는 plugins.config.ts·shell vite.config.ts·turbo.json·shell CSS @source 가 모두 같은
  remote 정보를 다른 형태로 들고 있었어요.
*/
export const mfaConfig: MfaConfig = {
  remotes: [
    {
      id: 'scouter',
      port: 5174,
    },
    {
      id: 'inhouse',
      port: 5175,
    },
  ],
};

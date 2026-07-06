import type { MfaConfig } from '@yourssu-inhouse/mfa-core';

/*
  MFA 단일 출처 설정. 새 remote 를 추가할 때 이 파일 한 곳만 고쳐요:
  - mfa-vite 가 shell·remote 의 federation(shared/remotes/exposes/ports) 를 여기서 파생해요.
  - mfa-shell 이 buildRemoteSpecs(config.remotes) 로 runtime 레지스트리를 파생해요.
  - turbo build depends 는 여기 buildDeps 를 보고 수동으로 turbo.json 에 반영해요(자동화는 추후).

  이전에는 plugins.config.ts·shell vite.config.ts·turbo.json·shell CSS @source 가 모두 같은
  remote 정보를 다른 형태로 들고 있었어요.
*/
export const mfaConfig: MfaConfig = {
  remotes: [
    {
      buildDeps: ['@yourssu-inhouse/scouter'],
      entryPath: 'remoteEntry.js',
      expose: './plugin',
      id: 'scouter',
      port: 5174,
      sourcePath: './src/plugin.ts',
    },
    {
      buildDeps: ['@yourssu-inhouse/inhouse'],
      entryPath: 'remoteEntry.js',
      expose: './plugin',
      id: 'inhouse',
      port: 5175,
      sourcePath: './src/plugin.ts',
    },
  ],
};

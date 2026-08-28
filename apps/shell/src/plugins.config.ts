import { buildRemoteSpecs, type RemotePluginSpec } from '@yourssu-inhouse/mfa-shell';

/*
  mfaVitePlugin.shell 이 mfa.config 의 remote id를 빌드 시점에 주입해요. shell 이 아는 건
  MF remote 이름뿐이고, expose 키(`./plugin`)와 plugin 내부 구조는 몰라요.
*/
export const remotePluginSpecs: readonly RemotePluginSpec[] = buildRemoteSpecs(
  MFA_REMOTE_IDS.map((id) => ({ id })),
);

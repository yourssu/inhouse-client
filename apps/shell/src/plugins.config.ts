import { buildRemoteSpecs, type RemotePluginSpec } from '@yourssu-inhouse/mfa-shell';

import { mfaConfig } from '../../../mfa.config';

/*
  shell 이 런타임에 조립할 remote Plugin spec 목록이에요. 더 이상 remote 목록을 shell 전용
  레지스트리로 수기 관리하지 않아요 — mfa.config 의 remotes 에서 buildRemoteSpecs 로 파생해요.
  shell 이 아는 건 MF remote 이름뿐이고, expose 키(`./plugin`)는 고정 계약이라 여기엔 드러나지
  않아요. 각 plugin 의 내부 구조는 몰라요. graft/init/assets/mocks 로직은 이 레지스트리 위로
  generic 하게 동작해 더 이상 건드리지 않아도 돼요.
*/
export const remotePluginSpecs: readonly RemotePluginSpec[] = buildRemoteSpecs(mfaConfig.remotes);

# inhouse monorepo

## Remote를 shell에 연결하기

remote의 MFA 연결은 앱 루트 `remotePlugin.ts`에서 선언한다. remote 이름과 포트는 `mfa.config.ts`, 인증 연결점과 서비스 basePath는 routeTree를 통해 플랫폼이 결정한다.

```ts
// apps/<remote>/remotePlugin.ts
import { defineRemotePlugin } from '@inhouse-mfa/core';

import { routeTree } from './src/routeTree.gen';

export default defineRemotePlugin({ routeTree });
```

Vite 설정에는 `mfaVitePlugin.remote()`를 사용한다. 다른 진입점이 필요하면 `mfaVitePlugin.remote({ pluginEntry: './integration/remotePlugin.ts' })`로 지정한다. 상대경로는 Vite root 기준이며 TypeScript 검사 범위에도 해당 파일을 포함해야 한다.

초기화나 서비스 공통 Provider가 필요하면 `global` 객체로 연결한다. 구현 파일 위치와 이름은 자유롭게 정할 수 있다.

```ts
import { defineRemotePlugin } from '@inhouse-mfa/core';

import { bootstrap, GlobalComponent } from './src/global';
import { routeTree } from './src/routeTree.gen';

export default defineRemotePlugin({
  routeTree,
  global: {
    bootstrap,
    Global: GlobalComponent,
  },
});
```

`bootstrap`만 필요하면 `global: { bootstrap }`을 사용하고, 둘 다 필요 없으면 `global`을 생략한다. 빈 초기화 함수나 wrapper는 만들지 않는다.

- plugin과 정적 의존성은 shell의 remote 계약 로드 때 평가된다. 서비스 초기화·구독을 모듈 최상위에서 실행하지 않는다.
- shell 인증을 통과한 서비스 진입 시 bootstrap을 실행하고, 완료 후 서비스 beforeLoad·loader를 실행한다. bootstrap은 동기·비동기를 지원하고 필요하면 cleanup 함수를 반환한다.
- 서비스 이탈 시 cleanup을 실행한다. 진행 중인 bootstrap이 있다면 완료 직후 정리하고 다음 진입의 초기화를 직렬로 실행한다.
- Global은 children을 렌더링하는 일반 React 컴포넌트다. shell의 Router·Auth·Query Context를 사용할 수 있다. 구독은 Effect에서 설치하고 해제한다.
- 무거운 SDK나 mock 의존성은 bootstrap 안에서 동적으로 import할 수 있다.
- HMR에서 bootstrap이 바뀌면 cleanup 후 다시 초기화하고 Global만 바뀌면 초기화를 유지한다. routeTree 구조나 global 필드 유무가 바뀌면 전체 reload할 수 있다.

서비스 라우트는 remote의 `/_auth` 아래에 구성한다. 실제 인증과 공통 layout은 shell이 소유한다. `routeTree.gen.ts`를 직접 편집하거나 remote에 별도 mount·HTML 진입점을 추가하지 않는다.

서비스 CSS는 `src/styles/index.css`에 두면 플랫폼이 연결한다. remote 개발 화면은 shell 주소에서 확인한다. 기존 `inhouse-mfa/route.ts`, `inhouse-mfa/global.ts`는 사용하지 않는다.

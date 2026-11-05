# Module Federation

## 적용 범위

shell·remote 등록, route·global 계약, graft, shared dependency, remote CSS·asset과 Module Federation 검증에 적용한다. 폴더·패키지 경계는 `project-architecture.md`, 라우팅은 `routing-url-state.md`, 인증은 `auth.md`를 함께 읽는다.

## 시스템 경계

- shell은 단일 router, 인증 진입 가드, 공통 PageLayout, QueryClient와 앱 전역 Provider를 소유한다.
- remote는 shell에 route subtree와 선택적인 global 모듈을 제공한다. remote 개발 서버·빌드·배포는 독립적으로 유지한다.
- 브라우저에서 개발 화면은 shell 주소로 확인한다. remote에는 `index.html`을 추가하지 않고 플랫폼도 HTML이나 standalone preview를 생성하지 않는다.
- remote에는 앱을 mount하는 `main.tsx`를 두지 않는다. `src/routeTypes.ts`에서 router 생성·export와 `Register` 타입 등록을 관리한다. shell 실행 중에는 `useRouter()`로 shell의 router를 소비하고 remote router를 별도로 생성·mount하지 않는다. remote 실행·빌드 입력은 `inhouse-mfa/route.ts`다.
- shell은 remote 내부 폴더를 직접 import하지 않고 Federation 계약을 소비한다.

## 단일 출처

| 계약                                                     | 단일 출처                                                                    |
| -------------------------------------------------------- | ---------------------------------------------------------------------------- |
| remote workspace·dev port·공통 CSS 제외 목록·shared 정책 | `mfa.config.ts`                                                              |
| shell·remote Federation 구성                             | `packages/@inhouse-mfa/vite/src/plugins/mfaVitePlugin/index.ts`              |
| remote 빌드 입력·dev server·config watch                 | `packages/@inhouse-mfa/vite/src/plugins/mfaVitePlugin/remoteConfigPlugin.ts` |
| remote entry 파일명·계약 경로·env key                    | `packages/@inhouse-mfa/vite/src/core/config.ts`                              |
| shared 구성·catalog 버전 조회                            | `packages/@inhouse-mfa/vite/src/core/shared.ts`                              |
| remote load retry                                        | `packages/@inhouse-mfa/vite/src/plugins/retryPlugin.ts`                      |
| 고정 expose key                                          | `packages/@inhouse-mfa/core/src/config.ts`                                   |
| remote route 공개                                        | `apps/<remote>/inhouse-mfa/route.ts`                                         |
| 선택적인 remote global 공개                              | `apps/<remote>/inhouse-mfa/global.ts` 또는 `global.tsx`                      |
| runtime load·graft·실패 격리                             | `packages/@inhouse-mfa/shell/src/`                                           |
| shell runtime spec                                       | `mfa.config.ts`에서 파생되는 `apps/shell/src/main.tsx`                        |
| workspace build 순서                                     | `turbo.json`                                                                 |

구체적인 포트·버전·build 의존성은 위 구현을 확인한다. shell build에 remote build를 추가하거나 remote CSS를 합치는 규칙을 추측하지 않는다.

## 새 remote 등록 절차

1. `apps/<remote>` workspace와 package name을 만든다.
2. `mfa.config.ts`에 고유한 `workspace`와 `port`를 추가한다. workspace package name이 remote id이며 env key·배포 이름은 마지막 세그먼트에서 파생한다.
3. remote Vite config에서 인자 없는 `mfaVitePlugin.remote()`를 사용한다. Federation remotes·exposes·shared나 dev port를 복제하지 않는다.
4. `inhouse-mfa/route.ts`에서 생성된 `src/routeTree.gen.ts`의 `routeTree`를 공개한다. `routeTree.gen.ts`는 직접 편집하지 않는다.
5. routeTree의 `/_auth` 아래에 서비스 basePath를 구성한다. 인증 guard·AuthProvider·shell layout을 remote 라우트에 복제하지 않는다.
6. 서비스 초기화는 `src/global.tsx`의 `bootstrap`으로 구현하고 필요한 cleanup을 반환한다. React hook이 필요한 구독과 서비스 공통 Provider는 children을 받는 `GlobalComponent`에 둔다. Global은 반드시 children을 렌더링한다. `inhouse-mfa/global.ts`에서 `bootstrap`, `GlobalComponent as Global` 중 필요한 항목을 공개한다. module 최상위에서 `bootstrap()`을 직접 호출하지 않는다.
7. `src/styles/index.css`에 서비스 스타일을 둔다. 계약 변환이 CSS와 선택적인 global 모듈을 연결하므로 앱에서 같은 MFA 조립 로직을 복제하지 않는다.
8. 제품 탐색에 필요하면 shell 메뉴를 추가한다. runtime spec 목록은 수기로 복제하지 않는다.
9. remote·shell build와 shell 조합을 검증한다. 독립 HTML·preview helper·중앙 mock lifecycle을 추가하지 않는다.

## Route 계약과 graft

- 모든 remote는 고정 expose key `./route`로 routeTree와 선택적인 global 모듈을 공개한다.
- shell의 `composePlugins`가 공개 routeTree의 `/_auth`와 첫 서비스 분기에서 entry·basePath를 읽어 `defineRemotePlugin` 계약을 구성한다.
- `defineRemotePlugin`은 entry와 children의 basePath를 검증한다. 앱마다 같은 탐색·검증을 구현하지 않는다.
- shell의 `/_auth`가 인증 guard·공통 layout을 소유한다. remote `/_auth` 자체는 추가하지 않고 그 children만 graft한다.
- remote `__root__`는 route tree 생성에 필요한 최소 root, `_auth`는 서비스 분기를 찾는 연결점으로 유지한다. 두 라우트의 옵션을 shell 실행에 적용하지 않는다.
- 서비스 title·error/pending/notFound UI·loader·beforeLoad·레이아웃은 `/recruit`, `/members` 같은 실제 서비스 분기에 둔다. shell의 `HeadContent`가 서비스 head도 렌더링한다. `RemoteOutlet`은 일반 Outlet이다.
- `RouteRegistry`가 plugin 이름·basePath 충돌을 검사한다. graft는 후보 트리를 실제 Router로 검증하고 실패하면 기존 트리와 실패한 remote의 원본을 보존한다.
- 같은 plugin을 중복 graft하지 않는다. load·graft 실패는 해당 remote만 failures에 기록하고 다른 서비스는 계속 동작한다.
- `loadRemote` id는 `remoteName/expose` 형식이며 expose 앞의 `./`는 제거한다.

## Global과 초기화

- route 계약은 선택적인 global 모듈의 동적 import 함수만 공개한다. shell이 전체 route를 조합할 때 global 모듈을 실행하지 않는다.
- shell 인증 가드가 통과한 서비스 분기의 beforeLoad 앞에서 global 모듈을 읽고 선택적인 `bootstrap()`을 기다린다. bootstrap 완료 후 서비스 beforeLoad·하위 loader가 실행되고, Global과 서비스 화면이 준비된 초기화를 사용한다. 컴포넌트 mount에서 bootstrap을 중복 호출하지 않는다.
- `bootstrap`은 동기 또는 비동기 함수이며 cleanup 함수를 반환하거나 생략한다. 서비스 이탈 때 반환된 cleanup을 호출하고 재진입 때 bootstrap을 다시 호출한다. 모듈 import 캐시는 유지한다.
- 초기화 도중 이탈하면 완료 직후 cleanup을 호출한다. 아직 실행 중인 초기화와 cleanup이 끝난 뒤 다음 mount의 bootstrap을 시작해 겹치는 설치를 막는다. 개발 StrictMode에서도 취소된 mount의 결과를 화면에 반영하지 않는다.
- `GlobalComponent as Global`은 `RemoteGlobalProps`의 children을 렌더링하는 서비스 wrapper다. shell Router·Auth·Query Context를 사용할 수 있고 서비스 공통 Provider로 children과 effect 컴포넌트를 감쌀 수 있다. Provider를 소비하는 hook은 그 Provider 하위에 둔다. 화면의 Suspense는 Global 안쪽에 두어 데이터 로딩으로 Provider와 effect를 해제하지 않는다.
- 비활성 서비스의 preload는 건너뛰어 bootstrap이나 초기화에 의존하는 loader를 실행하지 않는다. 준비된 서비스 내부의 preload는 유지한다. 서비스 이탈·진입 취소·서비스 가드 실패 시 초기화를 정리하고 진행 중인 초기화도 완료 직후 cleanup한다.
- 개발 global 계약의 HMR boundary가 최신 모듈을 전달한다. 활성 서비스의 bootstrap 변경은 기존 cleanup 후 새 bootstrap을 직렬로 설치한다. 비활성 서비스는 최신 모듈만 기억하고 다음 진입에 설치한다. bootstrap이 같은 컴포넌트 변경은 초기화를 유지한다. 서비스 bootstrap 변경은 해당 서비스의 재마운트를 허용하고 shell 전체 새로고침은 요구하지 않는다.
- `inhouse-mfa/global.ts(x)` 자동 연결은 shell 계약을 위한 것이다. 서비스 초기화는 이 계약에서 `src/global.tsx`를 연결한다. mount·공통 Provider·테마 초기화는 shell이 담당한다.
- `lifecycle.init`, `lifecycle.mocks`, `createRemotePreviewApp` 같은 과거 API를 다시 도입하지 않는다.
- Member의 MSW는 `src/global.tsx`의 bootstrap에서 remote의 `STAGE === 'dev'`일 때 시작하고 cleanup에서 `worker.stop()`을 호출한다. 별도 MSW 환경 변수는 사용하지 않는다. worker script는 shell origin의 `/mockServiceWorker.js`를 사용한다. MSW는 shell origin 전체를 대상으로 하므로 Member URL 밖의 요청은 통과시킨다. shell 인증 요청 `/members/me`는 mock 상세 조회와 겹치므로 통과시키고 handler는 Member에 유지한다.

## Shared dependency와 QueryClient

- `mfa.config.ts`의 `sharedDependencies`가 shell·remote의 shared 목록과 singleton 정책의 단일 출처다.
- React, React DOM, TanStack Router·Query와 Context·store 소유 패키지는 경계에서 인스턴스가 갈라지지 않도록 singleton을 유지한다.
- 버전이 필요한 shared 항목은 `version: 'catalog'`로 선언한다. workspace catalog의 exact 버전으로 `requiredVersion`을 구성하며 subpath는 패키지 키로 조회한다.
- 실제 설치 버전을 구동·빌드 시 검사한다. 앱 Vite config에서 Federation 정책을 덧붙여 우회하지 않는다.
- `es-toolkit`, `react-simplikit`, `motion`, `zod`는 shared에 두지 않고 사용하는 번들에 포함한다.
- shell이 하나의 QueryClient를 remote에 제공한다. query·invalidate는 `createQueryKeyNamespace`로 서비스 namespace를 사용한다.
- 인증·권한 정책은 `auth.md`를 따르고 MFA 정리를 이유로 변경하지 않는다.

## CSS와 asset 소유권

- shell은 reset·token·component·layout 등 공통 CSS를 소유한다. `sharedCSS`는 remote에서 제외할 공통 CSS import 목록이다.
- remote는 자신의 Tailwind·서비스 CSS를 빌드한다. shell이 remote 소스까지 스캔하거나 remote CSS를 대신 빌드하지 않는다.
- `sharedCssPlugin`은 정상 resolver 결과를 `realpath`로 비교해 공통 CSS만 패키지에 포함된 실제 `empty.css`로 연결한다. Vite·Tailwind의 중첩 import와 namespace 분석에도 같은 판정을 적용하며 shell에는 치환을 적용하지 않는다. standalone 메타 태그 감지·공통 CSS 재로딩 분기를 추가하지 않는다.
- `sharedCSS`에는 컴파일 정의가 없는 출력 CSS만 등록한다. CSS Modules·Tailwind compiler directive·public에서 그대로 복사되는 CSS는 등록하지 않는다. 필요한 Tailwind plugin·theme·utility·reference 파일은 별도로 유지한다.
- 서비스 CSS 원문과 import를 유지하고 CSS Modules export, layer 순서, 상대 CSS URL과 의존성 HMR은 Vite·Tailwind에 맡긴다. `?inline`은 유지하고 remote 서비스·공통 CSS의 `?raw`·`?url` 우회는 거부한다. 중첩 CSS에도 remote asset 사용 규칙을 검사한다. 조건부 import는 기본 도구의 문법 제약을 따른다.
- 내부 CSS resolver 연결은 Vite 8의 deprecated `createResolver` 호환 경로를 사용한다. Vite·Tailwind 업그레이드 시 실제 개발 서버·빌드·namespace·중첩 CSS HMR 통합 테스트를 실행한다. CSS 입력 문자열 비교 캐시 패치는 추가하지 않는다.
- Tailwind namespace와 자동 스캔을 유지한다. 서비스 전용 utility·editor 스타일은 remote CSS에 둔다.
- `public` 파일은 `@inhouse-mfa/vite/assets`의 `publicAsset()`으로 remote origin에서 참조한다. 소스 이미지·폰트는 import, CSS asset은 소스 상대 `url()`을 사용한다. 외부·data URL은 그대로 유지한다.
- 배포 시 remote HTML은 생성되지 않는다. 기존 public의 MSW worker는 별도 배포 제외 처리를 유지한다.

## 코드 주석 정책

MFA 등록 절차·소유권은 이 문서에서 설명한다. 앱 entry·계약·Vite config에 장문 설명을 복제하지 않는다. 코드 주석은 도구 제약·타입 한계·시간적 결함처럼 해당 줄에서 필요한 인과에 한정한다.

## 검증

- 변경한 MFA package의 type·lint·format·관련 test를 실행한다. build package는 build하고 JIT runtime은 소비 앱 build로 검증한다.
- 공용 설정 변경이면 루트 검사와 shell·모든 remote build를 실행한다.
- HTML 없이 remoteEntry·JS·CSS·asset이 생성되고 remote 계약이 앱을 별도로 mount하거나 remote router 인스턴스를 생성하지 않는지 확인한다.
- shell에서 최종 URL, 인증 부모·공통 layout, 서비스 분기·Global 수명, CSS 중복·namespace와 asset origin을 확인한다.
- remote 하나의 load 실패가 다른 서비스를 막지 않는지 변경 영향에 따라 확인한다.
- 자동 검사·실제 UI 확인·미실행 검증을 구분해 보고한다. remote 직접 접속이나 preview 페이지 성공을 검증 조건으로 삼지 않는다.

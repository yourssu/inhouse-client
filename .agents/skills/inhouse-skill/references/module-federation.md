# Module Federation

## 적용 범위

shell·remote 등록, plugin manifest, route graft, preview, shared dependency, lifecycle, remote CSS와 Module Federation 검증에 적용한다. 일반 폴더·패키지 경계는 `project-architecture.md`, URL과 route 파일은 `routing-url-state.md`, 인증 구현은 `auth.md`를 함께 읽는다.

## 시스템 경계

- shell은 단일 router, 인증 진입 가드, 공통 PageLayout, QueryClient와 앱 전역 Provider를 소유하는 runtime orchestrator다.
- remote는 독립 앱이 아니라 `RemotePlugin` 계약으로 route subtree와 lifecycle을 제공하는 plugin이다.
- shell은 remote 내부 폴더나 route 구현을 알지 않고 plugin manifest만 소비한다.
- remote의 `main.tsx`는 제품 entry가 아니라 shell 없이 개발할 때 쓰는 preview entry다.

## 단일 출처

| 계약 | 단일 출처 |
| --- | --- |
| remote id·dev port·plugin source override | `mfa.config.ts` |
| shell과 remote의 federation 설정 | `packages/mfa-vite/src/plugin.ts` |
| expose key·remote entry 파일명·plugin 기본 경로 | `packages/mfa-core/src/config.ts` |
| shared·singleton dependency 정책 | `packages/mfa-core/src/shared.ts` |
| shell build 선행 remote | `turbo.json`의 `@yourssu-inhouse/shell#build.dependsOn` |
| remote route·lifecycle manifest | `apps/<remote>/src/plugin.ts` |
| runtime load·graft·실패 격리 | `packages/mfa-shell/src/` |
| shell이 조합할 runtime spec | `mfa.config.ts`에서 파생된 `apps/shell/src/plugins.config.ts` |

포트, remote 목록, retry 횟수와 구체적인 shared 버전은 바뀔 수 있으므로 위 구현을 확인하고 문서의 숫자를 기억해 사용하지 않는다.

## 새 remote 등록 절차

1. `apps/<remote>` workspace와 package name을 만든다.
2. `mfa.config.ts`에 고유한 `id`와 `port`를 추가한다. plugin 경로가 기본 `./src/plugin.ts`와 다를 때만 override한다.
3. `turbo.json`의 shell build 의존성에 remote workspace build를 추가한다.
4. remote Vite config에서 `mfaVitePlugin.remote({ id, remote })`를 사용한다. federation remotes·exposes·shared 객체를 직접 복제하지 않는다.
5. `src/plugin.ts`에서 `defineRemotePlugin`으로 name, basePath, entry, routeTree와 필요한 lifecycle을 선언한다.
6. `src/main.tsx`에서 같은 plugin과 routeTree를 `createRemotePreviewApp`에 전달한다.
7. remote의 pathless `~_auth.tsx`는 `<Outlet />`만 렌더링하는 통과 라우트로 유지한다.
8. shell 메뉴처럼 제품 탐색에 노출해야 하는 지점만 별도로 추가한다. runtime spec과 Vite remotes 목록은 수기로 복제하지 않는다.
9. remote와 shell build, preview, shell 조합을 검증한다.

## Plugin manifest 계약

- plugin `name`은 `mfa.config.ts`의 remote id와 일치한다.
- `routes.entry`는 remote routeTree에서 graft할 pathless anchor다. 현재 remote는 `/_auth`를 사용한다.
- `routes.basePath`는 plugin이 소유하는 최상위 URL 기능이다. 다른 plugin과 겹치지 않는다.
- `routes.routeTree`에는 생성된 전체 remote routeTree를 전달한다.
- 모든 remote는 고정 expose key `./plugin`으로 manifest 하나를 노출한다.
- `defineRemotePlugin`은 entry 존재 여부와 entry children의 basePath 계약을 정의 시점에 검증한다.

remote별로 routeTree를 직접 탐색하거나 `AnyRoute` 단언과 검증 로직을 복제하지 않는다.

## Route graft와 실패 격리

- shell의 `/_auth`가 graft anchor이며 실제 인증 guard와 공통 layout을 소유한다.
- remote의 `/_auth` 인스턴스 자체는 shell에 추가하지 않고 그 children만 shell anchor 아래에 graft한다.
- graft 후에도 remote route id와 full path 계약이 유지되어야 한다.
- `RouteRegistry`가 plugin basePath와 route id 충돌을 검사한다.
- 같은 plugin을 중복 graft하지 않는다.
- remote load 또는 graft 실패는 해당 plugin만 failures에 기록하고 다른 plugin과 shell은 계속 동작한다.
- `loadRemote` 호출 id는 `remoteName/expose` 형식이며 expose 앞의 `./`는 제거한다.

## Shared dependency

- `SHARED_DEPS`가 shell과 모든 remote의 shared 정책 단일 출처다.
- React, React DOM, TanStack Router, TanStack Query와 Context·store를 소유하는 패키지는 plugin 경계에서 인스턴스가 달라지지 않도록 singleton을 유지한다.
- 공개 subpath가 별도 모듈 인스턴스를 만들 수 있으면 필요한 subpath도 shared에 포함한다.
- `requiredVersion`이 있는 dependency는 runtime 검사와 workspace 실제 버전을 함께 갱신한다.
- 앱별 Vite config에 shared 설정을 덧붙여 우회하지 않는다.

shared 정책 변경은 모든 remote에 영향을 주므로 `mfa-core`, `mfa-vite`, `mfa-shell`, shell과 모든 remote를 검증한다.

## QueryClient와 인증 소유권

- shell이 하나의 QueryClient를 모든 remote에 제공한다. remote query와 invalidate key는 `pluginQueryKey(pluginName)` namespace를 사용한다.
- shell의 `/_auth`만 `requireAuth`와 공통 layout을 가진다.
- remote의 `~_auth.tsx`에 guard, AuthProvider 또는 shell layout을 복제하지 않는다.
- Module Federation shared 설정에서 Auth Context 관련 모듈 인스턴스가 달라지지 않는지 확인한다.

인증 API와 권한 정책 자체는 `auth.md`의 현재 계약을 따르고, MF 작업을 이유로 새 인증 정책을 추측해 만들지 않는다.

## Lifecycle과 mock

- `lifecycle.init`은 shell과 preview mount 전에 실행할 plugin 초기화가 실제로 있을 때만 사용한다.
- `lifecycle.mocks`는 MSW handler를 반환한다. 개발 모드에서 shell 또는 preview가 모든 handler를 하나의 worker로 합친다.
- mock하지 않는 remote 요청은 중앙 worker의 `bypass` 정책을 따른다.
- remote entry와 preview에서 같은 초기화·mock 소스를 재사용하고 별도 bootstrap을 복제하지 않는다.

## Remote preview

- preview는 독립 제품처럼 동작한다고 가정하지 않는다. shell chrome과 최종 route composition 없이 remote subtree를 확인하는 개발 도구다.
- `createRemotePreviewApp`은 local routeTree를 그대로 사용하고 plugin의 init·mocks lifecycle만 재사용한다.
- preview에서 자기 routeTree를 다시 graft하면 route가 중복되므로 graft하지 않는다.
- preview는 개발용 AuthProvider, PreviewBanner와 인증 통과 안내를 통해 shell 환경과의 차이를 명시한다.
- remote의 `main.tsx`가 plugin manifest나 lifecycle 구현을 다시 정의하지 않는다.

## CSS 소유권

- shell은 host Tailwind build 하나로 `apps/*/src/**`를 스캔해 remote가 사용하는 utility까지 생성한다.
- remote plugin은 Tailwind utility CSS를 runtime asset으로 별도 노출하지 않는다.
- remote preview는 자기 `styles/index.css`를 import해 Tailwind base와 앱 전용 선언을 포함한다.
- scouter처럼 랩 전용 `@utility`와 editor selector가 있으면 preview용 CSS entry에서 재사용하되, shell에 Tailwind theme·preflight를 중복 주입하지 않는다.
- `interior`와 `exterior`의 CSS는 각 패키지 공개 CSS entry를 사용한다.
- 새 remote가 생겨도 shell의 `apps/*/src/**` source glob을 remote별 목록으로 바꾸지 않는다.

## 코드 주석 정책

MF 구조, 등록 절차와 소유권은 이 문서를 단일 설명으로 사용한다. 앱 entry, plugin manifest, Vite config와 route 파일에 같은 시스템 설명을 장문 주석으로 복제하지 않는다. 코드 주석은 다음처럼 해당 줄 근처에서만 알 수 있는 인과에 제한한다.

- 외부 도구나 브라우저의 제약을 우회하는 이유
- 타입 시스템으로 표현되지 않는 runtime 전제
- 시간적 결함, retry 또는 성능 선택

함수명·타입·구조가 이미 말하는 동작을 주석으로 다시 설명하지 않는다.

## 검증

### remote route·plugin·preview 변경

```bash
.agents/skills/inhouse-skill/scripts/validate-workspace.sh \
  @yourssu-inhouse/<remote> --build
.agents/skills/inhouse-skill/scripts/validate-workspace.sh \
  @yourssu-inhouse/shell --build
```

- remote preview에서 route, init·mock과 앱 전용 CSS를 확인한다.
- shell에서 최종 basePath, 인증 부모, 공통 layout과 remote failure UI를 확인한다.

### config·shared·graft 변경

- 변경한 `mfa-core`, `mfa-vite`, `mfa-shell` workspace의 type·lint·format을 실행한다.
- build script가 있는 `mfa-core`, `mfa-vite`는 build하고 JIT로 소비되는 `mfa-shell`은 소비 앱 build로 검증한다.
- shell과 모든 remote의 type 검사와 build를 실행한다.
- shared instance, route id·basePath 충돌, remote 하나의 load 실패가 다른 plugin을 막지 않는지 확인한다.

build가 갱신한 `routeTree.gen.ts`는 직접 편집하지 말고 source route 변경에서 파생된 diff인지 확인한다.
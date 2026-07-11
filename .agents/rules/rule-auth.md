---
trigger: model_decision
description: 로그인, 회원가입, API 토큰 유지보수, 권한 가드 로직을 수정할 때 읽어야 합니다.
globs: packages/auth/**/*.ts, packages/auth/**/*.tsx, apps/*/src/apis/api.ts, apps/*/src/routes/~_auth.tsx
---

# Authentication & Guard (인증/인가 흐름)

인증/인가 로직은 전체 앱의 보안과 직결되며 파편화되기 쉽습니다. 이 레포에서는 인증을 **`@yourssu-inhouse/auth` 패키지**로 일원화하고, 각 앱은 팩토리로 클라이언트만 생성합니다. 토큰 저장, 네트워크 요청 시 주입·갱신, 라우트 가드를 다음과 같이 체계적으로 관리합니다.

> 📌 **MF 맥락**: 인증은 shell(host)이 중앙에서 소유합니다. shell의 `~_auth.tsx`가 `requireAuth()` 가드와 레이아웃 크롬을 담당하고, remote 앱들은 자신의 `~_auth.tsx`를 pathless 통과 라우트(`/<Outlet/>`)로만 둡니다(실제 가드는 shell이 graft 후 소유). 쿠키 도메인은 현재 `window.location.hostname`(host-only)이며, 서브도메인 분산 배포에서는 부모 도메인으로 굽도록 바꿔야 합니다(TODO #5).

## 1. 토큰 보관 및 유틸리티 (`@yourssu-inhouse/auth` — storage/tokens)

- 백엔드로부터 발급된 토큰(`accessToken`, `refreshToken`, `tokenType`)은 `js-cookie` 기반 쿠키에 저장됩니다.
- 토큰 조작은 반드시 패키지가 노출하는 함수를 사용합니다: `getAuthTokens()`, `setAuthTokens()`, `removeAuthTokens()`.
- React 컴포넌트 트리 내부에서는 `AuthProvider`/`useAuth()`(`@yourssu-inhouse/auth`)로 인증 상태(`status`, `tokens`, `login`, `logout`)를 소비합니다. `useAuth`는 Provider 하위가 아니면 throw합니다.
- 로더/가드 등 React context 밖에서는 `getAuthTokens()`로 쿠키를 직접 읽습니다 — context plumbing이 필요 없고 Module Federation 경계에서도 안전합니다.

## 2. API 요청 시 인증 헤더·자동 갱신 (`@yourssu-inhouse/auth` — apis/client)

- 인증이 필요한 모든 통신은 각 앱의 `@/apis/api.ts`에서 `createAuthApiClient(...)`로 만든 `api`(`ky` 인스턴스) 래퍼를 거칩니다.
  ```ts
  // apps/<app>/src/apis/api.ts
  export const { api, nativeApi } = createAuthApiClient({
    apiBaseURL: config.apiBaseURL,
    getTokens: getAuthTokens,
    setTokens: setAuthTokens,
    removeTokens: removeAuthTokens,
    onUnauthorized: () => {
      // pre-MF standalone 에서는 하드 리다이렉트가 안전. MF에서는 라우터 기반으로 정제.
      window.location.href = '/signin';
    },
  });
  ```
- **헤더 주입**: `api`는 `nativeApi` 위에 `beforeRequest` 훅으로 `getAuthTokens()`의 `accessToken`을 `Authorization: Bearer 토큰`으로 주입합니다.
- **토큰 자동 갱신 및 만료 처리 (Token Refresh)**: `beforeRetry` 훅이 HTTP `400/401/403` 또는 커스텀 `authErrorCodeMap` 응답에서 아래를 수행합니다(재시도 한도 내).
  1. 토큰이 없거나 무효 → `removeAuthTokens()` 후 `onUnauthorized()`(`/signin` 이동).
  2. `Auth-001` 등 갱신 가능 에러 → `refreshToken(nativeApi, refreshToken)` 요청, 성공 시 `setAuthTokens()` 저장 후 **재시도 요청의 `Authorization` 헤더를 직접 갱신**(ky는 retry 시 `beforeRequest`를 재실행하지 않으므로).
  3. `reconsentRequired` 등 사용자 피드백이 필요한 에러 → throw(리다이렉트 없이 UI에서 안내).
  4. 그 외 인증 에러 또는 갱신 실패 → logout(`removeAuthTokens()` + `onUnauthorized()`).
- 비즈니스 로직(훅/Fetcher)에서는 토큰 주입·갱신을 직접 다루지 않고 오직 `api`/`nativeApi` 인스턴스를 사용합니다.

## 3. 라우팅 권한 가드 (`requireAuth` — `~_auth.tsx`)

- TanStack Router의 파일 기반 라우팅을 활용하여, 로그인이 필요한 페이지들은 전부 `~_auth` 내부 경로로 묶습니다.
- **`beforeLoad` 차단 로직**: 패키지의 `requireAuth()` 가드를 `beforeLoad`에 연결합니다. 토큰이 없으면 `removeAuthTokens()` 후 `throw redirect({ to: '/signin' })`로 라우팅 진입을 차단합니다.
  ```ts
  // apps/shell/src/routes/~_auth.tsx — shell이 실제 가드를 소유
  export const Route = createFileRoute('/_auth')({
    beforeLoad: requireAuth(),
    component: () => <PageLayout>...</PageLayout>,
  });
  ```
- 권한(permit) 단위의 세부 가드가 필요하면 같은 패키지의 `requirePermission(...)`을 활용합니다.
- 페이지 진입 후 컴포넌트 내에서 `useEffect`로 로그인 체크하는 방식을 지양하고, 무조건 **라우터 레벨의 가드**를 따르세요.

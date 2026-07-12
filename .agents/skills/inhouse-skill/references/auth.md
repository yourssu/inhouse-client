# 인증과 권한

## 적용 범위

로그인·로그아웃, 토큰 저장, 인증 API 클라이언트, 갱신·재시도, 라우트 가드, 전역 `AuthProvider`를 변경할 때 적용한다.

## 필수 규칙

- 토큰 저장과 삭제는 `@yourssu-inhouse/auth`가 공개한 `getAuthTokens`, `setAuthTokens`, `removeAuthTokens`를 사용한다.
- 개별 fetcher나 컴포넌트에서 `Authorization` 헤더, 토큰 갱신, 인증 실패 redirect를 다시 구현하지 않는다.
- 인증 API는 `createAuthApiClient`가 만든 `api`·`nativeApi`를 사용한다.
- 컴포넌트 트리에서는 `AuthProvider`와 `useAuth`를 사용하고, 라우트 loader처럼 React Context 밖에서는 공개 storage·guard API를 사용한다.
- 보호된 페이지의 진입 차단은 shell 라우트의 `beforeLoad`와 `requireAuth`에서 처리한다. 컴포넌트 Effect로 뒤늦게 redirect하지 않는다.
- remote의 `~_auth`를 독립적인 인증 가드로 바꾸지 않는다. shell이 실제 인증 가드와 레이아웃을 소유한다.

## 전역 Provider 예외

`AuthProvider`는 feature 상태 wrapper 금지의 대상이 아니다. 인증 클라이언트, 토큰 상태, 로그인·로그아웃 계약을 앱 전역에서 한 번 초기화하고 수명을 소유하므로 별도 Provider 컴포넌트로 격리한다.

같은 이유로 Theme, Toast, QueryClient처럼 앱 전역 인프라를 초기화하는 Provider도 허용한다. feature 전용 상태와 전역 인프라 Provider를 같은 기준으로 판단하지 않는다.

## 라우트 성공 예시

shell만 인증 진입을 차단하고 공통 레이아웃을 소유한다.

```tsx
// apps/shell/src/routes/~_auth.tsx
export const Route = createFileRoute('/_auth')({
  beforeLoad: requireAuth(),
  component: AuthLayout,
});
```

remote의 같은 라우트는 route tree 결합을 위한 pathless 통과 지점만 제공한다.

```tsx
// apps/<remote>/src/routes/~_auth.tsx
export const Route = createFileRoute('/_auth')({
  component: () => <Outlet />,
});
```

remote에 `requireAuth()`나 shell 레이아웃을 복제하지 않고, 생성된 `routeTree.gen.ts`도 직접 수정하지 않는다.

## 구현 확인 지점

- 클라이언트 생성과 재시도: `packages/auth/src/apis/client.ts`
- endpoint와 오류 코드: `packages/auth/src/apis/`
- 토큰 저장: `packages/auth/src/storage/`
- Context 계약: `packages/auth/src/contexts/AuthProvider.tsx`
- 라우트 guard: `packages/auth/src/guards/`, `apps/shell/src/routes/~_auth.tsx`
- 앱 클라이언트 설정: `apps/*/src/apis/api.ts`

HTTP 상태 코드, 인증 오류 코드, retry limit, redirect 방식은 변경될 수 있으므로 위 구현을 확인하고 수정한다.

## 변경 시 주의

- ky 재시도 시점에 어떤 hook이 다시 실행되는지 확인한다. 갱신된 토큰이 실제 재시도 요청에 적용되는지 검증한다.
- refresh 동시 요청, 실패 후 토큰 제거, 사용자 재동의가 필요한 오류를 같은 실패로 뭉개지 않는다.
- Module Federation 경계에서 Auth Context 인스턴스가 중복되지 않는지 확인한다.

## 검증

- 로그인, 새로고침 후 복원, 로그아웃을 확인한다.
- 만료 토큰의 갱신 성공과 갱신 실패를 확인한다.
- 토큰 없음, 권한 없음, 재동의 필요 오류의 이동·피드백을 각각 확인한다.
- shell과 remote를 함께 실행해 보호 라우트가 올바른 부모 아래에 결합되는지 확인한다.
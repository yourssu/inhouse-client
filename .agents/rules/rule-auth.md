---
trigger: model_decision
description: 로그인, 회원가입, API 토큰 유지보수, 권한 가드 로직을 수정할 때 읽어야 합니다.
globs: src/apis/auth.ts, src/routes/~_auth.tsx, src/utils/auth.ts
---

# Authentication & Guard (인증/인가 흐름)

인증/인가 로직은 전체 앱의 보안과 직결되며 파편화되기 쉽습니다. 이 앱에서는 로그인 토큰 저장, 네트워크 요청 시 주입, 만료 시 갱신, UI 단의 가드 등을 다음과 같이 체계적으로 관리합니다.

## 1. 토큰 보관 및 유틸리티 (`src/utils/auth.ts`)

- 백엔드로부터 발급된 JWT/세션 토큰 등 인증정보는 반드시 `getAuthTokens()`, `setAuthTokens()`, `removeAuthTokens()` 함수를 사용하여 안전하게(스토리지나 메모리 등) 조작합니다.
- 토큰 만료 여부나 포맷은 여기서 다룹니다.

## 2. API 요청 시 인증 헤더 강제 (`src/apis/api.ts`)

- 인증이 필요한 모든 통신은 `api` (`ky` 인스턴스) 래퍼를 거칩니다.
- **헤더 주입**:
  `beforeRequest` 훅 라이프사이클을 통해 `getAuthTokens()`의 `accessToken` 값을 항상 `Authorization: Bearer 토큰`으로 주입합니다.
- **토큰 자동 갱신 및 만료 처리 (Token Refresh)**:
  `beforeRetry` 훅을 통해 만약 서버에서 HTTP `401` / `403` 또는 커스텀 에러(`authErrorCodeMap`)를 뱉는 경우:
  1. `refreshToken(기존 토큰)` 함수를 요청.
  2. 성공하면 새로운 토큰을 `setAuthTokens()`로 저장 후 원래 요청을 재시도.
  3. 갱신마저 실패하거나 알 수 없는 인증 에러일 경우, `removeAuthTokens()` 호출 후 `/signin` 페이지로 브라우저 레벨에서 리다이렉션(`window.location.href`) 처리합니다.

## 3. 라우팅 권한 가드 (`src/routes/~_auth.tsx`)

- TanStack Router의 파일 기반 라우팅을 활용하여, 로그인이 필요한 페이지들은 전부 `~_auth` 내부 경로로 묶습니다.
- **`beforeLoad` 차단 로직**:
  해당 라우트에 진입하기 직전에 `getAuthTokens()` 가 있는지 확인합니다. 토큰이 무효하거나 없으면 렌더링을 멈추고 `redirect({ to: '/signin' })` 를 발생시킵니다.
- 페이지 진입 후 컴포넌트 내에서 `useEffect`로 로그인 체크하는 방식을 지양하고, 무조건 **라우터 레벨의 가드**를 따르세요.

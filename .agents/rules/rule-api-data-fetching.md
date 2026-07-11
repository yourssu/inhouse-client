---
trigger: model_decision
description: 백엔드 API를 연결하거나, 데이터를 Fetching/Mutation 할 때, Zod 스키마를 구성할 때 읽어야 합니다.
globs: src/apis/**/*.ts, src/types/**/*.ts, src/query/**/*.ts
---

# API & Data Fetching (네트워크 및 스키마 검증)

이 문서는 프론트엔드에서 서버 데이터를 받아오고, 전송하며, 반환된 데이터를 엄격하게 타입 검사(Zod)하고 React Query 훅으로 구성하는 방법에 대해 설명합니다.

## 1. HTTP 클라이언트 (`ky`) 사용

- 항상 **해당 앱의** `@/apis/api.ts`에 정의된 인스턴스를 통해 네트워크 요청을 수행합니다. 각 앱은 `@yourssu-inhouse/auth`의 `createAuthApiClient(...)` 팩토리로 `api`/`nativeApi` 싱글톤을 생성합니다. (토큰 주입·갱신·재시도·errorCode 처리는 auth 팩토리가 책임집니다. 자세한 흐름은 `rule-auth.md` 참고)
- **`api`** (인증 토큰이 자동으로 주입되는 클라이언트)
- **`nativeApi`** (토큰과 재시도 정책이 불필요한 공용 API)
- 공용 ky 헬퍼(예: `isKyHTTPError`)는 `@yourssu-inhouse/inhouse-utils/ky`에서 import합니다.
- Fetcher 함수 선언 예시 (`@/apis/<domain>/index.ts` 역할):

  ```typescript
  import { api } from '@/apis/api';
  import { UserSchema } from '@/apis/user/schema';

  export const getUserById = async (userId: number) => {
    // 반드시 .json() 후 검증 과정 선언.
    const response = await api.get(`users/${userId}`).json();
    return UserSchema.parse(response);
  };
  ```

## 2. 응답 데이터의 런타임 검사 (Zod)

이 프로젝트는 서버에서 넘어오는 데이터에 대한 방어적 런타임 타입 캐스팅을 강제합니다.

- **`@/apis/(domain)/schema.ts`** 내부에서 Zod(`z`)로 API 관련 스키마를 정의합니다.
- `api` 래퍼 내에서 API 반환 값을 반드시 `Schema.parse()`로 검증합니다.
- 이를 통해 실제 구조가 맞지 않을 경우, UI 화면 이전에 에러 핸들링이 이루어지게 합니다.
- **`@/types/`** 는 API 스키마가 **아닌** 해당 앱 전용 유틸리티 타입, 한국어/영문 매핑 상수, 색상 매핑 등 UI/display 레이어 전용 항목만 배치합니다. (범용 유틸리티 타입은 `@yourssu-inhouse/inhouse-utils/type`)

## 3. React Query 작성 원칙 (`@tanstack/react-query`)

모든 API 호출은 React Query와 연결됩니다.

- 무조건 Options 패턴 (`queryOptions`, `infiniteQueryOptions`) 사용을 권장합니다.
  ```typescript
  export const userOption = (userId: number) =>
    queryOptions({
      queryKey: ['users', userId],
      queryFn: () => getUserById(userId),
      staleTime: 1000 * 60 * 5,
    });
  ```
- 에러 처리 시 `handleError` 및 토스트를 띄우는 `useToastedMutation` 래퍼 훅이 있다면 그걸 우선적으로 고려하세요.

## 4. Query Parameter 전달

- 필터링, 정렬 등 여러 파라미터가 있을 때는 url 문자열 변조보다 옵션 객체 `{ searchParams: params }` 방식을 사용하여 `ky` 내부에서 안전하게 직렬화시킵니다.
- 필요할 경우 `es-toolkit`의 `omitBy`, `isNil` 등 헬퍼 함수로 빈 쿼리 파라미터를 정리하세요.

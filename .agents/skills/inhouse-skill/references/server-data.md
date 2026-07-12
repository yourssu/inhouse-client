# 서버 데이터와 API

## 적용 범위

ky 클라이언트, API fetcher, Zod 스키마, TanStack Query options, mutation, search params를 작성하거나 변경할 때 적용한다. 인증 동작은 `auth.md`를 함께 읽는다.

## 필수 규칙

- 앱의 API 요청은 해당 앱의 `src/apis/api.ts`에서 제공하는 `api` 또는 `nativeApi`를 사용한다.
- 인증이 필요한 요청에는 `api`, 인증이 필요 없는 공개 요청에는 `nativeApi`를 사용한다. 토큰 헤더와 갱신 로직을 개별 fetcher에 중복 구현하지 않는다.
- 외부 API 응답은 `unknown`으로 취급하고 해당 도메인의 Zod 스키마로 파싱한 값을 반환한다.
- 요청 payload를 위한 Zod 스키마가 정의되어 있으면 fetch 호출 전에 검증한다.
- 컴포넌트 `useEffect`에서 fetch 후 지역 state에 복사하지 않는다.
- shell과 모든 remote의 `QueryClient`를 공유하므로 remote의 query key와 invalidate key는 `pluginQueryKey`로 plugin namespace를 포함한다. `['members', 'list']` 같은 raw key는 다른 remote의 같은 도메인 cache와 충돌할 수 있다.

## Fetcher 성공 예시

응답을 먼저 `json()`으로 읽고 도메인 스키마로 검증한 값만 반환한다.

```tsx
import { api } from '@/apis/api';
import { memberSchema } from '@/apis/members/schema';

export const getMember = async (memberId: number) => {
  const response = await api.get(`members/${memberId}`).json();
  return memberSchema.parse(response);
};
```

## 파일 배치 기본 선택

```text
src/apis/
  api.ts
  <domain>/
    index.ts
    schema.ts
    query.ts
```

- `index.ts`: endpoint 호출과 입출력 경계 검증
- `schema.ts`: Zod 스키마와 `z.infer` 타입
- `query.ts`: `queryOptions`, `infiniteQueryOptions`, mutation에 필요한 query key

도메인이 작으면 파일을 억지로 셋으로 나누지 않아도 된다. 호출·스키마·캐시 정책이 독립적으로 커질 때 분리한다.

## TanStack Query 기본 선택

- 조회 정의는 `queryOptions` 또는 `infiniteQueryOptions`로 재사용 가능한 options를 만든다.
- query key는 plugin, 데이터 소유 도메인, 동작, 결과를 바꾸는 입력을 포함한다.
- 컴포넌트는 options를 소비하고 endpoint 문자열·파싱·캐시 정책을 다시 정의하지 않는다.
- mutation 성공 후 invalidate·cache update 범위는 변경된 데이터와 일치시키고 같은 `qk` namespace를 사용한다.
- query와 mutation이 같은 key prefix를 사용하도록 도메인 `query.ts`가 namespaced key API를 공개한다. 컴포넌트에서 raw key를 다시 작성하거나 plugin 이름을 중복 조합하지 않는다.
- Suspense 사용 여부는 해당 라우트의 loading·error 경계와 주변 패턴을 따른다.

plugin 이름은 해당 remote의 실제 이름을 사용하고 module scope에서 helper를 한 번 만든다.

```tsx
import { queryOptions } from '@tanstack/react-query';
import { pluginQueryKey } from '@yourssu-inhouse/mfa-core';

import { getMembers, type GetMembersParams } from '@/apis/members';

const qk = pluginQueryKey('scouter');

export const memberQueryKeys = {
  all: () => qk.for('members'),
  list: (params: GetMembersParams) => qk.for('members', 'list', params),
};

export const membersOption = (params: GetMembersParams) =>
  queryOptions({
    queryKey: memberQueryKeys.list(params),
    queryFn: () => getMembers(params),
  });
```

invalidate할 때는 `queryClient.invalidateQueries({ queryKey: memberQueryKeys.all() })`처럼 같은 도메인 API를 사용한다. plugin 이름은 `apps/*/src/plugin.ts`와 기존 query 파일에서 확인하고 추측하지 않는다.

## 파라미터와 오류 처리

- ky의 `searchParams` 옵션을 사용하고 URL 문자열을 직접 이어 붙이지 않는다.
- `undefined`·`null` 제거가 필요하면 기존 `es-toolkit` 패턴을 따른다.
- 오류 메시지와 토스트는 호출부마다 중복하지 말고 기존 `handleError`, `useToastedMutation`이 있는 앱에서는 이를 우선 검토한다.
- wrapper가 없는 앱에 같은 이름의 훅을 새로 복제하지 말고 공통화 필요성을 먼저 판단한다.

## 변경되기 쉬운 구현 정보

현재 API base URL, 인증 오류 코드, 재시도 횟수, endpoint 경로는 문서에 고정하지 않는다. 다음 소스를 확인한다.

- `apps/*/src/apis/api.ts`
- `apps/*/src/apis/<domain>/`
- `packages/auth/src/apis/`
- `packages/mfa-core/src/queryKey.ts`

## 검증

- 성공 응답뿐 아니라 스키마 불일치와 네트워크 오류를 확인한다.
- query key에 결과를 바꾸는 입력이 빠지지 않았는지 확인한다.
- remote query와 invalidate key가 `pluginQueryKey` namespace를 사용하는지 확인한다.
- mutation 후 관련 화면의 cache가 갱신되는지 확인한다.
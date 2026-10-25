# scouter

- 개발 시작: 26.01.21

## API 스키마 생성

OpenAPI 명세에서 요청·응답 Zod 스키마와 타입을 생성합니다. 현재는 면접 메모
(`interviews/memos`)의 조회·등록·삭제에 적용했습니다. API 검증과 화면 타입 모두
생성 스키마를 참조하며, 기존 수동 `schema.ts`는 사용하지 않고 보존합니다.

### 실행

저장소 루트에서 실행합니다.

```sh
# 개발 서버의 명세를 schema.json에 저장
pnpm --filter @yourssu-inhouse/scouter fetch-schema

# 저장된 명세로 스키마·타입 생성
pnpm --filter @yourssu-inhouse/scouter codegen:api
```

명세 갱신과 생성을 분리하여, 같은 명세·설정·의존성 버전에서 재생성할 수 있게 했습니다.
개발 서버 실행이나 빌드 시에는 자동으로 생성하지 않습니다.

### 생성 방식

`orval.config.ts`에서 `면접 질문 코멘트` 태그의 API를 선택합니다. Orval이 Zod 4
스키마와 파생 타입을 만들고, `scripts/sort-generated-types.ts`가 스키마 순서를 유지한 채
타입 선언만 마지막으로 옮깁니다. 이후 Prettier로 포맷하여 다음 파일에 기록합니다.

```text
src/apis/interviews/memos/generated/schema.gen.ts
```

생성 파일은 직접 수정하지 않습니다. API·Query 함수는 기존 구현을 유지하며,
폴링·토스트·캐시 무효화 같은 화면 정책도 수동으로 관리합니다.

### 변경 확인

명세를 갱신하고 재생성한 뒤 diff와 타입 오류를 확인합니다.

```sh
git diff -- apps/scouter/schema.json apps/scouter/src/apis/interviews/memos/generated
pnpm --filter @yourssu-inhouse/scouter check:type
pnpm --filter @yourssu-inhouse/scouter check:lint
pnpm --filter @yourssu-inhouse/scouter check:format
```

브라우저에서는 지원자의 **면접 평가 → 확정된 질문 선택 → 메모**에서 조회·등록·삭제를
확인할 수 있습니다.

### 현재 한계

- 명세의 일부 `Location` 응답 헤더에 schema가 없어 전체 명세 검증을 비활성화했습니다.
  생성 시 경고가 표시되고 명세 자체를 보정하지 않습니다.
- 공통 응답 모델은 생성하지만 API별 응답 별칭은 생략합니다. Orval의 Zod 생성기가
  현재 명세의 `*/*` 응답을 `unknown`으로 생성하기 때문입니다.
- 명세의 정수 ID 제약과 offset을 허용하는 날짜·시간 검증을 그대로 사용합니다.
  실제 응답과 명세가 다르면 생성물을 고치는 대신 해당 엔드포인트에 호환 규칙을 둬야 합니다.

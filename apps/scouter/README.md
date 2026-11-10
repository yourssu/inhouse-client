# scouter

- 개발 시작: 26.01.21

## API 스키마 생성

OpenAPI 명세에서 요청·응답 Zod 스키마와 타입을 생성합니다. 현재 대상은 면접 메모와
서류 코멘트입니다.
서류 API는 명세 태그를 기준으로 잠정적으로 아래처럼 나눕니다. 현재 생성·연결한 것은
코멘트뿐이며, 나머지는 기존 수동 구현을 사용합니다.

| 하위 도메인 | OpenAPI 태그     | 상태   |
| ----------- | ---------------- | ------ |
| 코멘트      | 서류 코멘트      | 적용   |
| 평가        | 서류 평가        | 미적용 |
| 평가 문항   | 서류 평가 문항   | 미적용 |
| 마감일      | 서류 평가 마감일 | 미적용 |

개발 도구용 API는 이 분류의 생성 대상에 포함하지 않습니다.

### 실행

저장소 루트에서 실행합니다.

```sh
# 개발 서버의 명세를 schema.json에 저장
pnpm --filter @yourssu-inhouse/scouter fetch-schema

# 저장된 명세로 스키마·타입 생성
pnpm --filter @yourssu-inhouse/scouter codegen:api
```

명세 갱신과 코드 생성을 분리하며 개발 서버나 빌드에서는 자동으로 실행하지 않습니다.

### 생성 방식

`orval.config.ts`에서 태그별 생성 대상을 선택하고 Orval 8.43.0으로 Zod 4 스키마와 타입을
생성합니다.

범용 `operationId` 대신 공통 `operationName` 설정과 `scripts/name-operation.ts`에서 HTTP
메서드, 리소스 경로, 경로 변수로 이름을 생성합니다. 변수와 중복되는 첫 리소스는 생략합니다.
예를 들어 코멘트 삭제는 `deleteDocumentsCommentsByApplicantIdAndCommentId`입니다.

```text
src/apis/interviews/memos/generated/schema.gen.ts
src/apis/documents/comments/generated/schema.gen.ts
```

생성 파일은 직접 수정하지 않습니다. 앱 코드는 각 도메인의 `schema.ts`를 통해 스키마와 타입을
사용합니다. UI 입력만을 위한 nullable 등은 별도 입력 스키마로 선언합니다.

명세 보정은 `scripts/transform-openapi.ts`의 Orval input transformer에서 관리합니다. 각 정책은
예상하는 원본(`before`)과 보정 결과(`after`)를 함께 선언하며, 원본 명세가 달라지면 생성에
실패합니다.

### 현재 보정

| 대상        | 내용                                                      |
| ----------- | --------------------------------------------------------- |
| 전체 명세   | POST 응답 7곳의 누락된 Location 헤더 schema 추가          |
| 서류 코멘트 | 응답 `createdAt` 선택적 허용, `parentCommentId` null 허용 |

서류 코멘트의 부모 ID를 `undefined → null`로 바꾸는 화면용 정규화는 `documents/schema.ts`에
둡니다. 생성된 코멘트 ID는 명세의 정수 제약대로 검증합니다. 서류 코멘트의 실제 응답 계약이
확정되면 두 보정을 재검토합니다.

### 후속 생성 시 확인할 보정

아래 항목은 현재 생성에 적용하지 않습니다. 해당 도메인을 생성 대상으로 추가할 때 실제 서버
응답과 정책을 확인한 뒤 transformer에 추가합니다.

- 지원자
  - `division`·`part`의 수동 enum과 명세 `string` 차이
  - `applicationSemester` 형식, email 검증, 평균 점수 nullable 차이
  - 생성 요청의 잘못된 `yyyy-MM-dd` pattern
  - 날짜·ID의 기존 프론트 수용 범위
- 면접 일정
  - 잘못된 `yyyy-MM-ddTHH:mm:ssZ` pattern과 기존 UTC 검증 차이
  - 장소·파트 enum, 응답 장소 nullable, ID 수용 범위 차이
- 파트·구분·회원
  - 명세의 일반 `string`과 기존 `PartNameSchema`·`DivisionNameSchema`·회원 role/state 목록 차이

한글 표시값, 폼 선택지, API 전송 직전 값 변환은 서버 계약 보정이 아니므로 transformer에 넣지
않습니다.

### 변경 확인

명세를 갱신하고 재생성한 뒤 생성 파일의 추적 여부, diff와 정적 검사를 확인합니다.

```sh
git status --short -- apps/scouter/schema.json apps/scouter/src/apis/interviews/memos/generated apps/scouter/src/apis/documents
git diff -- apps/scouter/schema.json apps/scouter/src/apis/interviews/memos/generated apps/scouter/src/apis/documents
pnpm --filter @yourssu-inhouse/scouter test:codegen
pnpm --filter @yourssu-inhouse/scouter check:type
pnpm --filter @yourssu-inhouse/scouter check:lint
pnpm --filter @yourssu-inhouse/scouter check:format
```

### 생성 범위를 확대할 때

- 실제 생성하는 도메인의 보정만 transformer에 추가합니다.
- 생성물은 `schema.ts`·`index.ts`·`query.ts`를 통해 공개합니다.
- 동일한 구현은 re-export하고 인자 변환이나 검증이 필요할 때만 adapter를 둡니다.
- API·Query 생성 시 인증, 요청·응답 검증, query key, 빈 응답과 cache 정책을 함께 검증합니다.

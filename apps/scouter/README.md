# scouter

- 개발 시작: 26.01.21

## API 스키마 생성

저장된 OpenAPI 명세(`schema.json`)에서 면접 메모와 서류 코멘트의 Zod 스키마·타입을 생성합니다.

### 실행

저장소 루트에서 명세 갱신과 생성을 각각 실행합니다. 개발 서버와 빌드에서는 자동 실행하지 않습니다.

```sh
# 개발 서버의 명세를 schema.json에 저장
pnpm --filter @yourssu-inhouse/scouter fetch-schema

# 저장된 명세로 스키마·타입 생성
pnpm --filter @yourssu-inhouse/scouter codegen:api
```

### 생성 범위와 연결

| 대상        | OpenAPI 경로                                    | 생성 파일                                             | 앱에서 사용하는 파일                  |
| ----------- | ----------------------------------------------- | ----------------------------------------------------- | ------------------------------------- |
| 면접 메모   | `/applicants/{applicantId}/interviews/comments` | `src/apis/interviews/memos/generated/schema.gen.ts`   | `src/apis/interviews/memos/schema.ts` |
| 서류 코멘트 | `/applicants/{applicantId}/documents/comments`  | `src/apis/documents/comments/generated/schema.gen.ts` | `src/apis/documents/schema.ts`        |

`orval.config.ts`에서 경로로 생성 대상을 선택합니다. `scripts/name-operation.ts`는 HTTP 메서드와 경로로 작업별 스키마 이름을 정합니다. 기존 호출부와 호환되도록 면접 메모의 `memos` 경로와 공개 이름을 유지합니다. 생성 파일은 직접 수정하지 않습니다.

서류 평가·평가 문항·마감일 등은 아직 생성 대상이 아닙니다. `schema.ts`에는 기존 수동 스키마도 남아 있습니다.

### 명세 보정

`scripts/transform-openapi.ts`는 POST 201 응답에서 누락된 `Location` 헤더의 `string` 스키마를 추가합니다. 현재 명세의 보정 대상은 7곳입니다. 보정 대상의 헤더 형식이 예상과 다르면 생성을 중단합니다.

서류 코멘트의 `parentCommentId`를 화면에서 `undefined` 대신 `null`로 다루는 정규화는 `src/apis/documents/schema.ts`에 있습니다.

다음 항목은 현재 생성에 적용하지 않습니다. 해당 API를 생성 대상으로 추가할 때 서버 응답과 프런트엔드 정책을 확인합니다.

- 지원자: `division`·`part` enum, 학기·이메일·날짜 형식, 평균 점수의 nullable 여부
- 면접 일정: 날짜·시간 형식과 UTC 검증, 장소·파트 enum, 장소의 nullable 여부
- 파트·구분·회원: 명세의 일반 `string`과 기존 프런트엔드 제한값 차이

해당 항목이 존재하는 도메인에 대한 codegen을 적용할 때 보정 함수를 작성합니다. (현재 생성 대상이 아닌 도메인에 대한 계약 불일치는 보정하지 않습니다.)

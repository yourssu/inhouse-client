# scouter

- 개발 시작: 26.01.21

## API 코드 생성

Orval 8.41.0은 저장된 OpenAPI 명세로 코멘트 조회·등록의 Zod 4 스키마, 타입, 요청 함수, TanStack Query 옵션과 훅을 생성합니다.
화면에서는 생성된 옵션을 사용하고, 지원자별 캐시 키와 등록 후 목록 갱신·알림은 스카우터에서 관리합니다.

### 코드 읽는 순서

| 부분                                         | 역할                                                         |
| -------------------------------------------- | ------------------------------------------------------------ |
| `orval.config.ts`                            | 코멘트 조회·등록을 생성 대상으로 지정                        |
| `src/apis/documents/generated/`              | 명세에서 생성한 스키마·요청 함수·Query 및 Mutation 옵션과 훅 |
| `src/apis/documents/schema.ts`               | 생성 스키마에 기존 날짜·부모 ID 등의 허용 범위를 적용        |
| `src/apis/generatedRequest.ts`               | 생성된 요청을 인증 클라이언트에 전달하고 조회 결과를 검사    |
| `src/apis/documents/commentsQueryOptions.ts` | 생성된 조회와 등록 후 갱신에 같은 지원자별 캐시 키를 사용    |

인증과 요청 전송은 기존 `api`가 담당합니다. 사용자 정의 요청 함수(`generatedRequest`)를 쓰면 Orval이 응답을 직접 검사하지 않으므로, 이 함수가 생성 코드에서 받은 스키마로 조회 결과를 검사합니다. 등록 성공 응답(`201`)은 본문이 없어 JSON으로 읽지 않습니다.

### 실행

Node.js 22.18 이상과 pnpm 11.5.2를 사용합니다. 저장소 루트에서 실행합니다.

```sh
pnpm install --frozen-lockfile
pnpm --filter @yourssu-inhouse/scouter api:generate
```

명세를 갱신하려면 `pnpm --filter @yourssu-inhouse/scouter fetch-schema` 실행 후 다시 생성합니다.
개발 서버·빌드는 명세를 갱신하거나 코드를 생성하지 않습니다. 명세·설정·lockfile·생성물을 함께 커밋합니다.

### 남겨 둔 호환 처리

- 날짜: 기존처럼 `createdAt` 생략을 허용하고 UTC 형식으로 검사합니다.
- 부모 ID: 응답의 null·생략을 허용하고 결과를 null로 통일합니다.
- 숫자: 명세의 정수 제약 대신 기존 `z.number()` 허용 범위를 유지합니다.
- 명세 보완: POST 201의 `Location` 헤더에 자료형이 없을 때만 문자열로 보완합니다.

이 규칙은 기존 프론트 동작을 보존하기 위한 것으로, 서버가 모든 해당 값을 보낸다는 뜻은 아닙니다.
덮어쓴 필드는 명세 변경이 그대로 반영되지 않으므로 명세 갱신 때 함께 검토합니다.

### 검증

```sh
pnpm --filter @yourssu-inhouse/scouter exec tsc -b --pretty false
pnpm --filter @yourssu-inhouse/scouter check:lint
pnpm --filter @yourssu-inhouse/scouter check:format
pnpm --filter @yourssu-inhouse/scouter test:api
```

API 테스트는 기존 tsx와 Node 내장 테스트로 실행하며 모듈 mock에 experimental 플래그를 사용합니다.
모의 응답으로 조회·수정의 응답 호환성, 잘못된 조회 결과 거부, 빈 댓글 차단, 답글 전송과 본문 없는 등록 성공을 확인합니다. 조회와 등록 후 갱신이 같은 지원자별 캐시 키를 사용하는지도 확인합니다.

반복 생성은 변경 없는 생성 파일에서 `api:generate`를 다시 실행한 뒤
`git diff --exit-code -- apps/scouter/src/apis/documents/generated`로 확인합니다.
Git에 추가하지 않은 새 파일은 diff에 나오지 않으므로 최초 생성 시에는 두 결과의 파일 목록과 내용을 비교합니다.

# scouter

- 개발 시작: 26.01.21

## API 코드 생성

Orval 8.41.0으로 저장된 명세에서 Zod 4 스키마·타입·호출 함수를 생성합니다.
첫 적용은 코멘트 조회·등록이며, Query·캐시·알림과 수정·삭제 호출은 기존 코드를 유지합니다.

### 코드 읽는 순서

| 부분                            | 역할                                              |
| ------------------------------- | ------------------------------------------------- |
| `orval.config.ts`               | 생성할 API와 출력 형식 설정                       |
| `src/apis/documents/generated/` | 생성된 호출 함수와 검사 규칙 — 직접 수정하지 않음 |
| `src/apis/generatedRequest.ts`  | 기존 인증 클라이언트 연결                         |
| `src/apis/documents/schema.ts`  | 생성 규칙에 기존 허용 범위 적용                   |
| `src/apis/documents/index.ts`   | 요청 전·응답 후 검사와 생성 함수 호출             |

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
모의 응답으로 입출력 검사·빈 201·공유 스키마·대표 오류 전달을 확인합니다. 실제 로그인·화면·캐시 갱신은 별도 검증입니다.

반복 생성은 변경 없는 생성 파일에서 `api:generate`를 다시 실행한 뒤
`git diff --exit-code -- apps/scouter/src/apis/documents/generated`로 확인합니다.
Git에 추가하지 않은 새 파일은 diff에 나오지 않으므로 최초 생성 시에는 두 결과의 파일 목록과 내용을 비교합니다.

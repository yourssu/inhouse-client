# scouter

- 개발 시작: 26.01.21

## 코멘트 API 자동 생성

저장된 OpenAPI 명세에서 코멘트 조회·등록의 Zod 스키마·타입·호출 함수를 생성합니다.
Orval 8.41.0은 Zod 4 생성과 기존 인증 클라이언트 연결이 가능해 선택했습니다.
첫 두 API에서는 설정·생성물 때문에 전체 코드가 늘지만, API 계약을 반복 생성할 수 있습니다.

기존 함수명·인자·반환값, 인증, 화면 훅과 알림을 유지합니다. Query 생성은 기존 캐시 정책과
작은 변경 범위를 유지하기 위해 제외하며, 수정·삭제 호출과 다른 도메인도 전환하지 않습니다.

### 실행

Node.js 22.18 이상과 저장소의 pnpm 11.5.2를 사용합니다. 아래 명령은 저장소 루트 기준입니다.

```sh
pnpm install --frozen-lockfile
pnpm --filter @yourssu-inhouse/scouter api:generate
```

`api:generate`는 `schema.json`과 `orval.config.ts`만 입력으로 사용합니다.
명세를 갱신할 때만 다음 명령을 실행하고 명세·생성물·호환 규칙을 함께 검토합니다.

```sh
pnpm --filter @yourssu-inhouse/scouter fetch-schema
pnpm --filter @yourssu-inhouse/scouter api:generate
```

도구 버전·설정·lockfile·생성물을 함께 커밋합니다. 생성 파일은 직접 수정하지 않으며,
일반 개발 서버와 빌드에서는 명세 갱신이나 코드 생성을 실행하지 않습니다.

생성 파일이 커밋되어 있고 해당 디렉터리에 변경이 없는 상태에서 재생성 후 비교합니다.

```sh
pnpm --filter @yourssu-inhouse/scouter api:generate
git diff --exit-code -- apps/scouter/src/apis/documents/generated
```

`git diff`는 Git에 추가하지 않은 파일을 검사하지 않습니다. 최초 생성 때는 두 번 생성한
결과의 상대 파일명 목록과 각 파일의 내용 또는 해시를 비교합니다.

### 연결과 호환 규칙

`orval.config.ts`는 GET·POST와 필요한 스키마만 `src/apis/documents/generated`에 생성합니다.
기존 `documents/index.ts`가 입출력을 검증하고, `documents/schema.ts`가 아래 호환 규칙을 담당합니다.

Orval 8.41.0은 기존 `api`의 구조 분해 export를 인식하지 못해 `generatedRequest.ts`에서
재export합니다. `inferred: true`로 ky의 반환형을 유지하며, 조회의 `.json<unknown>()`과
Zod 검증 및 자동 `Accept` 헤더를 사용합니다. 등록은 빈 응답을 JSON으로 읽지 않고 `void`를 반환합니다.

| 항목                   | 저장된 명세 / 생성 결과    | 유지하는 기존 동작                      |
| ---------------------- | -------------------------- | --------------------------------------- |
| `createdAt`            | 필수, 시간대 오프셋 허용   | 생략 허용, 기존 UTC 날짜 검증           |
| `parentCommentId` 응답 | 생략 가능한 정수           | null·생략 허용, 결과를 null로 통일      |
| ID 필드                | 정수·안전한 정수 범위 검사 | 기존 `z.number()`의 유한 숫자 허용 범위 |

기존 프론트엔드의 허용 범위를 보존하는 규칙이며, 서버가 해당 값을 보낸다는 증거는 아닙니다.
조회와 수동 수정은 같은 `CommentSchema`를 사용합니다. 덮어쓴 필드는 명세 변경이 자동 반영되지
않으므로 갱신 때 검토하고, 규칙을 바꿀 때 실제 응답을 확인하여 회귀 테스트도 함께 변경합니다.

명세의 POST 201 `Location` 헤더는 자료형이 없어 검증에 실패하므로 입력 transformer에서
누락된 자료형만 문자열로 보완합니다. 명세 검증은 유지하며, 명세에 자료형이 추가되면 그 값을 사용합니다.

### 검증

기존 `tsx`와 Node 내장 테스트를 사용하며, 모듈 mock에 experimental Node 플래그가 필요합니다.
요청은 프로세스 안에서 모의 처리합니다.

```sh
pnpm --filter @yourssu-inhouse/scouter exec tsc -b --pretty false
pnpm --filter @yourssu-inhouse/scouter check:lint
pnpm --filter @yourssu-inhouse/scouter check:format
pnpm --filter @yourssu-inhouse/scouter test:api
```

정상·빈 목록, 호환 규칙, 잘못된 입출력, 빈 201, 오류 전파, 공유 스키마의 수정 기능을 검증합니다.
캐시는 테스트가 직접 무효화하므로 화면의 등록 성공 훅까지 확인하는 테스트는 아닙니다.
PR에는 반복 생성 결과, 모의 서버를 사용한 화면 확인, 실제 서버·인증 확인 여부를 구분해 기록합니다.

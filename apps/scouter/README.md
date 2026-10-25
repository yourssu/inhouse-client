# scouter

- 개발 시작: 26.01.21

## OpenAPI 기반 스키마 생성

저장된 OpenAPI 명세를 입력으로 Orval이 Zod 스키마와 타입을 생성합니다.

### 생성과 검증

저장소 루트에서 실행합니다.

```sh
# 필요할 때 개발 서버의 최신 명세를 저장합니다.
pnpm --filter @yourssu-inhouse/scouter fetch-schema

# 저장된 schema.json으로 스키마와 타입을 생성합니다.
pnpm --filter @yourssu-inhouse/scouter codegen:api

# 명세와 생성물 변경을 확인하고 검사합니다.
git diff -- apps/scouter/schema.json apps/scouter/src/apis/interviews/memos/generated
pnpm --filter @yourssu-inhouse/scouter check:type
pnpm --filter @yourssu-inhouse/scouter check:lint
pnpm --filter @yourssu-inhouse/scouter check:format
```

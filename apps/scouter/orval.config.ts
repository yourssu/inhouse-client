// API 함수·Query는 생성하지 않고 요청·응답 스키마와 타입만 생성합니다.
import { defineConfig, type Options } from 'orval';

import { nameOperation } from './scripts/name-operation';
import { transformOpenApi } from './scripts/transform-openapi';

const createSchemaConfig = (
  domain: Parameters<typeof transformOpenApi>[0],
  tag: string,
  target: string,
): Options => ({
  input: {
    target: './schema.json',
    filters: { tags: [tag] },
    override: { transformer: transformOpenApi(domain) },
  },
  output: {
    target,
    client: 'zod',
    formatter: 'prettier',
    override: {
      header: () => ['OpenAPI 명세에서 자동 생성된 파일입니다. 직접 수정하지 마세요.'],
      operationName: (_operation, route, verb) => nameOperation(route, verb),
      zod: {
        version: 4,
        generateReusableSchemas: true,
        generateCompanionTypes: true,
        // 공통 모델과 경로 파라미터를 사용하고 중복 본문·응답 별칭은 생략합니다.
        generate: { body: false, response: false },
      },
    },
  },
});

export default defineConfig({
  interviewMemos: createSchemaConfig(
    'interviewMemos',
    '면접 질문 코멘트',
    './src/apis/interviews/memos/generated/schema.gen.ts',
  ),
  documentComments: createSchemaConfig(
    'documentComments',
    '서류 코멘트',
    './src/apis/documents/comments/generated/schema.gen.ts',
  ),
});

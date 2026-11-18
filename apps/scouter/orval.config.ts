// API 함수·Query는 생성하지 않고 요청·응답 스키마와 타입만 생성합니다.
import { defineConfig, type Options } from 'orval';

import { nameOperation } from './scripts/name-operation';
import { transformOpenApi } from './scripts/transform-openapi';

const createSchemaConfig = (pathPrefix: string, target: string): Options => ({
  input: {
    target: './schema.json',
    filters: { tags: ['코멘트'] },
    override: {
      transformer: async (source) => {
        const document = await transformOpenApi(source);
        // 서버가 두 코멘트 API를 같은 태그로 묶으므로 생성 범위는 경로로 나눕니다.
        document.paths = Object.fromEntries(
          Object.entries(document.paths ?? {}).filter(([path]) => path.startsWith(pathPrefix)),
        );
        return document;
      },
    },
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
    '/applicants/{applicantId}/interviews/comments',
    './src/apis/interviews/memos/generated/schema.gen.ts',
  ),
  documentComments: createSchemaConfig(
    '/applicants/{applicantId}/documents/comments',
    './src/apis/documents/comments/generated/schema.gen.ts',
  ),
});

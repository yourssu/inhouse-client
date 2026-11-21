// API 함수·Query는 생성하지 않고 요청·응답 스키마와 타입만 생성합니다.
import { defineConfig, type Options } from 'orval';

import { buildOperationNameFromRoute } from './scripts/name-operation';
import { transformOpenApi } from './scripts/transform-openapi';

const createSchemaConfig = (pathPrefix: string, target: string): Options => ({
  input: {
    target: './schema.json',
    // 모든 태그를 허용해 Orval이 선택된 경로의 참조 모델만 생성하게 합니다.
    filters: { tags: [/.*/] },
    override: {
      transformer: async (source) => {
        const document = await transformOpenApi(source);
        // 생성 범위는 태그 변경의 영향을 받지 않도록 경로로 선택합니다.
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
      operationName: (_operation, route, verb) => buildOperationNameFromRoute(route, verb),
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

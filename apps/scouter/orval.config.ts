// 면접 메모의 요청·응답 스키마만 생성합니다.
import { defineConfig } from 'orval';

export default defineConfig({
  interviewMemos: {
    // 명세의 일부 Location 헤더에 schema가 없어 전체 명세 검증은 별도로 다룹니다.
    input: {
      target: './schema.json',
      filters: { tags: ['면접 질문 코멘트'] },
      unsafeDisableValidation: true,
    },
    output: {
      target: './src/apis/interviews/memos/generated/schema.gen.ts',
      client: 'zod',
      formatter: 'prettier',
      override: {
        header: () => ['OpenAPI 명세에서 자동 생성된 파일입니다. 직접 수정하지 마세요.'],
        zod: {
          version: 4,
          generateReusableSchemas: true,
          generateCompanionTypes: true,
          // 공통 모델과 경로 파라미터를 사용하고 중복 본문·응답 별칭은 생략합니다.
          generate: { body: false, response: false },
        },
      },
    },
  },
});

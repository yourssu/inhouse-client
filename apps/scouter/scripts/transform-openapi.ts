import { isDeepStrictEqual } from 'node:util';
import { defineTransformer, type OpenApiSchemaObject } from 'orval';

// 전체 검증에 필요한 Location 보완입니다. 서버 수정 후 해당 항목을 제거합니다.
const locationHeaders = [
  ['/members/include-from-applicants', '/members'],
  ['/applicants', '/applicants/{applicantId}'],
  [
    '/applicants/{applicantId}/interviews/memos',
    '/applicants/{applicantId}/interviews/memos/{commentId}',
  ],
  [
    '/applicants/{applicantId}/documents/comments',
    '/applicants/{applicantId}/documents/comments/{commentId}',
  ],
  ['/applicants/webhook', '/applicants'],
  ['/applicants/include-from-forms', '/applicants'],
  ['/applicants/include-from-forms/semesters/{semesterId}', '/applicants'],
].map(([path, description]) => ({
  path,
  before: { description, style: 'simple' },
  after: { description, style: 'simple' as const, schema: { type: 'string' as const } },
}));

// 서버 응답의 nullable 여부는 실제 응답으로 확인해야 합니다. 현재 클라이언트의 수용 범위를 보존합니다.
const nullableParentCommentId = {
  type: ['integer', 'null'],
  format: 'int64',
} satisfies OpenApiSchemaObject;
const documentComment = {
  required: {
    before: ['author', 'commentId', 'content', 'createdAt', 'isEdited', 'sectionId'],
    after: ['author', 'commentId', 'content', 'isEdited', 'sectionId'],
  },
  parentCommentId: {
    before: { type: 'integer', format: 'int64' },
    after: nullableParentCommentId,
  },
} as const;

export const transformOpenApi = (domain: 'documentComments' | 'interviewMemos') =>
  defineTransformer((source) => {
    const document = structuredClone(source);
    for (const { path, before, after } of locationHeaders) {
      const response = document.paths?.[path]?.post?.responses?.['201'];
      if (
        !response ||
        '$ref' in response ||
        !response.headers ||
        !isDeepStrictEqual(response.headers.Location, before)
      ) {
        throw new Error(`Location 보정을 재검토하세요: POST ${path}`);
      }
      response.headers.Location = structuredClone(after);
    }
    if (domain === 'documentComments') {
      const model = document.components?.schemas?.ReadDocumentCommentResponse;
      if (!model || typeof model === 'boolean' || '$ref' in model || !model.properties) {
        throw new Error('서류 코멘트 모델 보정을 재검토하세요');
      }
      if (!isDeepStrictEqual(model.required, documentComment.required.before)) {
        throw new Error('서류 코멘트 createdAt 보정을 재검토하세요');
      }
      model.required = [...documentComment.required.after];
      if (
        !isDeepStrictEqual(model.properties.parentCommentId, documentComment.parentCommentId.before)
      ) {
        throw new Error('서류 코멘트 parentCommentId 보정을 재검토하세요');
      }
      model.properties.parentCommentId = structuredClone(documentComment.parentCommentId.after);
    }
    return document;
  });

import { isDeepStrictEqual } from 'node:util';
import { defineTransformer, type OpenApiSchemaObject } from 'orval';

// 서버 응답의 nullable 여부는 실제 응답으로 확인해야 합니다. 현재 클라이언트의 수용 범위를 보존합니다.
const nullableParentCommentId = {
  type: ['integer', 'null'],
  format: 'int64',
} satisfies OpenApiSchemaObject;
const documentComment = {
  // createdAt이 실제로 항상 오거나 서버 명세에서 required가 제거되면 이 보정을 삭제합니다.
  required: {
    before: ['author', 'commentId', 'content', 'createdAt', 'isEdited', 'sectionId'],
    after: ['author', 'commentId', 'content', 'isEdited', 'sectionId'],
  },
  // 최상위 코멘트의 null 응답을 서버 명세가 허용하면 이 보정을 삭제합니다.
  parentCommentId: {
    before: { type: 'integer', format: 'int64' },
    after: nullableParentCommentId,
  },
} as const;

export const transformOpenApi = (domain: 'documentComments' | 'interviewMemos') =>
  defineTransformer((source) => {
    const document = structuredClone(source);
    // 서버 명세의 POST 201 Location 헤더에 schema: { type: 'string' }이 모두 추가되면 이 순회를 삭제합니다.
    for (const [path, operation] of Object.entries(document.paths ?? {})) {
      const response = operation.post?.responses?.['201'];
      if (!response || '$ref' in response) {
        continue;
      }
      const headers = response.headers;
      const location = headers?.Location;
      if (!location || '$ref' in location || 'schema' in location) {
        continue;
      }
      if (
        typeof location.description !== 'string' ||
        !isDeepStrictEqual(location, { description: location.description, style: 'simple' })
      ) {
        throw new Error(`Location 보정을 재검토하세요: POST ${path}`);
      }
      headers.Location = { ...location, schema: { type: 'string' } };
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

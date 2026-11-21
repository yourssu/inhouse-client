import { isDeepStrictEqual } from 'node:util';
import { defineTransformer } from 'orval';

export const transformOpenApi = defineTransformer((source) => {
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
  return document;
});

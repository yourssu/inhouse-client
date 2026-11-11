import type { OpenApiDocument } from 'orval';

import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { test } from 'node:test';

import { transformOpenApi } from '../transform-openapi';

const repairOpenApi = transformOpenApi('interviewMemos');
const transformDocumentComments = transformOpenApi('documentComments');

// 저장소 명세를 fixture로 사용하며 Orval의 전체 명세 검증은 재생성에서 별도로 실행합니다.
const source: OpenApiDocument = JSON.parse(
  readFileSync(new URL('../../schema.json', import.meta.url), 'utf8'),
);

const changedPaths = (before: unknown, after: unknown, path = ''): string[] => {
  if (
    typeof before === 'object' &&
    before !== null &&
    typeof after === 'object' &&
    after !== null
  ) {
    return [...new Set([...Object.keys(before), ...Object.keys(after)])].flatMap((key) =>
      changedPaths(Reflect.get(before, key), Reflect.get(after, key), `${path}.${key}`),
    );
  }
  return Object.is(before, after) ? [] : [path];
};

test('Location 보정은 원본을 보존하고 알려진 7개 schema만 추가한다', async () => {
  const original = structuredClone(source);
  const result = await repairOpenApi(source);
  const changes = changedPaths(source, result);
  assert.equal(changes.length, 7);
  assert(changes.every((path) => path.endsWith('.post.responses.201.headers.Location.schema')));
  assert.deepEqual(source, original);
});

test('서류 코멘트 정책은 두 계약만 보정하고 원본을 보존한다', async () => {
  const original = structuredClone(source);
  const headersOnly = await repairOpenApi(source);
  const result = await transformDocumentComments(source);
  assert.deepEqual(
    changedPaths(headersOnly, result).sort(),
    [
      '.components.schemas.ReadDocumentCommentResponse.required.3',
      '.components.schemas.ReadDocumentCommentResponse.required.4',
      '.components.schemas.ReadDocumentCommentResponse.required.5',
      '.components.schemas.ReadDocumentCommentResponse.properties.parentCommentId.type',
    ].sort(),
  );
  assert.deepEqual(source, original);
});

test('서버가 추가한 Location schema는 덮어쓰지 않는다', async () => {
  const changed = structuredClone(source);
  const response = changed.paths?.['/applicants']?.post?.responses?.['201'];
  assert(response && !('$ref' in response) && response.headers);
  const location = response.headers.Location;
  assert(location && !('$ref' in location));
  response.headers.Location = { ...location, schema: { type: 'string' } };
  const result = await repairOpenApi(changed);
  assert.deepEqual(result.paths?.['/applicants']?.post?.responses?.['201'], response);
});

test('서류 코멘트 원본이 바뀌면 정책 재검토를 요구한다', async () => {
  const changed = structuredClone(source);
  const model = changed.components?.schemas?.ReadDocumentCommentResponse;
  assert(model && typeof model !== 'boolean' && !('$ref' in model));
  model.required = model.required?.filter((field) => field !== 'createdAt');
  await assert.rejects(async () => transformDocumentComments(changed), /createdAt 보정/);
});

test('서류 부모 ID 정의가 바뀌면 덮어쓰지 않는다', async () => {
  const changed = structuredClone(source);
  const model = changed.components?.schemas?.ReadDocumentCommentResponse;
  assert(model && typeof model !== 'boolean' && !('$ref' in model) && model.properties);
  model.properties.parentCommentId = { type: ['integer', 'null'], format: 'int64' };
  await assert.rejects(async () => transformDocumentComments(changed), /parentCommentId 보정/);
});

import type { OpenApiDocument } from 'orval';

import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { test } from 'node:test';

import { transformOpenApi } from '../transform-openapi';

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
  const result = await transformOpenApi(source);
  const changes = changedPaths(source, result);
  assert.equal(changes.length, 7);
  assert(changes.every((path) => path.endsWith('.post.responses.201.headers.Location.schema')));
  assert.deepEqual(source, original);
});

test('서버가 추가한 Location schema는 덮어쓰지 않는다', async () => {
  const changed = structuredClone(source);
  const response = changed.paths?.['/applicants']?.post?.responses?.['201'];
  assert(response && !('$ref' in response) && response.headers);
  const location = response.headers.Location;
  assert(location && !('$ref' in location));
  response.headers.Location = { ...location, schema: { type: 'string' } };
  const result = await transformOpenApi(changed);
  assert.deepEqual(result.paths?.['/applicants']?.post?.responses?.['201'], response);
});

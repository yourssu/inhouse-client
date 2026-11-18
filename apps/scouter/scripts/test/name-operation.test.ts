import type { OpenApiDocument } from 'orval';

import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { test } from 'node:test';

import { nameOperation } from '../name-operation';

test('작업 이름은 메서드·리소스·경로 변수로 만들고 현재 명세에서 충돌하지 않는다', () => {
  assert.equal(
    nameOperation('/applicants/${applicantId}/documents/comments/${commentId}', 'delete'),
    'deleteDocumentsCommentsByApplicantIdAndCommentId',
  );
  assert.equal(
    nameOperation('/applicants/${applicantId}/interviews/memos', 'get'),
    'getInterviewsMemosByApplicantId',
  );

  const source: OpenApiDocument = JSON.parse(
    readFileSync(new URL('../../schema.json', import.meta.url), 'utf8'),
  );
  const names = new Set<string>();
  for (const [path, methods] of Object.entries(source.paths ?? {})) {
    for (const [verb, operation] of Object.entries(methods)) {
      if (!operation || typeof operation !== 'object' || !('operationId' in operation)) {
        continue;
      }
      const route = path.replace(/\{([^}]+)\}/g, (_, parameter: string) => '${' + parameter + '}');
      const name = nameOperation(route, verb);
      assert(!names.has(name), `${name}: ${verb.toUpperCase()} ${path}`);
      names.add(name);
    }
  }
});

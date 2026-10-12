import { QueryClient } from '@tanstack/react-query';
import ky, { HTTPError } from 'ky';
import assert from 'node:assert/strict';
import { beforeEach, mock, test } from 'node:test';
import { ZodError } from 'zod/v4';

let requests: Request[] = [];
let respond: (request: Request) => Promise<Response> | Response;

const api = ky.create({
  prefix: 'https://scouter.test',
  retry: 0,
  fetch: async (input, init) => {
    const request = new Request(input, init);
    requests.push(request);
    return respond(request);
  },
});

// Replace the auth boundary before importing fetchers; every request stays in this process.
mock.module(new URL('../src/apis/api.ts', import.meta.url), {
  namedExports: { api },
});

const {
  getApplicantDocumentComments,
  patchApplicantDocumentComment,
  postApplicantDocumentComment,
} = await import('../src/apis/documents/index');
const { applicantDocumentCommentsOption, commentsQueryKey } =
  await import('../src/apis/documents/query');

const legacyComment = {
  author: { nickname: 'Rookie', part: 'Frontend', userId: 3 },
  commentId: 7,
  content: '확인했어요.',
  isEdited: false,
  sectionId: 2,
};
const comment = {
  ...legacyComment,
  createdAt: '2026-10-12T01:02:03.456Z',
  parentCommentId: null,
};

beforeEach(() => {
  requests = [];
  respond = () => {
    throw new Error('Unexpected request: configure a response in this test.');
  };
});

test('GET returns validated comments for the requested applicant', async () => {
  respond = () => Response.json([comment]);

  assert.deepEqual(await getApplicantDocumentComments(11), [comment]);
  assert.equal(requests.length, 1);
  assert.equal(requests[0].method, 'GET');
  assert.equal(requests[0].url, 'https://scouter.test/applicants/11/documents/comments');
  assert.equal(requests[0].headers.get('accept'), 'application/json');
});

test('GET accepts an empty comment list', async () => {
  respond = () => Response.json([]);
  assert.deepEqual(await getApplicantDocumentComments(11), []);
});

test('GET preserves missing createdAt and normalizes missing parentCommentId to null', async () => {
  respond = () => Response.json([legacyComment]);

  const result = await getApplicantDocumentComments(11);
  assert.deepEqual(result, [{ ...legacyComment, parentCommentId: null }]);
});

test('GET keeps existing number acceptance and explicit null parentCommentId', async () => {
  const fractionalIds = {
    ...comment,
    author: { ...comment.author, userId: 3.5 },
    commentId: 7.5,
    sectionId: 2.5,
  };
  respond = () => Response.json([fractionalIds]);
  assert.deepEqual(await getApplicantDocumentComments(11), [fractionalIds]);
});

for (const [name, invalidComment] of [
  ['invalid content', { ...comment, content: 12 }],
  ['invalid date', { ...comment, createdAt: 'yesterday' }],
  [
    'offset date previously rejected by z.iso.datetime()',
    {
      ...comment,
      createdAt: '2026-10-12T10:02:03+09:00',
    },
  ],
] as const) {
  test(`GET rejects ${name}`, async () => {
    respond = () => Response.json([invalidComment]);
    await assert.rejects(getApplicantDocumentComments(11), ZodError);
  });
}

test('POST accepts an empty 201 response without reading JSON and still returns void', async (t) => {
  respond = () =>
    new Response(null, {
      status: 201,
      headers: { Location: '/applicants/11/documents/comments/7' },
    });
  const json = t.mock.method(Response.prototype, 'json');
  const data = { content: '새 코멘트', sectionId: 2, parentCommentId: 7 };

  assert.equal(await postApplicantDocumentComment({ applicantId: 11, data }), undefined);
  assert.equal(json.mock.callCount(), 0);
  assert.equal(requests.length, 1);
  assert.equal(requests[0].method, 'POST');
  assert.equal(requests[0].url, 'https://scouter.test/applicants/11/documents/comments');
  assert.equal(requests[0].headers.get('accept'), null);
  assert.equal(requests[0].headers.get('content-type'), 'application/json');
  assert.deepEqual(JSON.parse(await requests[0].text()), data);
});

test('POST rejects an empty content before making a request', async () => {
  await assert.rejects(
    postApplicantDocumentComment({ applicantId: 11, data: { content: '', sectionId: 2 } }),
    ZodError,
  );
  assert.equal(requests.length, 0);
});

test('POST preserves existing whitespace and fractional-number acceptance', async () => {
  respond = () => new Response(null, { status: 201 });
  const data = { content: ' ', sectionId: 2.5, parentCommentId: 7.5 };
  await postApplicantDocumentComment({ applicantId: 11, data });
  assert.deepEqual(JSON.parse(await requests[0].text()), data);
});

test('PATCH retains the same optional-date and parent normalization as GET', async () => {
  respond = () => Response.json({ ...legacyComment, content: '수정했어요.', isEdited: true });

  const result = await patchApplicantDocumentComment({
    applicantId: 11,
    commentId: 7,
    data: { content: '수정했어요.' },
  });

  assert.deepEqual(result, {
    ...legacyComment,
    content: '수정했어요.',
    isEdited: true,
    parentCommentId: null,
  });
  assert.equal(requests[0].method, 'PATCH');
  assert.equal(requests[0].url, 'https://scouter.test/applicants/11/documents/comments/7');
});

test('PATCH still validates its request and response', async () => {
  await assert.rejects(
    patchApplicantDocumentComment({ applicantId: 11, commentId: 7, data: { content: '' } }),
    ZodError,
  );
  assert.equal(requests.length, 0);

  respond = () => Response.json({ ...comment, content: 12 });
  await assert.rejects(
    patchApplicantDocumentComment({ applicantId: 11, commentId: 7, data: { content: '수정' } }),
    ZodError,
  );
});

const requestCases = [
  ['GET', () => getApplicantDocumentComments(11)],
  [
    'POST',
    () =>
      postApplicantDocumentComment({
        applicantId: 11,
        data: { content: '새 코멘트', sectionId: 2 },
      }),
  ],
  [
    'PATCH',
    () =>
      patchApplicantDocumentComment({
        applicantId: 11,
        commentId: 7,
        data: { content: '수정' },
      }),
  ],
] as const;

for (const [method, request] of requestCases) {
  test(`${method} propagates HTTP failures`, async () => {
    respond = () => Response.json({ message: 'unavailable' }, { status: 503 });
    await assert.rejects(request(), (error: unknown) => {
      assert.ok(error instanceof HTTPError);
      assert.equal(error.response.status, 503);
      return true;
    });
    assert.equal(requests.length, 1);
  });

  test(`${method} propagates network failures`, async () => {
    const failure = new TypeError('Network unavailable');
    respond = () => {
      throw failure;
    };
    await assert.rejects(request(), (error: unknown) => error === failure);
    assert.equal(requests.length, 1);
  });
}

test('query options separate applicants and invalidate only the matching scouter cache', async () => {
  const client = new QueryClient({
    defaultOptions: { queries: { retry: false, staleTime: Infinity, gcTime: Infinity } },
  });
  let currentContent = comment.content;
  respond = (request) =>
    request.method === 'POST'
      ? new Response(null, { status: 201 })
      : Response.json([{ ...comment, content: currentContent }]);

  try {
    const first = applicantDocumentCommentsOption(11);
    const second = applicantDocumentCommentsOption(12);
    const otherPluginKey = ['other-plugin', 'applicants', 11, 'documents', 'comments'];
    assert.deepEqual(first.queryKey, ['scouter', 'applicants', 11, 'documents', 'comments']);
    assert.notDeepEqual(first.queryKey, second.queryKey);

    await client.fetchQuery(first);
    await client.fetchQuery(second);
    client.setQueryData(otherPluginKey, [comment]);
    currentContent = '등록 후 새 목록';
    await postApplicantDocumentComment({
      applicantId: 11,
      data: { content: currentContent, sectionId: 2 },
    });
    await client.invalidateQueries({ queryKey: commentsQueryKey(11), refetchType: 'none' });

    assert.equal(client.getQueryState(first.queryKey)?.isInvalidated, true);
    assert.equal(client.getQueryState(second.queryKey)?.isInvalidated, false);
    assert.equal(client.getQueryState(otherPluginKey)?.isInvalidated, false);
    assert.equal((await client.fetchQuery(first))[0].content, currentContent);
    assert.equal(client.getQueryData(second.queryKey)?.[0].content, comment.content);
    assert.deepEqual(
      requests.map(({ method, url }) => [method, new URL(url).pathname]),
      [
        ['GET', '/applicants/11/documents/comments'],
        ['GET', '/applicants/12/documents/comments'],
        ['POST', '/applicants/11/documents/comments'],
        ['GET', '/applicants/11/documents/comments'],
      ],
    );
  } finally {
    client.clear();
  }
});

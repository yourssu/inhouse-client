import { QueryClient } from '@tanstack/react-query';
import ky, { HTTPError } from 'ky';
import assert from 'node:assert/strict';
import { beforeEach, mock, test } from 'node:test';
import { ZodError } from 'zod/v4';

// 테스트 준비: 실제 서버 대신 모의 응답으로 API 연결을 확인합니다.
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
mock.module(new URL('../src/apis/api.ts', import.meta.url), {
  namedExports: { api },
});
const { patchApplicantDocumentComment } = await import('../src/apis/documents/index');
const {
  create3,
  getCreate3MutationOptions,
  getReadAllByApplicantIdSuspenseQueryOptions,
  readAllByApplicantId,
} = await import('../src/apis/documents/generated/comments.gen');
const { applicantDocumentCommentsOption, commentsQueryKey } =
  await import('../src/apis/documents/query');

const comment = {
  author: { nickname: 'Rookie', part: 'Frontend', userId: 3 },
  commentId: 7,
  content: '확인했어요.',
  isEdited: false,
  sectionId: 2,
};

beforeEach(() => {
  requests = [];
  respond = () => {
    throw new Error('테스트 응답을 설정해야 합니다.');
  };
});

test('조회: 날짜 생략을 허용하고 부모 ID 생략을 null로 변환한다', async () => {
  respond = () => Response.json([comment]);

  assert.deepEqual(await readAllByApplicantId(11), [{ ...comment, parentCommentId: null }]);
  assert.equal(requests[0].method, 'GET');
  assert.equal(requests[0].url, 'https://scouter.test/applicants/11/documents/comments');
  assert.equal(requests[0].headers.get('accept'), 'application/json');
});

test('조회: 잘못된 응답은 화면에 전달하지 않는다', async () => {
  respond = () => Response.json([{ ...comment, content: 12 }]);
  await assert.rejects(readAllByApplicantId(11), ZodError);
});

test('등록: 답글 정보를 전송하고 빈 201 응답은 JSON으로 읽지 않는다', async (t) => {
  respond = () => new Response(null, { status: 201 });
  const json = t.mock.method(Response.prototype, 'json');
  const data = { content: '새 코멘트', sectionId: 2, parentCommentId: 7 };

  assert.equal(await create3(11, data), undefined);
  assert.equal(json.mock.callCount(), 0);
  assert.equal(requests.length, 1);
  assert.equal(requests[0].method, 'POST');
  assert.equal(requests[0].url, 'https://scouter.test/applicants/11/documents/comments');
  assert.equal(requests[0].headers.get('content-type'), 'application/json');
  assert.deepEqual(JSON.parse(await requests[0].text()), data);
});

test('등록: 빈 내용은 요청 전에 차단한다', async () => {
  await assert.rejects(async () => create3(11, { content: '', sectionId: 2 }), ZodError);
  assert.equal(requests.length, 0);
});

test('수정: 공유 응답 스키마의 날짜·부모 ID 생략 처리를 유지한다', async () => {
  const editedComment = { ...comment, content: '수정했어요.', isEdited: true };
  respond = () => Response.json(editedComment);

  const result = await patchApplicantDocumentComment({
    applicantId: 11,
    commentId: 7,
    data: { content: editedComment.content },
  });
  assert.deepEqual(result, { ...editedComment, parentCommentId: null });
});

test('조회: HTTP 오류를 호출한 곳으로 전달한다', async () => {
  respond = () => new Response(null, { status: 503 });
  await assert.rejects(readAllByApplicantId(11), HTTPError);
});

test('등록: 네트워크 오류를 호출한 곳으로 전달한다', async () => {
  const failure = new TypeError('Network unavailable');
  respond = () => {
    throw failure;
  };
  await assert.rejects(
    create3(11, { content: '새 코멘트', sectionId: 2 }),
    (error: unknown) => error === failure,
  );
});

test('조회: 빈 목록과 기존 숫자·부모 null 허용을 유지한다', async () => {
  respond = () => Response.json([]);
  assert.deepEqual(await readAllByApplicantId(11), []);

  const item = {
    ...comment,
    author: { ...comment.author, userId: 3.5 },
    commentId: 7.5,
    parentCommentId: null,
    sectionId: 2.5,
  };
  respond = () => Response.json([item]);
  assert.deepEqual(await readAllByApplicantId(11), [item]);
});

test('등록: 생성 함수가 검사한 본문만 전송한다', async () => {
  respond = () => new Response(null, { status: 201 });
  const data = { content: '새 코멘트', ignored: '전송하지 않는 값', sectionId: 2.5 };
  await create3(11, data);
  assert.deepEqual(JSON.parse(await requests[0].text()), { content: data.content, sectionId: 2.5 });
});

test('Query: 기본 생성 options도 기존 키로 캐시를 갱신하고 지원자별로 구분한다', async () => {
  respond = () => Response.json([comment]);
  const client = new QueryClient({ defaultOptions: { queries: { retry: false, gcTime: 0 } } });
  try {
    const generatedOptions = getReadAllByApplicantIdSuspenseQueryOptions(11);
    assert.deepEqual(generatedOptions.queryKey, commentsQueryKey(11));
    await client.prefetchQuery(generatedOptions);
    await client.prefetchQuery(applicantDocumentCommentsOption(12));
    assert.deepEqual(client.getQueryData(commentsQueryKey(11)), [
      { ...comment, parentCommentId: null },
    ]);
    await client.invalidateQueries({ queryKey: commentsQueryKey(11), refetchType: 'none' });
    assert.equal(client.getQueryState(commentsQueryKey(11))?.isInvalidated, true);
    assert.equal(client.getQueryState(commentsQueryKey(12))?.isInvalidated, false);
  } finally {
    client.clear();
  }
});

test('Mutation: 생성 options가 등록을 실행하고 검증 오류는 전송 전에 전달한다', async () => {
  respond = () => new Response(null, { status: 201 });
  const client = new QueryClient();
  try {
    const data = { content: '새 답글', parentCommentId: 7, sectionId: 2 };
    const success = client.getMutationCache().build(client, getCreate3MutationOptions());
    assert.equal(await success.execute({ applicantId: 11, data }), undefined);
    assert.deepEqual(JSON.parse(await requests[0].text()), data);

    const failure = client.getMutationCache().build(client, getCreate3MutationOptions());
    await assert.rejects(
      failure.execute({ applicantId: 11, data: { ...data, content: '' } }),
      ZodError,
    );
    assert.equal(requests.length, 1);
  } finally {
    client.clear();
  }
});

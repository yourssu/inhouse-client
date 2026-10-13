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
const {
  getApplicantDocumentComments,
  patchApplicantDocumentComment,
  postApplicantDocumentComment,
} = await import('../src/apis/documents/index');

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

  assert.deepEqual(await getApplicantDocumentComments(11), [{ ...comment, parentCommentId: null }]);
  assert.equal(requests[0].method, 'GET');
  assert.equal(requests[0].url, 'https://scouter.test/applicants/11/documents/comments');
});

test('조회: 잘못된 응답은 화면에 전달하지 않는다', async () => {
  respond = () => Response.json([{ ...comment, content: 12 }]);
  await assert.rejects(getApplicantDocumentComments(11), ZodError);
});

test('등록: 답글 정보를 전송하고 빈 201 응답은 JSON으로 읽지 않는다', async (t) => {
  respond = () => new Response(null, { status: 201 });
  const json = t.mock.method(Response.prototype, 'json');
  const data = { content: '새 코멘트', sectionId: 2, parentCommentId: 7 };

  assert.equal(await postApplicantDocumentComment({ applicantId: 11, data }), undefined);
  assert.equal(json.mock.callCount(), 0);
  assert.equal(requests.length, 1);
  assert.equal(requests[0].method, 'POST');
  assert.equal(requests[0].url, 'https://scouter.test/applicants/11/documents/comments');
  assert.equal(requests[0].headers.get('content-type'), 'application/json');
  assert.deepEqual(JSON.parse(await requests[0].text()), data);
});

test('등록: 빈 내용은 요청 전에 차단한다', async () => {
  await assert.rejects(
    postApplicantDocumentComment({ applicantId: 11, data: { content: '', sectionId: 2 } }),
    ZodError,
  );
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
  await assert.rejects(getApplicantDocumentComments(11), HTTPError);
});

test('등록: 네트워크 오류를 호출한 곳으로 전달한다', async () => {
  const failure = new TypeError('Network unavailable');
  respond = () => {
    throw failure;
  };
  await assert.rejects(
    postApplicantDocumentComment({
      applicantId: 11,
      data: { content: '새 코멘트', sectionId: 2 },
    }),
    (error: unknown) => error === failure,
  );
});

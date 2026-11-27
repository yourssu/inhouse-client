import ky from 'ky';
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
const { create3, readAllByApplicantId } =
  await import('../src/apis/documents/generated/comments.gen');
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
});

test('조회: 잘못된 응답은 화면에 전달하지 않는다', async () => {
  respond = () => Response.json([{ ...comment, content: 12 }]);
  await assert.rejects(readAllByApplicantId(11), ZodError);
});

test('등록: 답글 정보를 전송하고 본문 없는 201 응답을 성공으로 처리한다', async () => {
  respond = () => new Response(null, { status: 201 });
  const data = { content: '새 코멘트', sectionId: 2, parentCommentId: 7 };

  assert.equal(await create3(11, data), undefined);
  assert.equal(requests.length, 1);
  assert.equal(requests[0].method, 'POST');
  assert.equal(requests[0].url, 'https://scouter.test/applicants/11/documents/comments');
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

test('조회 설정과 등록 후 갱신은 같은 지원자의 코멘트 키를 사용한다', () => {
  assert.deepEqual(applicantDocumentCommentsOption(11).queryKey, commentsQueryKey(11));
  assert.notDeepEqual(applicantDocumentCommentsOption(12).queryKey, commentsQueryKey(11));
});

import { http, HttpResponse } from 'msw';

import type { CommentType } from '@/apis/eval/comments/schema';

import { config } from '@/config';

// mocks/applicants.ts의 mockApplicant(김철수, applicantId 1) 하나에 달린 댓글이에요.
// 답글이 있는 스레드, 편집된 댓글, 원본이 삭제된 orphan 댓글까지 재현해요.
let comments: CommentType[] = [
  {
    commentId: 1,
    sectionId: 1,
    parentCommentId: null,
    content: '지원 동기가 구체적이고 진솔해서 좋아요.',
    author: { memberId: 101, nickname: 'Feca', part: 'Frontend' },
    createdAt: '2026-07-05T10:00:00.000Z',
    isEdited: false,
  },
  {
    commentId: 2,
    sectionId: 1,
    parentCommentId: 1,
    content: '저도 동의해요. 특히 협업 경험을 미리 언급한 점이 인상 깊었어요.',
    author: { memberId: 102, nickname: 'Ori', part: 'PM' },
    createdAt: '2026-07-05T10:05:00.000Z',
    isEdited: true,
  },
  {
    commentId: 3,
    sectionId: 1,
    parentCommentId: 1,
    content: '다만 구체적인 프로젝트명이 있었으면 더 좋았을 것 같아요.',
    author: { memberId: 103, nickname: 'Nova', part: 'Backend' },
    createdAt: '2026-07-05T10:12:00.000Z',
    isEdited: false,
  },
  {
    commentId: 4,
    sectionId: 2,
    parentCommentId: null,
    content: '마이그레이션 계획을 세우고 공유했다는 부분에서 커뮤니케이션 역량이 보여요.',
    author: { memberId: 104, nickname: 'Rian', part: 'Android' },
    createdAt: '2026-07-05T11:00:00.000Z',
    isEdited: false,
  },
  {
    commentId: 5,
    sectionId: 2,
    parentCommentId: 4,
    content: '맞아요, 문제 정의부터 해결까지 순서가 명확했어요.',
    author: { memberId: 105, nickname: 'Juno', part: 'iOS' },
    createdAt: '2026-07-05T11:08:00.000Z',
    isEdited: false,
  },
  {
    commentId: 6,
    sectionId: 3,
    parentCommentId: null,
    content: '다른 파트와의 협업 경험을 좀 더 자세히 들어보고 싶어요.',
    author: { memberId: 106, nickname: 'Mia', part: 'Product Design' },
    createdAt: '2026-07-05T13:30:00.000Z',
    isEdited: false,
  },
  {
    commentId: 7,
    sectionId: 3,
    parentCommentId: 999,
    content: '이 댓글은 원본 댓글이 삭제된 경우(orphan)를 재현해요.',
    author: { memberId: 107, nickname: 'Han', part: 'Legal' },
    createdAt: '2026-07-05T13:40:00.000Z',
    isEdited: false,
  },
];

export const handlers = [
  http.get(`${config.apiBaseURL}/applicants/:applicantId/documents/comments`, () => {
    return HttpResponse.json(comments);
  }),

  http.post(
    `${config.apiBaseURL}/applicants/:applicantId/documents/comments`,
    async ({ request }) => {
      const { content, sectionId, parentCommentId } = (await request.json()) as {
        content: string;
        parentCommentId?: null | number;
        sectionId: number;
      };

      const created: CommentType = {
        commentId: Math.max(0, ...comments.map((comment) => comment.commentId)) + 1,
        sectionId,
        parentCommentId: parentCommentId ?? null,
        content,
        author: { memberId: 100, nickname: '나', part: 'Frontend' },
        createdAt: new Date().toISOString(),
        isEdited: false,
      };
      comments = [...comments, created];

      return HttpResponse.json(created, { status: 201 });
    },
  ),

  http.patch(
    `${config.apiBaseURL}/applicants/:applicantId/documents/comments/:commentId`,
    async ({ params, request }) => {
      const commentId = Number(params.commentId);
      const { content } = (await request.json()) as { content: string };

      const target = comments.find((comment) => comment.commentId === commentId);
      if (!target) {
        return HttpResponse.json({ message: '지정한 코멘트를 찾을 수 없어요.' }, { status: 404 });
      }

      const updated: CommentType = { ...target, content, isEdited: true };
      comments = comments.map((comment) => (comment.commentId === commentId ? updated : comment));

      return HttpResponse.json(updated);
    },
  ),

  http.delete(
    `${config.apiBaseURL}/applicants/:applicantId/documents/comments/:commentId`,
    ({ params }) => {
      const commentId = Number(params.commentId);
      comments = comments.filter((comment) => comment.commentId !== commentId);
      return new HttpResponse(null, { status: 204 });
    },
  ),
];

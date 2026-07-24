import { http, HttpResponse } from 'msw';

import type { CommentType } from '@/apis/eval/comments/schema';

import { config } from '@/config';

const mockApplicantDocumentComments: CommentType[] = [
  {
    commentId: 1,
    sectionId: 1,
    parentCommentId: null,
    content: '문제 정의와 지표를 함께 본 경험이 좋아요.',
    author: { memberId: 5, nickname: 'Feca', part: 'Frontend' },
    createdAt: '2025-11-14T10:00:00Z',
    isEdited: false,
  },
  {
    commentId: 2,
    sectionId: 1,
    parentCommentId: 1,
    content: '저도 동의합니다. 특히 지표 선정 기준이 좋았어요.',
    author: { memberId: 6, nickname: 'Ori', part: 'PM' },
    createdAt: '2025-11-14T10:05:00Z',
    isEdited: true,
  },
  {
    commentId: 3,
    sectionId: 1,
    parentCommentId: 1,
    content: '이 부분은 조금 더 구체적인 수치가 있으면 좋을 것 같아요.',
    author: { memberId: 7, nickname: 'Nova', part: 'Backend' },
    createdAt: '2025-11-14T10:12:00Z',
    isEdited: false,
  },
  {
    commentId: 4,
    sectionId: 2,
    parentCommentId: null,
    content: '기술 스택 선택 이유가 명확하게 드러나 있어요.',
    author: { memberId: 8, nickname: 'Rian', part: 'Android' },
    createdAt: '2025-11-14T11:00:00Z',
    isEdited: false,
  },
  {
    commentId: 5,
    sectionId: 2,
    parentCommentId: 4,
    content: '맞아요, 특히 트레이드오프 설명이 인상 깊었습니다.',
    author: { memberId: 9, nickname: 'Juno', part: 'iOS' },
    createdAt: '2025-11-14T11:08:00Z',
    isEdited: false,
  },
  {
    commentId: 6,
    sectionId: 2,
    parentCommentId: null,
    content: '디자인 협업 경험을 좀 더 자세히 들어보고 싶어요.',
    author: { memberId: 10, nickname: 'Mia', part: 'Product Design' },
    createdAt: '2025-11-14T11:20:00Z',
    isEdited: false,
  },
  {
    commentId: 7,
    sectionId: 3,
    parentCommentId: null,
    content: '팀워크 관련 에피소드가 구체적이라 신뢰가 가요.',
    author: { memberId: 11, nickname: 'Dara', part: 'HR' },
    createdAt: '2025-11-14T13:30:00Z',
    isEdited: false,
  },
  {
    commentId: 8,
    sectionId: 3,
    parentCommentId: 7,
    content: '동의해요. 다만 성과 지표는 조금 아쉬워요.',
    author: { memberId: 12, nickname: 'Leo', part: 'Marketing' },
    createdAt: '2025-11-14T13:35:00Z',
    isEdited: false,
  },
  {
    commentId: 9,
    sectionId: 3,
    parentCommentId: 999,
    content: '이 댓글은 원본 댓글이 삭제된 경우를 재현합니다.',
    author: { memberId: 13, nickname: 'Han', part: 'Legal' },
    createdAt: '2025-11-14T13:40:00Z',
    isEdited: false,
  },
  {
    commentId: 10,
    sectionId: 1,
    parentCommentId: null,
    content: '전체적으로 완성도가 높은 서류예요.',
    author: { memberId: 14, nickname: 'Sori', part: 'Finance' },
    createdAt: '2025-11-14T14:00:00Z',
    isEdited: false,
  },
];

export const handlers = [
  http.get(`${config.apiBaseURL}/applicants/:applicantId/documents/comments`, () => {
    return HttpResponse.json(mockApplicantDocumentComments);
  }),
];

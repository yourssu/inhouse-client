import type { CommentType } from '@/apis/eval/comments/schema';

// TODO(SCO-140): 코멘트 조회 API를 연동하면 이 파일을 삭제한다.
export const mockComments: CommentType[] = [
  {
    author: { memberId: 1, nickname: '엔지', part: 'Frontend' },
    commentId: 1,
    content: '지원 동기가 구체적이라 좋네요. 실제 경험이 잘 드러납니다.',
    createdAt: '2026-07-20T10:12:00',
    isEdited: false,
    parentCommentId: null,
    sectionId: 1,
  },
  {
    author: { memberId: 2, nickname: '쭌', part: 'Backend' },
    commentId: 2,
    content: '동의합니다. 다만 팀 협업 경험은 조금 더 물어보면 좋겠어요.',
    createdAt: '2026-07-20T10:30:00',
    isEdited: true,
    parentCommentId: 1,
    sectionId: 1,
  },
  {
    author: { memberId: 3, nickname: '리버', part: 'Product Design' },
    commentId: 3,
    content: '면접에서 확인할 질문으로 메모해둘게요.',
    createdAt: '2026-07-20T11:05:00',
    isEdited: false,
    parentCommentId: 1,
    sectionId: 1,
  },
  {
    author: { memberId: 1, nickname: '엔지', part: 'Frontend' },
    commentId: 4,
    content: '이 항목은 답변이 다소 짧아요.',
    createdAt: '2026-07-21T09:00:00',
    isEdited: false,
    parentCommentId: null,
    sectionId: 2,
  },
  {
    author: { memberId: 4, nickname: '해리', part: 'Android' },
    commentId: 5,
    content: '프로젝트 규모와 본인 기여도가 명확해서 인상적이었습니다.',
    createdAt: '2026-07-21T14:22:00',
    isEdited: false,
    parentCommentId: null,
    sectionId: 3,
  },
];

import { compareAsc } from 'date-fns';

import type { CommentType } from '@/apis/documents/schema';

export type CommentThreadType = CommentType[];

const compareCommentCreatedAt = (a: CommentType, b: CommentType) => {
  if (!a.createdAt) {
    return b.createdAt ? 1 : 0;
  }
  if (!b.createdAt) {
    return -1;
  }
  return compareAsc(a.createdAt, b.createdAt);
};

/**
 * parentCommentId는 자신이 속한 스레드의 루트 댓글을 가리킨다(depth는 항상 1).
 * 한 루트에 달린 답글들은 서로 다른 답글이 아니라 모두 같은 parentCommentId를 공유한다.
 * 참조하는 루트가 목록에 없으면(orphan) 해당 댓글을 자체 스레드의 시작으로 취급한다.
 */
const isThreadStart = (comment: CommentType, commentById: Map<number, CommentType>): boolean =>
  comment.parentCommentId === null || !commentById.has(comment.parentCommentId);

/**
 * @example
 * // 반환값 형태 (Map<sectionId, threads>)
 * Map {
 *   1 => [
 *     [
 *       { commentId: 1, sectionId: 1, parentCommentId: null, content: '...', ... },
 *       { commentId: 2, sectionId: 1, parentCommentId: 1, content: '...', ... },
 *       { commentId: 3, sectionId: 1, parentCommentId: 1, content: '...', ... },
 *     ],
 *   ],
 * }
 */
export const groupThreadsBySection = (
  comments: readonly CommentType[],
): Map<number, CommentThreadType[]> => {
  const commentById = new Map(comments.map((comment) => [comment.commentId, comment]));

  const repliesByParentId = new Map<number, CommentType[]>();
  for (const comment of comments) {
    if (comment.parentCommentId !== null) {
      const replies = repliesByParentId.get(comment.parentCommentId) ?? [];
      replies.push(comment);
      repliesByParentId.set(comment.parentCommentId, replies);
    }
  }

  const threadsBySection = new Map<number, CommentThreadType[]>();
  for (const comment of comments) {
    if (!isThreadStart(comment, commentById)) {
      continue;
    }

    const replies = (repliesByParentId.get(comment.commentId) ?? [])
      .slice()
      .sort(compareCommentCreatedAt);
    const thread = [comment, ...replies];

    const sectionThreads = threadsBySection.get(comment.sectionId) ?? [];
    sectionThreads.push(thread);
    threadsBySection.set(comment.sectionId, sectionThreads);
  }

  for (const sectionThreads of threadsBySection.values()) {
    sectionThreads.sort((a, b) => compareCommentCreatedAt(a[0], b[0]));
  }

  return threadsBySection;
};

import { compareAsc } from 'date-fns';

import type { CommentType } from '@/apis/documents/schema';

type CommentThread = CommentType[];

export const groupCommentThreads = (
  comments: readonly CommentType[],
): Map<number, CommentThread[]> => {
  const commentById = new Map(comments.map((comment) => [comment.commentId, comment]));
  const repliesByParentId = new Map<number, CommentType[]>();

  for (const comment of comments) {
    if (comment.parentCommentId !== null) {
      const replies = repliesByParentId.get(comment.parentCommentId) ?? [];
      replies.push(comment);
      repliesByParentId.set(comment.parentCommentId, replies);
    }
  }

  const threadsBySection = new Map<number, CommentThread[]>();

  for (const comment of comments) {
    if (!isThreadStart(comment, commentById)) {
      continue;
    }

    const replies = (repliesByParentId.get(comment.commentId) ?? [])
      .slice()
      .sort(compareCommentCreatedAt);
    const sectionThreads = threadsBySection.get(comment.sectionId) ?? [];
    sectionThreads.push([comment, ...replies]);
    threadsBySection.set(comment.sectionId, sectionThreads);
  }

  for (const sectionThreads of threadsBySection.values()) {
    sectionThreads.sort((a, b) => compareCommentCreatedAt(a[0], b[0]));
  }

  return threadsBySection;
};

const isThreadStart = (comment: CommentType, commentById: Map<number, CommentType>): boolean =>
  comment.parentCommentId === null || !commentById.has(comment.parentCommentId);

const compareCommentCreatedAt = (a: CommentType, b: CommentType) => {
  if (!a.createdAt) {
    return b.createdAt ? 1 : 0;
  }
  if (!b.createdAt) {
    return -1;
  }
  return compareAsc(a.createdAt, b.createdAt);
};

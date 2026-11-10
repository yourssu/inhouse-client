import assert from 'node:assert/strict';
import { test } from 'node:test';

import { CommentSchema } from '../../src/apis/documents/schema';

const comment = {
  author: { userId: 1, nickname: '작성자', part: 'Backend' },
  commentId: 2,
  content: '코멘트',
  isEdited: false,
  sectionId: 3,
};

test('코멘트의 생략된 날짜와 부모 ID를 기존 화면 계약대로 처리한다', () => {
  assert.equal(CommentSchema.parse(comment).parentCommentId, null);
  assert.equal(CommentSchema.parse({ ...comment, parentCommentId: null }).parentCommentId, null);
  assert.equal(CommentSchema.parse({ ...comment, parentCommentId: 4 }).parentCommentId, 4);
  assert(CommentSchema.safeParse({ ...comment, createdAt: '2024-02-29T00:00:00Z' }).success);
  assert(CommentSchema.safeParse({ ...comment, createdAt: '2024-02-29T09:00:00+09:00' }).success);
  assert(!CommentSchema.safeParse({ ...comment, createdAt: '2025-02-29T00:00:00Z' }).success);
  assert(!CommentSchema.safeParse({ ...comment, createdAt: null }).success);
});

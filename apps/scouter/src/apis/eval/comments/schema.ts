import z from 'zod/v4';

import { PartNameSchema } from '@/apis/parts/schema';

export const CommentAuthorSchema = z.object({
  memberId: z.number(),
  nickname: z.string(),
  part: PartNameSchema,
});

export const CommentSchema = z.object({
  author: CommentAuthorSchema,
  commentId: z.number(),
  content: z.string(),
  createdAt: z.iso.datetime(),
  isEdited: z.boolean(),
  parentCommentId: z.number().nullable(),
  sectionId: z.number(),
});

export type CommentAuthorType = z.infer<typeof CommentAuthorSchema>;
export type CommentType = z.infer<typeof CommentSchema>;

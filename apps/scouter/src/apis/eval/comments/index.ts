import { api } from '@/apis/api';
import { CommentSchema } from '@/apis/eval/comments/schema';

export type DeleteCommentParams = {
  applicantId: number;
  commentId: number;
};

export const getApplicantDocumentComments = async (applicantId: number) => {
  const response = await api.get(`applicants/${applicantId}/documents/comments`).json();
  return CommentSchema.array().parse(response);
};

export const deleteApplicantDocumentComment = async ({
  applicantId,
  commentId,
}: DeleteCommentParams) => {
  await api.delete(`applicants/${applicantId}/documents/comments/${commentId}`);
};

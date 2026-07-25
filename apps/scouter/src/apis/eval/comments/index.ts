import { api } from '@/apis/api';
import { CommentSchema, type UpdateCommentRequestType } from '@/apis/eval/comments/schema';

export const getApplicantDocumentComments = async (applicantId: number) => {
  const response = await api.get(`applicants/${applicantId}/documents/comments`).json();
  return CommentSchema.array().parse(response);
};

// TODO(SCO-141): 코멘트 삭제 API

export type UpdateCommentParams = {
  applicantId: number;
  commentId: number;
  data: UpdateCommentRequestType;
};

export const patchApplicantDocumentComment = async ({
  applicantId,
  commentId,
  data,
}: UpdateCommentParams) => {
  const response = await api
    .patch(`applicants/${applicantId}/documents/comments/${commentId}`, { json: data })
    .json();
  return CommentSchema.parse(response);
};

// TODO(SCO-143): 코멘트 생성 API

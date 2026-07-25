import { api } from '@/apis/api';
import { CommentSchema } from '@/apis/eval/comments/schema';

export const getApplicantDocumentComments = async (applicantId: number) => {
  const response = await api.get(`applicants/${applicantId}/documents/comments`).json();
  return CommentSchema.array().parse(response);
};

// TODO(SCO-141): 코멘트 삭제 API

// TODO(SCO-142): 코멘트 수정 API

// TODO(SCO-143): 코멘트 생성 API

import type { UpdateApplicantDocumentEvaluationRequestType } from '@/apis/documents/schema';

import { api } from '@/apis/api';
import {
  ApplicantDocumentEvaluationsResponseSchema,
  ApplicantDocumentOthersEvaluationsSchema,
  CommentSchema,
  CreateCommentRequestSchema,
  type CreateCommentRequestType,
  DocumentEvaluatorStatusesSchema,
  PartDocumentsDeadlineSchema,
  PartDocumentsRubricsSchema,
  UpdateApplicantDocumentEvaluationRequestSchema,
  UpdateCommentRequestSchema,
  type UpdateCommentRequestType,
  type UpdatePartDocumentRubricsRequestType,
  UpdatePartDocumentsRubricsRequestSchema,
} from '@/apis/documents/schema';

export type PutApplicantDocumentEvaluationsParams = {
  applicantId: number;
  data: UpdateApplicantDocumentEvaluationRequestType;
};

export const getApplicantDocumentsEvaluations = async (applicantId: number) => {
  const res = await api.get(`/applicants/${applicantId}/documents/evaluations`).json();

  return ApplicantDocumentEvaluationsResponseSchema.parse(res);
};

export const getApplicantDocumentsOthersEvaluations = async (applicantId: number) => {
  const res = await api.get(`applicants/${applicantId}/documents/evaluations/others`).json();

  return ApplicantDocumentOthersEvaluationsSchema.parse(res);
};

export const getApplicantDocumentEvaluatorStatuses = async (applicantId: number) => {
  const res = await api.get(`applicants/${applicantId}/documents/evaluations/status`).json();
  return DocumentEvaluatorStatusesSchema.parse(res);
};

export const getPartDocumentsDeadline = async (partId: number) => {
  const res = await api.get(`parts/${partId}/documents/deadline`).json();
  return PartDocumentsDeadlineSchema.parse(res);
};

export const putApplicantDocumentEvaluations = async ({
  applicantId,
  data,
}: PutApplicantDocumentEvaluationsParams) => {
  const request = UpdateApplicantDocumentEvaluationRequestSchema.parse(data);
  await api.put(`/applicants/${applicantId}/documents/evaluations`, { json: request });
};

export const getApplicantDocumentComments = async (applicantId: number) => {
  const response = await api.get(`applicants/${applicantId}/documents/comments`).json();
  return CommentSchema.array().parse(response);
};

export type CreateCommentParams = {
  applicantId: number;
  data: CreateCommentRequestType;
};

export const postApplicantDocumentComment = async ({ applicantId, data }: CreateCommentParams) => {
  const request = CreateCommentRequestSchema.parse(data);
  const response = await api.post(`applicants/${applicantId}/documents/comments`, {
    json: request,
  });
  const commentId = Number(response.headers.get('Location')?.split('/').at(-1));
  // 헤더를 읽지 못해도 성공한 저장을 실패로 처리하지 않는다.
  return Number.isSafeInteger(commentId) && commentId > 0 ? commentId : undefined;
};
export type DeleteCommentParams = {
  applicantId: number;
  commentId: number;
};

export const deleteApplicantDocumentComment = async ({
  applicantId,
  commentId,
}: DeleteCommentParams) => {
  await api.delete(`applicants/${applicantId}/documents/comments/${commentId}`);
};

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
  const request = UpdateCommentRequestSchema.parse(data);
  const response = await api
    .patch(`applicants/${applicantId}/documents/comments/${commentId}`, { json: request })
    .json();
  return CommentSchema.parse(response);
};

export const getPartDocumentsRubrics = async (partId: number) => {
  const res = await api.get(`parts/${partId}/documents/rubrics`).json();
  return PartDocumentsRubricsSchema.parse(res);
};

type PutPartDocumentRubricsParams = {
  data: UpdatePartDocumentRubricsRequestType;
  partId: number;
};

export const putPartDocumentsRubrics = async ({ partId, data }: PutPartDocumentRubricsParams) => {
  const request = UpdatePartDocumentsRubricsRequestSchema.parse(data);
  await api.put(`parts/${partId}/documents/rubrics`, { json: request });
};

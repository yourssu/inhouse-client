import z from 'zod/v4';

import {
  ReadDocumentCommentResponse as GeneratedCommentResponse,
  CreateDocumentCommentRequest as GeneratedCreateCommentRequest,
  ReadDocumentCommentAuthorResponse,
} from '@/apis/documents/generated/comments.schema.gen';

const documentResults = ['PENDING', 'DOCUMENT_PASS', 'DOCUMENT_FAIL'] as const;
const DocumentResultSchema = z.enum(documentResults);

export const DocumentEvaluatorStatusValueSchema = z.enum([
  'NOT_STARTED',
  'IN_PROGRESS',
  'SUBMITTED',
]);

export const DocumentEvaluatorStatusSchema = z.object({
  memberId: z.number(),
  // User 엔티티가 없는 평가자는 userId가 null로 내려와요. 고유 식별자로는 memberId를 사용해요.
  userId: z.number().nullable(),
  name: z.string(),
  nickname: z.string(),
  status: DocumentEvaluatorStatusValueSchema,
});

export const DocumentEvaluatorStatusesSchema = z.array(DocumentEvaluatorStatusSchema);

export const ApplicantDocumentOthersEvaluationsSchema = z.array(
  z.object({
    evaluatorId: z.number(),
    evaluatorName: z.string(),
    evaluatorNickname: z.string(),
    totalScore: z.number(),
    result: DocumentResultSchema,
    overallComment: z.string(),
    items: z.array(
      z.object({
        sectionId: z.number(),
        score: z.number(),
        memo: z.string(),
      }),
    ),
  }),
);

export const ApplicantDocumentEvaluationsResponseSchema = z.object({
  totalScore: z.number(),
  items: z.array(
    z.object({
      sectionId: z.number(),
      question: z.string(),
      maxScore: z.number(),
      score: z.number(),
      memo: z.string(),
    }),
  ),
  overallComment: z.string(),
  result: DocumentResultSchema,
  submittedAt: z.iso.datetime().nullish(),
});

export const documentKoreanResults = ['보류', '서류 합격', '서류 불합격'] as const;
export const DOCUMENT_EVALUATION_SCORE_MINIMUM_ERROR = '점수는 1점 이상이어야 해요.';
export const DOCUMENT_EVALUATION_RESULT_REQUIRED_ERROR = '평가 결과를 선택해 주세요.';
export const UpdateApplicantDocumentEvaluationFormSchema = z.object({
  items: z.array(
    z.object({
      sectionId: z.number(),
      score: z
        .string()
        .regex(/^\d+$/, '점수를 입력해 주세요.')
        .transform(Number)
        .refine((score) => score >= 1, DOCUMENT_EVALUATION_SCORE_MINIMUM_ERROR),
      memo: z.string(),
    }),
  ),
  overallComment: z.string(),
  result: z.enum(documentKoreanResults, { error: DOCUMENT_EVALUATION_RESULT_REQUIRED_ERROR }),
});

export const UpdateApplicantDocumentEvaluationRequestSchema = z.object({
  items: z.array(
    z.object({
      sectionId: z.number(),
      score: z.number(),
      memo: z.string(),
    }),
  ),
  overallComment: z.string(),
  result: DocumentResultSchema,
  submit: z.boolean(),
});

export type ApplicantDocumentEvaluationsResponseType = z.infer<
  typeof ApplicantDocumentEvaluationsResponseSchema
>;
export type ApplicantDocumentOthersEvaluationsType = z.infer<
  typeof ApplicantDocumentOthersEvaluationsSchema
>;
export type UpdateApplicantDocumentEvaluationFormType = z.infer<
  typeof UpdateApplicantDocumentEvaluationFormSchema
>;
export type UpdateApplicantDocumentEvaluationFormInputType = z.input<
  typeof UpdateApplicantDocumentEvaluationFormSchema
>;
export type UpdateApplicantDocumentEvaluationRequestType = z.infer<
  typeof UpdateApplicantDocumentEvaluationRequestSchema
>;

export type DocumentEvaluatorStatusValue = z.infer<typeof DocumentEvaluatorStatusValueSchema>;
export type DocumentEvaluatorStatus = z.infer<typeof DocumentEvaluatorStatusSchema>;
export type DocumentEvaluatorStatuses = z.infer<typeof DocumentEvaluatorStatusesSchema>;

// 호환 규칙: 자동 생성 도입과 기존 검증 정책 변경을 분리합니다.
export const CommentAuthorSchema = ReadDocumentCommentAuthorResponse.extend({
  userId: z.number(),
});

export const ReadDocumentCommentResponse = GeneratedCommentResponse.extend({
  author: CommentAuthorSchema,
  commentId: z.number(),
  // 기존처럼 작성 시각 생략을 허용하며, 날짜는 UTC 형식으로 검증합니다.
  createdAt: z.iso.datetime().optional(),
  parentCommentId: z
    .number()
    .nullish()
    .transform((parentCommentId) => parentCommentId ?? null),
  sectionId: z.number(),
});
export type ReadDocumentCommentResponse = z.infer<typeof ReadDocumentCommentResponse>;

export const CreateDocumentCommentRequest = GeneratedCreateCommentRequest.extend({
  parentCommentId: z.number().optional(),
  sectionId: z.number(),
});
export type CreateDocumentCommentRequest = z.infer<typeof CreateDocumentCommentRequest>;

export const UpdateCommentRequestSchema = z.object({
  content: z.string().min(1),
});

export type CommentAuthorType = z.infer<typeof CommentAuthorSchema>;
export type UpdateCommentRequestType = z.infer<typeof UpdateCommentRequestSchema>;

// 기존 사용처의 이름도 같은 스키마와 타입으로 연결합니다.
export {
  ReadDocumentCommentResponse as CommentSchema,
  CreateDocumentCommentRequest as CreateCommentRequestSchema,
};
export type {
  ReadDocumentCommentResponse as CommentType,
  CreateDocumentCommentRequest as CreateCommentRequestType,
};

export const PartDocumentRubricSchema = z.object({
  sectionId: z.number(),
  question: z.string(),
  maxScore: z.number(),
  criterionDetail: z.string(),
});
export const PartDocumentsRubricsSchema = z.object({
  isLocked: z.boolean(),
  rubrics: z.array(PartDocumentRubricSchema),
});

export const PartDocumentsDeadlineSchema = z.object({
  deadline: z.iso.datetime(),
});

export const UpdatePartDocumentsRubricsRequestSchema = z.array(
  z.object({
    sectionId: z.number(),
    maxScore: z.number(),
    criterionDetail: z.string(),
  }),
);

export type PartDocumentRubricsType = z.infer<typeof PartDocumentsRubricsSchema>;
export type UpdatePartDocumentRubricsRequestType = z.infer<
  typeof UpdatePartDocumentsRubricsRequestSchema
>;
export type PartDocumentRubricType = z.infer<typeof PartDocumentRubricSchema>;
export type PartDocumentsDeadlineType = z.infer<typeof PartDocumentsDeadlineSchema>;

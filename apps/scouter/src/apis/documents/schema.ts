import z from 'zod/v4';

const documentResults = ['PENDING', 'DOCUMENT_PASS', 'DOCUMENT_FAIL'] as const;
const DocumentResultSchema = z.enum(documentResults);

export const DocumentEvaluatorStatusValueSchema = z.enum([
  'NOT_STARTED',
  'IN_PROGRESS',
  'SUBMITTED',
]);

export const DocumentEvaluatorStatusSchema = z.object({
  userId: z.number(),
  name: z.string(),
  status: DocumentEvaluatorStatusValueSchema,
});

export const DocumentEvaluatorStatusesSchema = z.array(DocumentEvaluatorStatusSchema);

export const ApplicantDocumentOthersEvaluationsSchema = z.array(
  z.object({
    evaluatorId: z.number(),
    evaluatorName: z.string(),
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
export const UpdateApplicantDocumentEvaluationFormSchema = z.object({
  items: z.array(
    z.object({
      sectionId: z.number(),
      score: z
        .string()
        .regex(/^\d+$/, '점수를 입력해 주세요.')
        .transform(Number)
        .refine((score) => score >= 1, '점수는 1점 이상이어야 해요.'),
      memo: z.string(),
    }),
  ),
  overallComment: z.string(),
  result: z.enum(documentKoreanResults, { error: '상태평가를 선택해 주세요.' }),
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

export const CommentAuthorSchema = z.object({
  nickname: z.string(),
  part: z.string(),
  userId: z.number(),
});

export const CommentSchema = z.object({
  author: CommentAuthorSchema,
  commentId: z.number(),
  content: z.string(),
  createdAt: z.iso.datetime().optional(),
  isEdited: z.boolean(),
  parentCommentId: z
    .number()
    .nullish()
    .transform((parentCommentId) => parentCommentId ?? null),
  sectionId: z.number(),
});

export const CreateCommentRequestSchema = z.object({
  content: z.string().min(1),
  parentCommentId: z.number().optional(),
  sectionId: z.number(),
});

export const UpdateCommentRequestSchema = z.object({
  content: z.string().min(1),
});

export type CommentAuthorType = z.infer<typeof CommentAuthorSchema>;
export type CommentType = z.infer<typeof CommentSchema>;
export type CreateCommentRequestType = z.infer<typeof CreateCommentRequestSchema>;
export type UpdateCommentRequestType = z.infer<typeof UpdateCommentRequestSchema>;

export const PartDocumentRubricSchema = z.object({
  sectionId: z.number(),
  question: z.string(),
  maxScore: z.number(),
  criterionDetail: z.string(),
});
export const PartDocumentsRubricsSchema = z.array(PartDocumentRubricSchema);

export const PartDocumentsDeadlineSchema = z.object({
  deadline: z.iso.datetime(),
});

export const UpdatePartDocumentsRubricsFormSchema = z.object({
  rubrics: z.array(
    z.object({
      sectionId: z.number(),
      maxScore: z.string().min(1).regex(/^\d+$/).transform(Number),
      criterionDetail: z.string(),
    }),
  ),
});

export const UpdatePartDocumentsRubricsRequestSchema = z.array(
  z.object({
    sectionId: z.number(),
    maxScore: z.number(),
    criterionDetail: z.string(),
  }),
);

export type PartDocumentRubricsType = z.infer<typeof PartDocumentsRubricsSchema>;
export type UpdatePartDocumentsRubricsFormType = z.infer<
  typeof UpdatePartDocumentsRubricsFormSchema
>;
export type UpdatePartDocumentRubricsRequestType = z.infer<
  typeof UpdatePartDocumentsRubricsRequestSchema
>;
export type PartDocumentRubricType = z.infer<typeof PartDocumentRubricSchema>;
export type PartDocumentsDeadlineType = z.infer<typeof PartDocumentsDeadlineSchema>;

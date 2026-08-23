import { z } from 'zod/v4';

export const InterviewEvaluationResultSchema = z.enum(['PENDING', 'FINAL_PASS', 'INTERVIEW_FAIL']);

export const InterviewEvaluationGroupTypeSchema = z.enum(['CULTURE_FIT', 'TEAM_FIT', 'JOB_FIT']);

export const InterviewEvaluationItemSchema = z.object({
  itemId: z.int(),
  itemTitle: z.string(),
  maxScore: z.int32(),
  score: z.int32(),
});

export const InterviewEvaluationGroupSchema = z.object({
  group: InterviewEvaluationGroupTypeSchema,
  items: z.array(InterviewEvaluationItemSchema),
});

export const MyInterviewEvaluationSchema = z.object({
  totalScore: z.int32(),
  groups: z.array(InterviewEvaluationGroupSchema),
  overallComment: z.string(),
  result: InterviewEvaluationResultSchema.nullish(),
  submittedAt: z.iso.datetime({ local: true, offset: true }).nullish(),
});

export const InterviewEvaluatorStatusValueSchema = z.enum([
  'NOT_STARTED',
  'IN_PROGRESS',
  'SUBMITTED',
]);

export const InterviewEvaluatorStatusSchema = z.object({
  memberId: z.int(),
  // User 엔티티가 없는 평가자는 userId가 null로 내려와요. 고유 식별자로는 memberId를 사용해요.
  userId: z.int().nullable(),
  name: z.string(),
  nickname: z.string().nullish(),
  status: InterviewEvaluatorStatusValueSchema,
});

export const InterviewEvaluatorStatusesSchema = z.array(InterviewEvaluatorStatusSchema);

export const OtherInterviewEvaluationItemSchema = z.object({
  itemId: z.int(),
  score: z.int32(),
});

export const OtherInterviewEvaluationSchema = z.object({
  evaluatorId: z.int(),
  evaluatorName: z.string(),
  evaluatorNickname: z.string().nullish(),
  totalScore: z.int32(),
  result: InterviewEvaluationResultSchema,
  overallComment: z.string(),
  items: z.array(OtherInterviewEvaluationItemSchema),
});

export const OtherInterviewEvaluationsSchema = z.array(OtherInterviewEvaluationSchema);

export const SaveInterviewEvaluationItemSchema = z.object({
  itemId: z.int(),
  score: z.int32().min(1),
});

export const SaveInterviewEvaluationRequestSchema = z.object({
  items: z.array(SaveInterviewEvaluationItemSchema).min(1),
  overallComment: z.string(),
  result: InterviewEvaluationResultSchema,
  submit: z.boolean(),
});

export type InterviewEvaluationResult = z.infer<typeof InterviewEvaluationResultSchema>;
export type InterviewEvaluationGroupType = z.infer<typeof InterviewEvaluationGroupTypeSchema>;
export type InterviewEvaluationItem = z.infer<typeof InterviewEvaluationItemSchema>;
export type InterviewEvaluationGroup = z.infer<typeof InterviewEvaluationGroupSchema>;
export type MyInterviewEvaluation = z.infer<typeof MyInterviewEvaluationSchema>;
export type InterviewEvaluatorStatusValue = z.infer<typeof InterviewEvaluatorStatusValueSchema>;
export type InterviewEvaluatorStatus = z.infer<typeof InterviewEvaluatorStatusSchema>;
export type OtherInterviewEvaluationItem = z.infer<typeof OtherInterviewEvaluationItemSchema>;
export type OtherInterviewEvaluation = z.infer<typeof OtherInterviewEvaluationSchema>;
export type InterviewEvaluatorStatuses = z.infer<typeof InterviewEvaluatorStatusesSchema>;
export type SaveInterviewEvaluationItem = z.infer<typeof SaveInterviewEvaluationItemSchema>;
export type SaveInterviewEvaluationRequest = z.infer<typeof SaveInterviewEvaluationRequestSchema>;

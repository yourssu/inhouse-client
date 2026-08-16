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
  result: InterviewEvaluationResultSchema,
  submittedAt: z.iso.datetime({ offset: true }).nullish(),
});

export const InterviewEvaluatorStatusValueSchema = z.enum([
  'NOT_STARTED',
  'IN_PROGRESS',
  'SUBMITTED',
]);

export const InterviewEvaluatorStatusSchema = z.object({
  userId: z.int(),
  name: z.string(),
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
  totalScore: z.int32(),
  result: InterviewEvaluationResultSchema,
  overallComment: z.string(),
  items: z.array(OtherInterviewEvaluationItemSchema),
});

export const OtherInterviewEvaluationsSchema = z.array(OtherInterviewEvaluationSchema);

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
